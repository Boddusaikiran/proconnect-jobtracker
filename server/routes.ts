import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertExperienceSchema,
  insertEducationSchema,
  insertSkillSchema,
  insertConnectionSchema,
  insertJobSchema,
  insertJobApplicationSchema,
  insertSavedJobSchema,
  insertMessageSchema,
  insertNotificationSchema,
} from "@shared/schema";

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
    const deleted = await storage.deleteExperience(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Experience not found" });
    }
    res.status(204).send();
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
    const deleted = await storage.deleteEducation(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Education not found" });
    }
    res.status(204).send();
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
    const deleted = await storage.deleteSkill(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Skill not found" });
    }
    res.status(204).send();
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
    const deleted = await storage.deleteConnection(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Connection not found" });
    }
    res.status(204).send();
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

  app.delete("/api/users/:userId/saved-jobs/:jobId", async (req, res) => {
    const deleted = await storage.deleteSavedJob(req.params.userId, req.params.jobId);
    if (!deleted) {
      return res.status(404).json({ error: "Saved job not found" });
    }
    res.status(204).send();
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

  return httpServer;
}
