import {
  type User,
  type InsertUser,
  type Experience,
  type InsertExperience,
  type Education,
  type InsertEducation,
  type Skill,
  type InsertSkill,
  type Connection,
  type InsertConnection,
  type Job,
  type InsertJob,
  type JobApplication,
  type InsertJobApplication,
  type SavedJob,
  type InsertSavedJob,
  type Message,
  type InsertMessage,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Experiences
  getExperiences(userId: string): Promise<Experience[]>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: string, updates: Partial<Experience>): Promise<Experience | undefined>;
  deleteExperience(id: string): Promise<boolean>;

  // Education
  getEducation(userId: string): Promise<Education[]>;
  createEducation(education: InsertEducation): Promise<Education>;
  updateEducation(id: string, updates: Partial<Education>): Promise<Education | undefined>;
  deleteEducation(id: string): Promise<boolean>;

  // Skills
  getSkills(userId: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: string, updates: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: string): Promise<boolean>;

  // Connections
  getConnections(userId: string, status?: string): Promise<Connection[]>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnection(id: string, updates: Partial<Connection>): Promise<Connection | undefined>;
  deleteConnection(id: string): Promise<boolean>;
  getMutualConnectionsCount(userId1: string, userId2: string): Promise<number>;

  // Jobs
  getAllJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  searchJobs(query: string, location?: string): Promise<Job[]>;

  // Job Applications
  getApplications(userId: string): Promise<JobApplication[]>;
  getApplicationByJobAndUser(jobId: string, userId: string): Promise<JobApplication | undefined>;
  createApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication | undefined>;

  // Saved Jobs
  getSavedJobs(userId: string): Promise<SavedJob[]>;
  createSavedJob(savedJob: InsertSavedJob): Promise<SavedJob>;
  deleteSavedJob(userId: string, jobId: string): Promise<boolean>;
  isSavedJob(userId: string, jobId: string): Promise<boolean>;

  // Messages
  getConversations(userId: string): Promise<Message[]>;
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<boolean>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private experiences: Map<string, Experience>;
  private education: Map<string, Education>;
  private skills: Map<string, Skill>;
  private connections: Map<string, Connection>;
  private jobs: Map<string, Job>;
  private jobApplications: Map<string, JobApplication>;
  private savedJobs: Map<string, SavedJob>;
  private messages: Map<string, Message>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.experiences = new Map();
    this.education = new Map();
    this.skills = new Map();
    this.connections = new Map();
    this.jobs = new Map();
    this.jobApplications = new Map();
    this.savedJobs = new Map();
    this.messages = new Map();
    this.notifications = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Experiences
  async getExperiences(userId: string): Promise<Experience[]> {
    return Array.from(this.experiences.values()).filter(
      (exp) => exp.userId === userId,
    );
  }

  async createExperience(insertExperience: InsertExperience): Promise<Experience> {
    const id = randomUUID();
    const experience: Experience = { ...insertExperience, id };
    this.experiences.set(id, experience);
    return experience;
  }

  async updateExperience(id: string, updates: Partial<Experience>): Promise<Experience | undefined> {
    const experience = this.experiences.get(id);
    if (!experience) return undefined;
    const updated = { ...experience, ...updates };
    this.experiences.set(id, updated);
    return updated;
  }

  async deleteExperience(id: string): Promise<boolean> {
    return this.experiences.delete(id);
  }

  // Education
  async getEducation(userId: string): Promise<Education[]> {
    return Array.from(this.education.values()).filter(
      (edu) => edu.userId === userId,
    );
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    const id = randomUUID();
    const education: Education = { ...insertEducation, id };
    this.education.set(id, education);
    return education;
  }

  async updateEducation(id: string, updates: Partial<Education>): Promise<Education | undefined> {
    const education = this.education.get(id);
    if (!education) return undefined;
    const updated = { ...education, ...updates };
    this.education.set(id, updated);
    return updated;
  }

  async deleteEducation(id: string): Promise<boolean> {
    return this.education.delete(id);
  }

  // Skills
  async getSkills(userId: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.userId === userId,
    );
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = randomUUID();
    const skill: Skill = { ...insertSkill, id };
    this.skills.set(id, skill);
    return skill;
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill | undefined> {
    const skill = this.skills.get(id);
    if (!skill) return undefined;
    const updated = { ...skill, ...updates };
    this.skills.set(id, updated);
    return updated;
  }

  async deleteSkill(id: string): Promise<boolean> {
    return this.skills.delete(id);
  }

  // Connections
  async getConnections(userId: string, status?: string): Promise<Connection[]> {
    return Array.from(this.connections.values()).filter(
      (conn) =>
        (conn.userId === userId || conn.connectedUserId === userId) &&
        (!status || conn.status === status),
    );
  }

  async createConnection(insertConnection: InsertConnection): Promise<Connection> {
    const id = randomUUID();
    const connection: Connection = { ...insertConnection, id, createdAt: new Date() };
    this.connections.set(id, connection);
    return connection;
  }

  async updateConnection(id: string, updates: Partial<Connection>): Promise<Connection | undefined> {
    const connection = this.connections.get(id);
    if (!connection) return undefined;
    const updated = { ...connection, ...updates };
    this.connections.set(id, updated);
    return updated;
  }

  async deleteConnection(id: string): Promise<boolean> {
    return this.connections.delete(id);
  }

  async getMutualConnectionsCount(userId1: string, userId2: string): Promise<number> {
    const user1Connections = await this.getConnections(userId1, 'accepted');
    const user2Connections = await this.getConnections(userId2, 'accepted');

    const user1ConnIds = new Set(
      user1Connections.map((c) =>
        c.userId === userId1 ? c.connectedUserId : c.userId,
      ),
    );

    const mutualCount = user2Connections.filter((c) => {
      const otherId = c.userId === userId2 ? c.connectedUserId : c.userId;
      return user1ConnIds.has(otherId);
    }).length;

    return mutualCount;
  }

  // Jobs
  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.postedAt.getTime() - a.postedAt.getTime(),
    );
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = { ...insertJob, id, postedAt: new Date() };
    this.jobs.set(id, job);
    return job;
  }

  async searchJobs(query: string, location?: string): Promise<Job[]> {
    const jobs = await this.getAllJobs();
    return jobs.filter((job) => {
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.description.toLowerCase().includes(query.toLowerCase());

      const matchesLocation =
        !location ||
        job.location.toLowerCase().includes(location.toLowerCase());

      return matchesQuery && matchesLocation;
    });
  }

  // Job Applications
  async getApplications(userId: string): Promise<JobApplication[]> {
    return Array.from(this.jobApplications.values()).filter(
      (app) => app.userId === userId,
    );
  }

  async getApplicationByJobAndUser(jobId: string, userId: string): Promise<JobApplication | undefined> {
    return Array.from(this.jobApplications.values()).find(
      (app) => app.jobId === jobId && app.userId === userId,
    );
  }

  async createApplication(insertApplication: InsertJobApplication): Promise<JobApplication> {
    const id = randomUUID();
    const application: JobApplication = { ...insertApplication, id, appliedAt: new Date() };
    this.jobApplications.set(id, application);
    return application;
  }

  async updateApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication | undefined> {
    const application = this.jobApplications.get(id);
    if (!application) return undefined;
    const updated = { ...application, ...updates };
    this.jobApplications.set(id, updated);
    return updated;
  }

  // Saved Jobs
  async getSavedJobs(userId: string): Promise<SavedJob[]> {
    return Array.from(this.savedJobs.values()).filter(
      (saved) => saved.userId === userId,
    );
  }

  async createSavedJob(insertSavedJob: InsertSavedJob): Promise<SavedJob> {
    const id = randomUUID();
    const savedJob: SavedJob = { ...insertSavedJob, id, savedAt: new Date() };
    this.savedJobs.set(id, savedJob);
    return savedJob;
  }

  async deleteSavedJob(userId: string, jobId: string): Promise<boolean> {
    const savedJob = Array.from(this.savedJobs.values()).find(
      (saved) => saved.userId === userId && saved.jobId === jobId,
    );
    if (!savedJob) return false;
    return this.savedJobs.delete(savedJob.id);
  }

  async isSavedJob(userId: string, jobId: string): Promise<boolean> {
    return Array.from(this.savedJobs.values()).some(
      (saved) => saved.userId === userId && saved.jobId === jobId,
    );
  }

  // Messages
  async getConversations(userId: string): Promise<Message[]> {
    const userMessages = Array.from(this.messages.values()).filter(
      (msg) => msg.senderId === userId || msg.receiverId === userId,
    );

    const conversations = new Map<string, Message>();
    userMessages.forEach((msg) => {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const existing = conversations.get(otherId);
      if (!existing || msg.createdAt > existing.createdAt) {
        conversations.set(otherId, msg);
      }
    });

    return Array.from(conversations.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (msg) =>
          (msg.senderId === userId1 && msg.receiverId === userId2) ||
          (msg.senderId === userId2 && msg.receiverId === userId1),
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { ...insertMessage, id, createdAt: new Date() };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;
    message.read = true;
    return true;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notif) => notif.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { ...insertNotification, id, createdAt: new Date() };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    notification.read = true;
    return true;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const userNotifications = await this.getNotifications(userId);
    userNotifications.forEach((notif) => {
      notif.read = true;
    });
    return true;
  }
}

export const storage = new MemStorage();
