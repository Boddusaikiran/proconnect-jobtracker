import {
  insertConnectionSchema,
  insertEducationSchema,
  insertExperienceSchema,
  insertJobApplicationSchema,
  insertJobSchema,
  insertMessageSchema,
  insertNotificationSchema,
  insertSavedJobSchema,
  insertSkillSchema,
  insertUserSchema,
} from "@shared/schema";
import bcrypt from "bcryptjs";
import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import multer from "multer";
import { Server as IOServer } from "socket.io";
import { storage } from "./storage";
import { generateMessage, analyzeResume, chatWithAI } from "./ai";
import mammoth from "mammoth";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { insertPipelineColumnSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get("/api/users", async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Auth (simple JWT + bcrypt using MemStorage)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, headline } = req.body as any;
      if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

      // avoid duplicate emails
      const existing = (await storage.getAllUsers()).find((u) => u.email === email);
      if (existing) return res.status(400).json({ error: "User exists" });

      const passwordHash = await bcrypt.hash(password, 10);
      const username = email.split("@")[0];
      const insert = {
        username,
        password: passwordHash,
        fullName: name,
        headline: headline || "",
        email,
      } as any;

      const user = await storage.createUser(insert);
      const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || "dev_jwt_secret", { expiresIn: "30d" });
      res.status(201).json({ user, token });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Registration failed" });
    }
  });



  app.patch("/api/users/:id", async (req, res) => {
    const user = await storage.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  // Experiences
  app.get("/api/users/:userId/experiences", async (req, res) => {
    const experiences = await storage.getExperiences(req.params.userId);
    res.json(experiences);
  });

  app.post("/api/experiences", async (req, res) => {
    try {
      const expData = insertExperienceSchema.parse(req.body);
      const experience = await storage.createExperience(expData);
      res.status(201).json(experience);
    } catch (error) {
      res.status(400).json({ error: "Invalid experience data" });
    }
  });

  app.patch("/api/experiences/:id", async (req, res) => {
    const experience = await storage.updateExperience(req.params.id, req.body);
    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }
    res.json(experience);
  });

  app.delete("/api/experiences/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteExperience(req.params.id);
    res.sendStatus(200);
  });

  // Education
  app.get("/api/users/:userId/education", async (req, res) => {
    const education = await storage.getEducation(req.params.userId);
    res.json(education);
  });

  app.post("/api/education", async (req, res) => {
    try {
      const eduData = insertEducationSchema.parse(req.body);
      const education = await storage.createEducation(eduData);
      res.status(201).json(education);
    } catch (error) {
      res.status(400).json({ error: "Invalid education data" });
    }
  });

  app.patch("/api/education/:id", async (req, res) => {
    const education = await storage.updateEducation(req.params.id, req.body);
    if (!education) {
      return res.status(404).json({ error: "Education not found" });
    }
    res.json(education);
  });

  app.delete("/api/education/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteEducation(req.params.id);
    res.sendStatus(200);
  });

  // Skills
  app.get("/api/users/:userId/skills", async (req, res) => {
    const skills = await storage.getSkills(req.params.userId);
    res.json(skills);
  });

  app.post("/api/skills", async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      res.status(400).json({ error: "Invalid skill data" });
    }
  });

  app.patch("/api/skills/:id", async (req, res) => {
    const skill = await storage.updateSkill(req.params.id, req.body);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }
    res.json(skill);
  });

  app.delete("/api/skills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteSkill(req.params.id);
    res.sendStatus(200);
  });

  // Connections
  app.get("/api/users/:userId/connections", async (req, res) => {
    const status = req.query.status as string | undefined;
    const connections = await storage.getConnections(req.params.userId, status);
    res.json(connections);
  });

  app.post("/api/connections", async (req, res) => {
    try {
      const connData = insertConnectionSchema.parse(req.body);
      const connection = await storage.createConnection(connData);

      // Create notification for the connected user
      await storage.createNotification({
        userId: connData.connectedUserId,
        type: "connection_request",
        content: "sent you a connection request",
        actorId: connData.userId,
        read: false,
      });

      res.status(201).json(connection);
    } catch (error) {
      res.status(400).json({ error: "Invalid connection data" });
    }
  });

  app.patch("/api/connections/:id", async (req, res) => {
    const connection = await storage.updateConnection(req.params.id, req.body);
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // If connection accepted, create notification
    if (req.body.status === "accepted") {
      await storage.createNotification({
        userId: connection.userId,
        type: "connection_accepted",
        content: "accepted your connection request",
        actorId: connection.connectedUserId,
        read: false,
      });
    }

    res.json(connection);
  });

  app.delete("/api/connections/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteConnection(req.params.id);
    res.sendStatus(200);
  });

  app.get("/api/mutual-connections/:userId1/:userId2", async (req, res) => {
    const count = await storage.getMutualConnectionsCount(
      req.params.userId1,
      req.params.userId2,
    );
    res.json({ count });
  });

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    const query = req.query.q as string | undefined;
    const location = req.query.location as string | undefined;

    if (query || location) {
      const jobs = await storage.searchJobs(query || "", location);
      res.json(jobs);
    } else {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    const job = await storage.getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job);
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      // emit realtime event if socket.io is attached
      try {
        (app as any)._io?.emit?.("job:posted", job);
      } catch (e) { }
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ error: "Invalid job data" });
    }
  });

  // Job Applications
  app.get("/api/users/:userId/applications", async (req, res) => {
    const applications = await storage.getApplications(req.params.userId);
    res.json(applications);
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const appData = insertJobApplicationSchema.parse(req.body);

      // Check if already applied
      const existing = await storage.getApplicationByJobAndUser(
        appData.jobId,
        appData.userId,
      );
      if (existing) {
        return res.status(400).json({ error: "Already applied to this job" });
      }

      const application = await storage.createApplication(appData);

      // Create notification
      await storage.createNotification({
        userId: appData.userId,
        type: "job_application",
        content: "Your application has been submitted",
        actorId: null,
        read: false,
      });

      // realtime notify applicant (if sockets attached)
      try {
        (app as any)._io?.to(appData.userId).emit?.("application:status", { jobId: application.jobId, status: application.status, appliedAt: application.appliedAt });
      } catch (e) { }

      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ error: "Invalid application data" });
    }
  });

  app.patch("/api/applications/:id", async (req, res) => {
    const application = await storage.updateApplication(req.params.id, req.body);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json(application);
  });

  // Saved Jobs
  app.get("/api/users/:userId/saved-jobs", async (req, res) => {
    const savedJobs = await storage.getSavedJobs(req.params.userId);
    res.json(savedJobs);
  });

  app.post("/api/saved-jobs", async (req, res) => {
    try {
      const savedData = insertSavedJobSchema.parse(req.body);

      // Check if already saved
      const isSaved = await storage.isSavedJob(savedData.userId, savedData.jobId);
      if (isSaved) {
        return res.status(400).json({ error: "Job already saved" });
      }

      const savedJob = await storage.createSavedJob(savedData);
      res.status(201).json(savedJob);
    } catch (error) {
      res.status(400).json({ error: "Invalid saved job data" });
    }
  });

  app.delete("/api/saved-jobs/:jobId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteSavedJob(req.user!.id, req.params.jobId);
    res.sendStatus(200);
  });

  // Messages
  app.get("/api/users/:userId/conversations", async (req, res) => {
    const conversations = await storage.getConversations(req.params.userId);
    res.json(conversations);
  });

  app.get("/api/messages/:userId1/:userId2", async (req, res) => {
    const messages = await storage.getMessages(req.params.userId1, req.params.userId2);
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const msgData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(msgData);

      // Create notification for receiver
      await storage.createNotification({
        userId: msgData.receiverId,
        type: "message",
        content: "sent you a message",
        actorId: msgData.senderId,
        read: false,
      });

      // realtime notify receiver
      try {
        (app as any)._io?.to(msgData.receiverId).emit?.("message:received", message);
      } catch (e) { }

      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    const marked = await storage.markMessageAsRead(req.params.id);
    if (!marked) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.status(204).send();
  });

  // AI Job Butler endpoints (MVP)
  app.post("/api/ai/generate-message", async (req, res) => {
    try {
      const { userId, jobDescription, tone } = req.body as { userId?: string; jobDescription: string; tone?: string };
      const user = userId ? await storage.getUser(userId) : undefined;

      // Lazy import to avoid heavyweight deps in other flows
      const { generateMessage } = await import("../ai");

      const userProfile = user
        ? `${user.fullName} — ${user.headline}. About: ${user.about || ""}`
        : undefined;

      const draft = await generateMessage({ userProfile, jobDescription, tone });
      res.json({ draft });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to generate message" });
    }
  });

  app.post("/api/ai/send-message", async (req, res) => {
    try {
      const { senderId, receiverId, content } = req.body as { senderId: string; receiverId: string; content: string };
      // validate using insertMessageSchema
      const msgData = insertMessageSchema.parse({ senderId, receiverId, content });
      const message = await storage.createMessage(msgData);

      // create notification for receiver
      await storage.createNotification({
        userId: receiverId,
        type: "message",
        content: "received a message",
        actorId: senderId,
        read: false,
      });

      res.status(201).json(message);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "Failed to send message" });
    }
  });

  // Simple AI chat endpoint (MVP)
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body as { message?: string };
      if (!message) return res.status(400).json({ error: "Missing message" });

      const OPENAI_KEY = process.env.OPENAI_API_KEY;
      if (!OPENAI_KEY) {
        // fallback: echo
        const reply = `Echo: ${message}`;
        return res.json({ reply });
      }

      // Call OpenAI Chat Completions
      try {
        const resp = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are JobTracker AI assistant. Answer helpfully and concisely." },
              { role: "user", content: message },
            ],
            temperature: 0.2,
            max_tokens: 800,
          }),
        });

        if (!resp.ok) {
          const text = await resp.text();
          return res.status(502).json({ error: "OpenAI error", details: text });
        }

        const data = await resp.json();
        const reply = data?.choices?.[0]?.message?.content ?? data?.error?.message ?? "(no reply)";
        return res.json({ reply });
      } catch (err: any) {
        return res.status(502).json({ error: err.message || "OpenAI request failed" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "AI chat failed" });
    }
  });

  // Resume upload endpoint (accepts multipart/form-data files)
  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/api/upload-resume", upload.single("file"), async (req, res) => {
    try {
      const file = (req as any).file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });

      let text = "";
      if (file.mimetype === "application/pdf") {
        const data = await pdf(file.buffer);
        text = data.text;
      } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        text = result.value;
      } else {
        return res.status(400).json({ error: "Unsupported file type. Please upload PDF or DOCX." });
      }

      // Analyze with AI
      const analysis = await analyzeResume(text);

      res.json({
        message: "uploaded",
        filename: file.originalname,
        textPreview: text.substring(0, 200) + "...",
        analysis
      });
    } catch (err: any) {
      // Notifications
      app.get("/api/users/:userId/notifications", async (req, res) => {
        const notifications = await storage.getNotifications(req.params.userId);
        res.json(notifications);
      });

      app.post("/api/notifications", async (req, res) => {
        try {
          const notifData = insertNotificationSchema.parse(req.body);
          const notification = await storage.createNotification(notifData);
          res.status(201).json(notification);
        } catch (error) {
          res.status(400).json({ error: "Invalid notification data" });
        }
      });

      app.patch("/api/notifications/:id/read", async (req, res) => {
        const marked = await storage.markNotificationAsRead(req.params.id);
        if (!marked) {
          return res.status(404).json({ error: "Notification not found" });
        }
        res.status(204).send();
      });

      app.patch("/api/users/:userId/notifications/read-all", async (req, res) => {
        await storage.markAllNotificationsAsRead(req.params.userId);
        res.status(204).send();
      });

      const httpServer = createServer(app);

      // Attach Socket.IO to the HTTP server and expose via app for route handlers
      try {
        const io = new IOServer(httpServer, { cors: { origin: '*' } });
        (app as any)._io = io;
        io.on('connection', (socket: any) => {
          socket.on('identify', (userId: string) => {
            socket.join(userId);
          });
          socket.on('ping', (data: any) => {
            socket.emit('pong', { at: new Date().toISOString(), data });
          });
        });
      } catch (e) {
        // ignore if socket.io cannot be attached
      }

      return httpServer;
    }
