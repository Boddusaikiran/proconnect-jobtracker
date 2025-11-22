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
import { problems } from "./data/problems_data.ts";
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
import { rateLimiter } from "./middleware/rateLimiter";
import { executeCode } from "./codeExecutor";

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
      console.log("[Auth] Register request body:", req.body);
      const { fullName, username, email, password, headline, role } = req.body as any;
      // Accept 'name' for backward compatibility if fullName is missing
      const finalName = fullName || (req.body as any).name;

      if (!finalName || !email || !password) {
        console.log("[Auth] Missing fields. Body:", req.body);
        return res.status(400).json({
          error: "Missing fields",
          received: req.body,
          parsed: { finalName, email, password }
        });
      }

      // avoid duplicate emails
      const existing = (await storage.getAllUsers()).find((u) => u.email === email);
      if (existing) return res.status(400).json({ error: "User exists" });

      const passwordHash = await bcrypt.hash(password, 10);
      const finalUsername = username || email.split("@")[0];

      const insert = {
        username: finalUsername,
        password: passwordHash,
        fullName: finalName,
        headline: headline || "",
        email,
        role: role || "candidate",
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

  // Pipeline Columns
  app.get("/api/pipeline-columns", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const columns = await storage.getPipelineColumns((req.user as any).id);
    res.json(columns);
  });

  app.post("/api/pipeline-columns", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const colData = insertPipelineColumnSchema.parse(req.body);
      const column = await storage.createPipelineColumn({ ...colData, userId: (req.user as any).id });
      res.status(201).json(column);
    } catch (error) {
      res.status(400).json({ error: "Invalid column data" });
    }
  });

  app.patch("/api/pipeline-columns/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const column = await storage.updatePipelineColumn(req.params.id, req.body);
    if (!column) return res.status(404).json({ error: "Column not found" });
    res.json(column);
  });

  app.delete("/api/pipeline-columns/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deletePipelineColumn(req.params.id);
    res.sendStatus(200);
  });
  // Code execution endpoint with rate limiting
  app.post("/api/code/execute", rateLimiter, async (req, res) => {
    try {
      const { code, language, input } = req.body;
      const result = await executeCode({ code, language, input });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Execution failed" });
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
    await storage.deleteSavedJob((req.user as any).id, req.params.jobId);
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
      if (!OPENAI_KEY || OPENAI_KEY === "your_openai_api_key_here") {
        // Intelligent fallback responses when no API key
        const lowerMsg = message.toLowerCase();
        let reply = "";

        if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
          reply = "Hello! 👋 I'm your AI assistant. I can help you with job tracking, resume tips, interview preparation, and career advice. What would you like to know?";
        } else if (lowerMsg.includes("help") || lowerMsg.includes("what can you do")) {
          reply = "I can assist you with:\n• Job application tracking\n• Resume optimization tips\n• Interview preparation\n• Career advice\n• Networking strategies\n\nWhat would you like help with?";
        } else if (lowerMsg.includes("resume")) {
          reply = "For resume tips:\n• Keep it concise (1-2 pages)\n• Use action verbs\n• Quantify achievements\n• Tailor it to each job\n• Include relevant keywords\n\nWould you like specific advice for your industry?";
        } else if (lowerMsg.includes("interview")) {
          reply = "Interview tips:\n• Research the company thoroughly\n• Prepare STAR method examples\n• Ask thoughtful questions\n• Dress professionally\n• Follow up with a thank-you email\n\nNeed help with specific interview questions?";
        } else if (lowerMsg.includes("job") || lowerMsg.includes("application")) {
          reply = "For job applications:\n• Customize your cover letter\n• Apply early in the posting cycle\n• Follow up after 1-2 weeks\n• Network with employees\n• Track all applications\n\nHow can I help with your job search?";
        } else if (lowerMsg.includes("thank")) {
          reply = "You're welcome! 😊 Feel free to ask me anything about your job search or career development.";
        } else if (lowerMsg.includes("bye") || lowerMsg.includes("goodbye")) {
          reply = "Goodbye! Best of luck with your job search. Feel free to come back anytime! 👋";
        } else {
          reply = `I understand you're asking about "${message}". While I'm running in demo mode (no OpenAI API key configured), I can still help with:\n\n• Job search strategies\n• Resume and cover letter tips\n• Interview preparation\n• Career development advice\n\nTry asking me about resumes, interviews, or job applications!`;
        }

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
              { role: "system", content: "You are a helpful career advisor and job search assistant for ProConnect Job Tracker. Provide concise, actionable advice about job searching, resumes, interviews, networking, and career development. Be friendly and encouraging." },
              { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 500,
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

  // Smart Job Assistant endpoint
  app.post("/api/ai/job-assistant", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { message } = req.body as { message?: string };
      if (!message) return res.status(400).json({ error: "Missing message" });

      const userId = (req.user as any).id;
      const lowerMsg = message.toLowerCase();

      // Intent Detection and Response Generation

      // 1. Job Reminders / Deadlines
      if (lowerMsg.includes("due") || lowerMsg.includes("deadline") || lowerMsg.includes("upcoming") || lowerMsg.includes("this week")) {
        const applications = await storage.getApplications(userId);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const upcoming = applications.filter(app => {
          // For demo, we'll show all recent applications
          return app.status === "applied" || app.status === "interview";
        }).slice(0, 5);

        if (upcoming.length === 0) {
          return res.json({
            reply: "You don't have any upcoming deadlines this week. Great job staying on top of things! 🎉",
            jobs: []
          });
        }

        const jobList = upcoming.map((app, idx) => `${idx + 1}. ${app.jobId} - Status: ${app.status}`).join("\n");
        return res.json({
          reply: `📅 You have ${upcoming.length} active applications:\n\n${jobList}\n\nStay on track! 💪`,
          jobs: upcoming
        });
      }

      // 2. Job Filtering
      if (lowerMsg.includes("show") || lowerMsg.includes("filter") || lowerMsg.includes("find") || lowerMsg.includes("list")) {
        const applications = await storage.getApplications(userId);

        let filtered = applications;
        let filterDesc = "all";

        // Filter by status
        if (lowerMsg.includes("applied")) {
          filtered = filtered.filter(app => app.status === "applied");
          filterDesc = "applied";
        } else if (lowerMsg.includes("interview")) {
          filtered = filtered.filter(app => app.status === "interview");
          filterDesc = "interview";
        } else if (lowerMsg.includes("offer")) {
          filtered = filtered.filter(app => app.status === "offer");
          filterDesc = "offer";
        } else if (lowerMsg.includes("rejected")) {
          filtered = filtered.filter(app => app.status === "rejected");
          filterDesc = "rejected";
        }

        if (filtered.length === 0) {
          return res.json({
            reply: `No ${filterDesc} jobs found. ${filterDesc === "all" ? "Start applying to jobs to track them here!" : "Try a different filter."}`,
            jobs: []
          });
        }

        const jobList = filtered.slice(0, 10).map((app, idx) =>
          `${idx + 1}. Job ID: ${app.jobId} - Status: ${app.status}`
        ).join("\n");

        return res.json({
          reply: `🔍 Found ${filtered.length} ${filterDesc} job(s):\n\n${jobList}${filtered.length > 10 ? "\n\n...and more" : ""}`,
          jobs: filtered.slice(0, 10)
        });
      }

      // 3. Interview Preparation
      if (lowerMsg.includes("interview") && (lowerMsg.includes("prepare") || lowerMsg.includes("prep") || lowerMsg.includes("questions"))) {
        const role = lowerMsg.includes("backend") ? "backend developer" :
          lowerMsg.includes("frontend") ? "frontend developer" :
            lowerMsg.includes("full stack") || lowerMsg.includes("fullstack") ? "full stack developer" :
              lowerMsg.includes("data") ? "data analyst" :
                lowerMsg.includes("devops") ? "devops engineer" : "software engineer";

        const questions: Record<string, string[]> = {
          "backend developer": [
            "Explain RESTful API design principles and best practices",
            "How do you optimize database queries for performance?",
            "Describe your experience with microservices architecture",
            "What's your approach to error handling and logging?",
            "How do you ensure API security and prevent common vulnerabilities?"
          ],
          "frontend developer": [
            "Explain the virtual DOM and how React uses it",
            "How do you optimize frontend performance?",
            "Describe your approach to state management",
            "What's your experience with responsive design?",
            "How do you handle cross-browser compatibility?"
          ],
          "full stack developer": [
            "Describe your experience with both frontend and backend technologies",
            "How do you design scalable full-stack applications?",
            "Explain your approach to API integration",
            "What's your deployment and CI/CD strategy?",
            "How do you balance frontend UX with backend performance?"
          ],
          "software engineer": [
            "Describe your problem-solving approach for complex issues",
            "How do you ensure code quality and maintainability?",
            "Explain your experience with version control and collaboration",
            "What's your approach to testing and debugging?",
            "How do you stay updated with new technologies?"
          ]
        };

        const roleQuestions = questions[role] || questions["software engineer"];
        const questionList = roleQuestions.map((q, idx) => `${idx + 1}. ${q}`).join("\n\n");

        return res.json({
          reply: `🎯 Top 5 Interview Questions for ${role.charAt(0).toUpperCase() + role.slice(1)}:\n\n${questionList}\n\n💡 Tip: Prepare STAR method examples for behavioral questions!`,
          questions: roleQuestions
        });
      }

      // 4. Analytics / Summary
      if (lowerMsg.includes("summary") || lowerMsg.includes("analytics") || lowerMsg.includes("stats") || lowerMsg.includes("total")) {
        const applications = await storage.getApplications(userId);

        const stats = {
          total: applications.length,
          applied: applications.filter(a => a.status === "applied").length,
          interview: applications.filter(a => a.status === "interview").length,
          offer: applications.filter(a => a.status === "offer").length,
          rejected: applications.filter(a => a.status === "rejected").length,
        };

        return res.json({
          reply: `📊 Your Job Search Summary:\n\n• Total Applications: ${stats.total}\n• Applied: ${stats.applied}\n• Interviews: ${stats.interview}\n• Offers: ${stats.offer}\n• Rejected: ${stats.rejected}\n\n${stats.interview > 0 ? "Great progress! 🎉" : "Keep applying! 💪"}`,
          stats
        });
      }

      // 5. Status Suggestions
      if (lowerMsg.includes("next") || lowerMsg.includes("what should") || lowerMsg.includes("suggest")) {
        const applications = await storage.getApplications(userId);
        const recent = applications.slice(0, 5);

        if (recent.length === 0) {
          return res.json({
            reply: "Start by applying to jobs! Browse the Jobs page to find opportunities that match your skills. 🚀"
          });
        }

        const suggestions = recent.map(app => {
          if (app.status === "applied") {
            return `• Job ${app.jobId}: Follow up after 3-5 days if no response`;
          } else if (app.status === "interview") {
            return `• Job ${app.jobId}: Prepare for interview, research company, practice questions`;
          } else if (app.status === "offer") {
            return `• Job ${app.jobId}: Review offer carefully, negotiate if needed`;
          }
          return null;
        }).filter(Boolean).join("\n");

        return res.json({
          reply: `💡 Suggested Next Actions:\n\n${suggestions || "Keep applying to more jobs!"}`
        });
      }

      // Default: General help
      return res.json({
        reply: `I can help you with:\n\n📅 Job Reminders - "What's due this week?"\n🔍 Filter Jobs - "Show applied jobs"\n🎯 Interview Prep - "Prepare me for backend interview"\n📊 Analytics - "Show my summary"\n💡 Suggestions - "What should I do next?"\n\nWhat would you like to know?`
      });

    } catch (err: any) {
      console.error("Job assistant error:", err);
      res.status(500).json({ error: err.message || "Job assistant failed" });
    }
  });

  // Resume upload endpoint (accepts multipart/form-data files)


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

  // Get all problems with filters
  app.get("/api/coding/problems", async (req, res) => {
    const { difficulty, category, company } = req.query;
    const problems = await storage.getCodingProblems({
      difficulty: difficulty as string,
      category: category as string,
      company: company as string
    });
    res.json(problems);
  });

  // Get single problem by ID or slug
  app.get("/api/coding/problems/:id", async (req, res) => {
    let problem = await storage.getCodingProblem(req.params.id);
    if (!problem) {
      problem = await storage.getCodingProblemBySlug(req.params.id);
    }
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Fetch test cases for the problem
    const testCases = await storage.getCodingTestCases(problem.id);

    // Return problem with test cases
    res.json({ ...problem, testCases });
  });

  // Admin: Create new problem
  app.post("/api/coding/admin/problems", async (req, res) => {
    // if (!req.isAuthenticated() || (req.user as any).role !== 'admin') {
    //   return res.status(403).json({ error: "Unauthorized" });
    // }
    try {
      const problem = await storage.createCodingProblem(req.body);
      res.status(201).json(problem);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Submit solution
  app.post("/api/coding/submit", rateLimiter, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

    try {
      const { problemId, code, language } = req.body;
      const userId = (req.user as any).id;

      // 1. Get problem and test cases
      const problem = await storage.getCodingProblem(problemId);
      if (!problem) return res.status(404).json({ error: "Problem not found" });

      const testCases = await storage.getCodingTestCases(problemId);

      // 2. Execute code against test cases
      // We'll use the first test case for now, or ideally run against all hidden test cases
      // For MVP, let's run against the first test case
      const input = testCases.length > 0 ? testCases[0].input : "";
      const result = await executeCode({ code, language, input });

      const status = result.error ? "Runtime Error" : "Accepted";

      // Check correctness if not runtime error (simple string comparison for MVP)
      if (status === "Accepted" && testCases.length > 0) {
        const expected = testCases[0].output.trim();
        const actual = result.output.trim();
        if (expected !== actual) {
          // status = "Wrong Answer"; // Cannot assign to const, need to change declaration
        }
      }

      // 3. Save submission
      const submission = await storage.createCodingSubmission({
        userId,
        problemId,
        code,
        language,
        status: (status === "Accepted" && testCases.length > 0 && testCases[0].output.trim() !== result.output.trim()) ? "Wrong Answer" : status,
        runtime: result.executionTime ? Math.round(result.executionTime) : 0,
        memory: result.memory ? Math.round(result.memory) : 0,
      });

      // 4. Update user progress if accepted
      if (submission.status === "Accepted") {
        await storage.updateUserCodingProgress(userId, {
          solvedCount: 1, // increment logic needed in storage
          xp: 10, // increment logic needed
          lastSolvedAt: new Date()
        });
      }

      res.json({ submission, result });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get user progress
  app.get("/api/coding/user/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
    const progress = await storage.getUserCodingProgress((req.user as any).id);
    res.json(progress || { solvedCount: 0, xp: 0, streak: 0 });
  });

  // Get user submissions
  app.get("/api/coding/user/submissions/:problemId", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
    const submissions = await storage.getUserSubmissions((req.user as any).id, req.params.problemId);
    res.json(submissions);
  });

  // Get problem categories
  app.get("/api/coding/categories", async (req, res) => {
    const categories = await storage.getProblemCategories();
    res.json(categories);
  });

  // Get user badges
  app.get("/api/coding/badges/:userId", async (req, res) => {
    const badges = await storage.getUserBadges(req.params.userId);
    res.json(badges);
  });

  // Get leaderboard
  app.get("/api/coding/leaderboard", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 100;
    const leaderboard = await storage.getLeaderboard(limit);
    res.json(leaderboard);
  });

  // Get editorial for a problem
  app.get("/api/coding/editorial/:problemId", async (req, res) => {
    const problem = await storage.getCodingProblem(req.params.problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });
    res.json({
      editorial: problem.editorial,
      editorialCode: problem.editorialCode,
      timeComplexity: problem.timeComplexity,
      spaceComplexity: problem.spaceComplexity,
    });
  });

  // Run code (without saving submission)
  app.post("/api/coding/run", rateLimiter, async (req, res) => {
    try {
      const { code, language, input } = req.body;
      const result = await executeCode({ code, language, input });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Execution failed" });
    }
  });

  // ADMIN: Seed problems into running server


  // ADMIN: Seed problems into running server
  app.post("/api/admin/seed-problems", async (req, res) => {
    try {
      console.log(`Seeding problems... Found ${problems.length} problems in data file.`);
      let seededCount = 0;
      for (const p of problems) {
        const existing = await storage.getCodingProblemBySlug(p.slug);
        if (!existing) {
          const { testCases, ...problemData } = p;
          const created = await storage.createCodingProblem(problemData);
          seededCount++;

          if (testCases) {
            for (const tc of testCases) {
              await storage.createCodingTestCase({
                problemId: created.id,
                input: tc.input,
                output: tc.output,
                isHidden: false
              });
            }
          }
        } else {
          console.log(`Skipping existing problem: ${p.slug}`);
        }
      }

      res.json({ success: true, message: `Seeded ${seededCount} new problems successfully! (Total in data: ${problems.length})` });
    } catch (err: any) {
      console.error("Seeding error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return httpServer;
}

