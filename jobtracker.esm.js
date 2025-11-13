// ESM version of JobTracker demo for projects with "type":"module"
// Run: node jobtracker.esm.js

import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_demo';

const db = { users: [], jobs: [], sessions: {} };
const uid = (prefix = 'id') => prefix + '_' + Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

app.use(express.json({ limit: '5mb' }));
app.use(cors());

function authMiddleware(req, res, next) {
   const auth = req.headers.authorization;
   if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
   const token = auth.slice(7);
   try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = db.users.find(u => u.id === payload.sub);
      if (!user) return res.status(401).json({ message: 'Invalid token: user not found' });
      req.user = user;
      next();
   } catch (e) {
      return res.status(401).json({ message: 'Invalid token' });
   }
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/api/auth/register', async (req, res) => {
   const { name, email, password } = req.body;
   if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });
   if (db.users.some(u => u.email === email)) return res.status(400).json({ message: 'User exists' });
   const passwordHash = await bcrypt.hash(password, 10);
   const user = { id: uid('usr'), name, email, passwordHash, profile: {}, resumes: [], skills: [], prefs: {}, createdAt: now() };
   db.users.push(user);
   const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' });
   res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

app.post('/api/auth/login', async (req, res) => {
   const { email, password } = req.body;
   const user = db.users.find(u => u.email === email);
   if (!user) return res.status(401).json({ message: 'Invalid credentials' });
   const ok = await bcrypt.compare(password, user.passwordHash);
   if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
   const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '30d' });
   res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
});

app.get('/api/users/me', authMiddleware, (req, res) => {
   const u = req.user;
   res.json({ id: u.id, name: u.name, email: u.email, profile: u.profile, skills: u.skills, resumes: u.resumes.map(r => ({ id: r.id, name: r.name })), prefs: u.prefs });
});

app.post('/api/users/me/upload-resume', authMiddleware, upload.single('resume'), (req, res) => {
   const u = req.user;
   if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
   const id = uid('res');
   const record = { id, name: req.file.originalname, data: req.file.buffer.toString('base64'), uploadedAt: now() };
   u.resumes.push(record);
   res.json({ message: 'Resume uploaded', resume: { id: record.id, name: record.name } });
});

app.post('/api/jobs', authMiddleware, (req, res) => {
   const { title, company, location, remote = false, description = '', skills = [], salaryRange } = req.body;
   const job = { id: uid('job'), title, company, location, remote, description, skills, salaryRange, postedBy: req.user.id, applicants: [], createdAt: now() };
   db.jobs.push(job);
   io.emit('job:posted', job);
   res.json({ job });
});

app.get('/api/jobs', (req, res) => {
   const { q, skill, remote } = req.query;
   let results = db.jobs.slice().reverse();
   if (q) { const ql = q.toString().toLowerCase(); results = results.filter(j => (j.title + ' ' + j.company + ' ' + j.description).toLowerCase().includes(ql)); }
   if (skill) results = results.filter(j => j.skills.includes(skill));
   if (remote !== undefined) results = results.filter(j => String(j.remote) === String(remote));
   res.json({ jobs: results });
});

app.post('/api/jobs/:id/apply', authMiddleware, (req, res) => {
   const job = db.jobs.find(j => j.id === req.params.id);
   if (!job) return res.status(404).json({ message: 'Job not found' });
   if (job.applicants.includes(req.user.id)) return res.status(400).json({ message: 'Already applied' });
   job.applicants.push(req.user.id);
   io.to(req.user.id).emit('application:status', { jobId: job.id, status: 'applied', at: now() });
   res.json({ message: 'Applied', jobId: job.id });
});

app.post('/api/ai/rewrite-resume', authMiddleware, async (req, res) => {
   const { resumeId, jobTitle, rawText } = req.body;
   let text = rawText;
   if (!text && resumeId) {
      const r = (req.user.resumes || []).find(x => x.id === resumeId);
      if (r) text = Buffer.from(r.data, 'base64').toString('utf8').slice(0, 3000);
   }
   if (!text) return res.status(400).json({ message: 'No resume text provided' });
   const rewritten = `--- AI-Optimized Resume (${jobTitle || 'general'}) ---\n\n${text}\n\n[AI SUGGESTIONS]\n- Tailor bullets to metrics\n- Add keywords from job postings\n---`;
   res.json({ rewritten });
});

app.post('/api/ai/match-score', authMiddleware, (req, res) => {
   const { jobId } = req.body;
   const job = db.jobs.find(j => j.id === jobId);
   if (!job) return res.status(404).json({ message: 'Job not found' });
   const userSkills = new Set((req.user.skills || []).map(s => s.toLowerCase()));
   const needed = job.skills || [];
   const overlap = needed.filter(s => userSkills.has(s.toLowerCase())).length;
   const score = Math.round((overlap / Math.max(1, needed.length)) * 100);
   res.json({ score, overlap, needed });
});

app.post('/api/ai/chat', authMiddleware, async (req, res) => {
   const { message } = req.body;
   const reply = `Career Assistant: I got your message "${message.slice(0, 120)}". Here are quick actions I can do:\n1) Suggest jobs\n2) Rewrite your resume\n3) Practice interview Q&A\n(Use the UI controls to call specific endpoints.)`;
   res.json({ reply });
});

io.on('connection', (socket) => {
   socket.on('identify', (userId) => { socket.join(userId); });
   socket.on('ping', (data) => { socket.emit('pong', { at: now(), data }); });
});

app.get('/', (req, res) => {
   res.send('<html><body><h3>JobTracker ESM Demo - visit /api/jobs</h3></body></html>');
});

(function seed() {
   if (db.users.length) return;
   (async () => {
      const pass = await bcrypt.hash('password', 10);
      const u1 = { id: uid('usr'), name: 'Ravi Kumar', email: 'ravi@example.com', passwordHash: pass, profile: { headline: 'Frontend Engineer' }, resumes: [], skills: ['JavaScript', 'React', 'Node.js'], prefs: {}, createdAt: now() };
      const u2 = { id: uid('usr'), name: 'Priya Sharma', email: 'priya@example.com', passwordHash: pass, profile: { headline: 'Data Scientist' }, resumes: [], skills: ['Python', 'ML', 'Pandas'], prefs: {}, createdAt: now() };
      db.users.push(u1, u2);
      db.jobs.push({ id: uid('job'), title: 'Senior Frontend Engineer', company: 'NovaTech', location: 'Bengaluru, India', remote: true, description: 'Work on modern React apps, build performant UIs, mentor juniors.', skills: ['JavaScript', 'React', 'TypeScript'], salaryRange: { min: 1200000, max: 2000000 }, postedBy: u1.id, applicants: [], createdAt: now() });
      db.jobs.push({ id: uid('job'), title: 'Machine Learning Engineer', company: 'Aether Labs', location: 'Remote', remote: true, description: 'Build models, deploy ML services, collaborate across teams.', skills: ['Python', 'ML', 'TensorFlow'], salaryRange: { min: 1500000, max: 2500000 }, postedBy: u2.id, applicants: [], createdAt: now() });
      console.log('Seeded demo users and jobs. Login with ravi@example.com / password or priya@example.com / password');
   })();
})();

server.listen(PORT, () => { console.log('JobTracker demo (ESM) running at http://localhost:' + PORT); });
