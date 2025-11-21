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
<<<<<<< HEAD
   res.setHeader('Content-Type', 'text/html');
   res.send(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Ultimate JobTracker — Demo</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body { font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin:0; padding:0; background:#f5f7fb; color:#111; }
      .app { max-width:1000px; margin:24px auto; padding:20px; background:white; border-radius:10px; box-shadow:0 6px 24px rgba(15,23,42,0.08); }
      header { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
      .grid { display:grid; grid-template-columns: 1fr 320px; gap:16px; }
      input, textarea, button, select { font-size:14px; padding:8px; border-radius:6px; border:1px solid #e2e8f0; }
      button { cursor:pointer; background:#111827; color:white; border:none; }
      .job { border:1px solid #edf2f7; padding:10px; border-radius:8px; margin-bottom:8px; background:#fff; }
      .small { font-size:12px; color:#475569; }
      .pill { background:#eef2ff; padding:4px 8px; border-radius:999px; font-size:12px; display:inline-block; }
      pre { background:#0f172a; color:#fff; padding:10px; border-radius:6px; overflow:auto;}
    </style>
  </head>
  <body>
    <div id="root"></div>

    <!-- React + ReactDOM (UMD) -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>

    <script>
      const e = React.createElement;
      const { useState, useEffect, useRef } = React;
      const api = axios.create({ baseURL: '/api' });

      function useAuth() {
        const [user, setUser] = useState(null);
        const [token, setToken] = useState(localStorage.getItem('jt_token') || null);

        useEffect(() => {
          if (token) {
            api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            api.get('/users/me').then(r => setUser(r.data)).catch(() => { setUser(null); setToken(null); localStorage.removeItem('jt_token'); });
          } else {
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
          }
        }, [token]);

        return { user, token, setToken, setUser };
      }

      function App(){
        const { user, token, setToken } = useAuth();
        const [jobs, setJobs] = useState([]);
        const [q, setQ] = useState('');
        const [messageLog, setMessageLog] = useState([]);
        const socketRef = useRef(null);

        useEffect(() => {
          api.get('/jobs').then(r => setJobs(r.data.jobs || []));
          socketRef.current = io();
          return () => { if (socketRef.current) socketRef.current.disconnect(); };
        }, []);

        useEffect(() => {
          if (token && socketRef.current) {
            // identify socket with user id
            api.get('/users/me').then(r => {
              socketRef.current.emit('identify', r.data.id);
            }).catch(()=>{});
            socketRef.current.on('application:status', (d) => {
              setMessageLog(m => ['Realtime: ' + JSON.stringify(d)].concat(m));
            });
            socketRef.current.on('job:posted', (job) => {
              setJobs(j => [job, ...j]);
              setMessageLog(m => ['New job posted: ' + job.title].concat(m));
            });
          }
        }, [token]);

        if (!token) return e(LoginPanel, { onLogin: (t) => { setToken(t); localStorage.setItem('jt_token', t); } });

        return e('div', { className:'app' },
          e('header', null,
            e('div', null, e('h2', null, 'Ultimate JobTracker — Demo')),
            e('div', null, user ? e('span', null, 'Hi, ' + user.name) : null)
          ),
          e('div', { className:'grid' },
            e('main', null,
              e('section', null,
                e('h3', null, 'Search Jobs'),
                e('div', { style:{display:'flex', gap:8, marginBottom:8} },
                  e('input', { placeholder:'Search...', value:q, onChange: (e)=>setQ(e.target.value) }),
                  e('button', { onClick: ()=>api.get('/jobs', { params:{ q } }).then(r => setJobs(r.data.jobs)) }, 'Search'),
                  e('button', { onClick: ()=>api.get('/jobs').then(r => setJobs(r.data.jobs)) }, 'Refresh')
                ),
                jobs.map(job => e('div', { className:'job', key:job.id },
                  e('div', null, e('strong', null, job.title), ' — ', e('span', { className:'small' }, job.company)),
                  e('div', { className:'small' }, job.location || '—', ' • ', job.remote ? 'Remote' : 'On-site'),
                  e('div', { style:{marginTop:6} }, job.description ? job.description.slice(0,200) + (job.description.length>200 ? '...' : '') : ''),
                  e('div', { style:{marginTop:6, display:'flex', gap:8} },
                    e('button', { onClick: ()=>{ api.post('/jobs/'+job.id+'/apply').then(r=>alert('Applied!')).catch(e=>alert(e.response?.data?.message||e.message)); } }, 'Apply'),
                    e('button', { onClick: ()=>{ api.post('/ai/match-score', { jobId: job.id }).then(r=>alert('Match score: ' + r.data.score + '%')); } }, 'Match Score')
                  )
                ))
              ),
              e('section', { style:{marginTop:14} },
                e('h3', null, 'AI Career Assistant'),
                e(AICoach, { onMessage: (m)=>setMessageLog(l=>[m,...l]) })
              )
            ),
            e('aside', null,
              e('div', null,
                e('h4', null, 'Profile & Resume'),
                e(ProfilePanel, null)
              ),
              e('div', { style:{marginTop:16} },
                e('h4', null, 'Activity & Messages'),
                e('div', { style:{maxHeight:300, overflow:'auto' } }, messageLog.map((m,i)=>(e('div', { key:i, className:'small' }, m)))))
            )
          )
        );
      }

      function LoginPanel({ onLogin }) {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [name, setName] = useState('');
        const [isRegister, setIsRegister] = useState(false);

        async function submit() {
          try {
            if (isRegister) {
              const r = await api.post('/auth/register', { name, email, password });
              onLogin(r.data.token);
            } else {
              const r = await api.post('/auth/login', { email, password });
              onLogin(r.data.token);
            }
          } catch (e) {
            alert(e.response?.data?.message || e.message);
          }
        }

        return e('div', { className:'app', style:{maxWidth:480, margin:'40px auto'} },
          e('h2', null, isRegister ? 'Register' : 'Login'),
          isRegister && e('input', { placeholder:'Name', value:name, onChange:e=>setName(e.target.value), style:{width:'100%', marginBottom:8} }),
          e('input', { placeholder:'Email', value:email, onChange:e=>setEmail(e.target.value), style:{width:'100%', marginBottom:8} }),
          e('input', { placeholder:'Password', type:'password', value:password, onChange:e=>setPassword(e.target.value), style:{width:'100%', marginBottom:8} }),
          e('div', { style:{display:'flex', gap:8} },
            e('button', { onClick: submit }, isRegister ? 'Register' : 'Login'),
            e('button', { onClick: ()=>setIsRegister(!isRegister) }, isRegister ? 'Switch to Login' : 'Switch to Register')
          ),
          e('p', { className:'small', style:{marginTop:12} }, 'This demo stores everything in-memory. For production, wire to a proper DB and secure storage.')
        );
      }

      function ProfilePanel(){
        const [profile, setProfile] = useState(null);
        const [resumes, setResumes] = useState([]);
        const [file, setFile] = useState(null);

        useEffect(()=> {
          api.get('/users/me').then(r=>{ setProfile(r.data); setResumes(r.data.resumes || []); }).catch(()=>{});
        }, []);

        async function upload() {
          if (!file) return alert('Select a file first');
          const fd = new FormData();
          fd.append('resume', file);
          const r = await api.post('/users/me/upload-resume', fd, { headers: {'Content-Type':'multipart/form-data'} });
          alert('Uploaded: ' + r.data.resume.name);
          const me = await api.get('/users/me'); setResumes(me.data.resumes || []);
        }

        return e('div', null,
          e('div', null, profile ? e('div', null, e('strong', null, profile.name || profile.email)) : 'Loading...'),
          e('div', { style:{marginTop:8} },
            e('input', { type:'file', onChange: (e)=>setFile(e.target.files[0]) }),
            e('button', { onClick: upload, style:{marginLeft:8} }, 'Upload Resume')
          ),
          e('div', { style:{marginTop:8} }, resumes.map(r => e('div', { key:r.id }, e('span', { className:'pill' }, r.name))))
        );
      }

      function AICoach({ onMessage }) {
        const [msg, setMsg] = useState('');
        const [log, setLog] = useState([]);

        async function send() {
          if (!msg) return;
          const r = await api.post('/ai/chat', { message: msg });
          setLog(l => [r.data.reply, ...l]);
          onMessage && onMessage('AI: ' + r.data.reply);
          setMsg('');
        }

        return e('div', null,
          e('textarea', { value: msg, onChange:(e)=>setMsg(e.target.value), rows:3, style:{width:'100%'} }),
          e('div', { style:{display:'flex', gap:8, marginTop:6} },
            e('button', { onClick: send }, 'Send to Career Assistant'),
            e('button', { onClick: async ()=> {
              // quick rewrite demo: call rewrite-resume with sample text
              const sample = 'Software engineer with experience building web apps. Familiar with JS, Node.js, React.';
              const r = await api.post('/ai/rewrite-resume', { rawText: sample, jobTitle: 'Senior Frontend Engineer' });
              setLog(l => [r.data.rewritten, ...l]);
            } }, 'Rewrite Sample Resume')
          ),
          e('div', { style:{marginTop:8} }, log.map((t,i)=>e('pre', { key:i }, t)))
        );
      }

      ReactDOM.createRoot(document.getElementById('root')).render(e(App));
    </script>
  </body>
</html>
`);
=======
   res.send('<html><body><h3>JobTracker ESM Demo - visit /api/jobs</h3></body></html>');
>>>>>>> 0ab2f880c0d0fcb58c0d8007ac68048f09d17ff8
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
