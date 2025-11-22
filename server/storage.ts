import {
  users,
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
  type Notification as AppNotification,
  type InsertNotification,
  type PipelineColumn,
  type InsertPipelineColumn,
  type CodingProblem,
  type InsertCodingProblem,
  type CodingTestCase,
  type InsertCodingTestCase,
  type CodingSubmission,
  type InsertCodingSubmission,
  type UserCodingProgress,
  type InsertUserCodingProgress,
  type ProblemCategory,
  type InsertProblemCategory,
  type UserBadge,
  type InsertUserBadge,
  type SolvedProblem,
  type InsertSolvedProblem,
} from "@shared/schema";
import { randomUUID } from "crypto";
import DrizzleStorage from './drizzleStorage';
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Experiences
  getExperiences(userId: string): Promise<Experience[]>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: string, updates: Partial<Experience>): Promise<Experience | undefined>;
  deleteExperience(id: string): Promise<void>;

  // Education
  getEducation(userId: string): Promise<Education[]>;
  createEducation(education: InsertEducation): Promise<Education>;
  updateEducation(id: string, updates: Partial<Education>): Promise<Education | undefined>;
  deleteEducation(id: string): Promise<void>;

  // Skills
  getSkills(userId: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: string, updates: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: string): Promise<void>;

  // Connections
  getConnections(userId: string, status?: string): Promise<Connection[]>;
  createConnection(connection: InsertConnection): Promise<Connection>;
  updateConnection(id: string, status: string): Promise<Connection | undefined>;
  deleteConnection(id: string): Promise<void>;
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
  deleteSavedJob(userId: string, jobId: string): Promise<void>;
  isSavedJob(userId: string, jobId: string): Promise<boolean>;

  // Messages
  getConversations(userId: string): Promise<Message[]>;
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: string): Promise<boolean>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;

  // Notifications
  getNotifications(userId: string): Promise<AppNotification[]>;
  createNotification(notification: InsertNotification): Promise<AppNotification>;
  markNotificationAsRead(id: string): Promise<AppNotification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;

  // Pipeline Columns
  getPipelineColumns(userId: string): Promise<PipelineColumn[]>;
  createPipelineColumn(column: InsertPipelineColumn): Promise<PipelineColumn>;
  updatePipelineColumn(id: string, updates: Partial<PipelineColumn>): Promise<PipelineColumn | undefined>;
  deletePipelineColumn(id: string): Promise<void>;

  // Coding Platform
  getCodingProblems(filters?: { difficulty?: string; category?: string; company?: string }): Promise<CodingProblem[]>;
  getCodingProblem(id: string): Promise<CodingProblem | undefined>;
  getCodingProblemBySlug(slug: string): Promise<CodingProblem | undefined>;
  createCodingProblem(problem: InsertCodingProblem): Promise<CodingProblem>;

  getCodingTestCases(problemId: string): Promise<CodingTestCase[]>;
  createCodingTestCase(testCase: InsertCodingTestCase): Promise<CodingTestCase>;

  createCodingSubmission(submission: InsertCodingSubmission): Promise<CodingSubmission>;
  getUserSubmissions(userId: string, problemId?: string): Promise<CodingSubmission[]>;

  getUserCodingProgress(userId: string): Promise<UserCodingProgress | undefined>;
  updateUserCodingProgress(userId: string, updates: Partial<UserCodingProgress>): Promise<UserCodingProgress>;

  // Categories
  getProblemCategories(): Promise<ProblemCategory[]>;
  createProblemCategory(category: InsertProblemCategory): Promise<ProblemCategory>;

  // Badges
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badge: InsertUserBadge): Promise<UserBadge>;

  // Leaderboard
  getLeaderboard(limit?: number): Promise<UserCodingProgress[]>;

  // Solved Problems
  markProblemSolved(userId: string, problemId: string): Promise<SolvedProblem>;
  getUserSolvedProblems(userId: string): Promise<SolvedProblem[]>;
  isProblemSolved(userId: string, problemId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<string, User>;
  private experiences: Map<string, Experience>;
  private education: Map<string, Education>;
  private skills: Map<string, Skill>;
  private connections: Map<string, Connection>;
  private jobs: Map<string, Job>;
  private jobApplications: Map<string, JobApplication>;
  private savedJobs: Map<string, SavedJob>;
  private messages: Map<string, Message>;
  private notifications: Map<string, AppNotification>;
  private pipelineColumns: Map<string, PipelineColumn>;
  private codingProblems: Map<string, CodingProblem>;
  private codingTestCases: Map<string, CodingTestCase>;
  private codingSubmissions: Map<string, CodingSubmission>;
  private userCodingProgress: Map<string, UserCodingProgress>;
  private problemCategories: Map<string, ProblemCategory>;
  private userBadges: Map<string, UserBadge>;
  private solvedProblems: Map<string, SolvedProblem>;
  private currentId: number;

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
    this.pipelineColumns = new Map();
    this.codingProblems = new Map();
    this.codingTestCases = new Map();
    this.codingSubmissions = new Map();
    this.userCodingProgress = new Map();
    this.problemCategories = new Map();
    this.userBadges = new Map();
    this.solvedProblems = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      avatarUrl: insertUser.avatarUrl ?? null,
      coverUrl: insertUser.coverUrl ?? null,
      location: insertUser.location ?? null,
      about: insertUser.about ?? null,
      googleId: insertUser.googleId ?? null,
      resetToken: insertUser.resetToken ?? null,
      resetTokenExpiry: insertUser.resetTokenExpiry ?? null,
      role: insertUser.role ?? "candidate"
    };
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
    const experience: Experience = {
      ...insertExperience,
      id,
      location: insertExperience.location ?? null,
      companyLogo: insertExperience.companyLogo ?? null,
      endDate: insertExperience.endDate ?? null,
      current: insertExperience.current ?? false,
      description: insertExperience.description ?? null
    };
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

  async deleteExperience(id: string): Promise<void> {
    this.experiences.delete(id);
  }

  // Education
  async getEducation(userId: string): Promise<Education[]> {
    return Array.from(this.education.values()).filter(
      (edu) => edu.userId === userId,
    );
  }

  async createEducation(insertEducation: InsertEducation): Promise<Education> {
    const id = randomUUID();
    const education: Education = {
      ...insertEducation,
      id,
      endDate: insertEducation.endDate ?? null,
      current: insertEducation.current ?? false
    };
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

  async deleteEducation(id: string): Promise<void> {
    this.education.delete(id);
  }

  // Skills
  async getSkills(userId: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.userId === userId,
    );
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = randomUUID();
    const skill: Skill = {
      ...insertSkill,
      id,
      endorsements: insertSkill.endorsements ?? 0
    };
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

  async deleteSkill(id: string): Promise<void> {
    this.skills.delete(id);
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

  async updateConnection(id: string, status: string): Promise<Connection | undefined> {
    const connection = this.connections.get(id);
    if (!connection) return undefined;
    const updated = { ...connection, status };
    this.connections.set(id, updated);
    return updated;
  }

  async deleteConnection(id: string): Promise<void> {
    this.connections.delete(id);
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
    const job: Job = {
      ...insertJob,
      id,
      postedAt: new Date(),
      companyLogo: insertJob.companyLogo ?? null,
      salary: insertJob.salary ?? null
    };
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

  async deleteSavedJob(userId: string, jobId: string): Promise<void> {
    // In a real DB we would delete by compound key.
    // For map, we iterate (inefficient but fine for mem)
    for (const [key, val] of Array.from(this.savedJobs.entries())) {
      if (val.userId === userId && val.jobId === jobId) {
        this.savedJobs.delete(key);
        break;
      }
    }
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
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
      read: insertMessage.read ?? false
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(id: string): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) return false;
    message.read = true;
    return true;
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    for (const msg of Array.from(this.messages.values())) {
      if (msg.senderId === senderId && msg.receiverId === receiverId && !msg.read) {
        const updated = { ...msg, read: true };
        this.messages.set(msg.id, updated);
      }
    }
  }

  // Notifications
  async getNotifications(userId: string): Promise<AppNotification[]> {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId,
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<AppNotification> {
    const id = randomUUID(); // Assuming randomUUID() is used for IDs, not this.currentId++
    const notification: AppNotification = {
      ...insertNotification,
      id,
      createdAt: new Date(),
      read: insertNotification.read ?? false,
      actorId: insertNotification.actorId ?? null,
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<AppNotification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    const updated = { ...notification, read: true };
    this.notifications.set(id, updated);
    return updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const userNotifications = Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId,
    );
    userNotifications.forEach((notif) => {
      const updated = { ...notif, read: true };
      this.notifications.set(notif.id, updated);
    });
    return true;
  }

  // Pipeline Columns
  async getPipelineColumns(userId: string): Promise<PipelineColumn[]> {
    return Array.from(this.pipelineColumns.values())
      .filter((col) => col.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  async createPipelineColumn(column: InsertPipelineColumn): Promise<PipelineColumn> {
    const id = this.currentId++;
    const newColumn: PipelineColumn = { ...column, id: id.toString(), color: column.color || "bg-gray-500/10 text-gray-500" };
    this.pipelineColumns.set(newColumn.id, newColumn);
    return newColumn;
  }

  async updatePipelineColumn(id: string, updates: Partial<PipelineColumn>): Promise<PipelineColumn | undefined> {
    const column = this.pipelineColumns.get(id);
    if (!column) return undefined;
    const updated = { ...column, ...updates };
    this.pipelineColumns.set(id, updated);
    return updated;
  }

  async deletePipelineColumn(id: string): Promise<void> {
    this.pipelineColumns.delete(id);
  }

  // Coding Platform

  async getCodingProblems(filters?: { difficulty?: string; category?: string; company?: string }): Promise<CodingProblem[]> {
    let problems = Array.from(this.codingProblems.values());
    if (filters) {
      if (filters.difficulty) problems = problems.filter(p => p.difficulty === filters.difficulty);
      if (filters.category) problems = problems.filter(p => p.category === filters.category);
      if (filters.company) problems = problems.filter(p => p.companyTags?.includes(filters.company!));
    }
    return problems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCodingProblem(id: string): Promise<CodingProblem | undefined> {
    return this.codingProblems.get(id);
  }

  async getCodingProblemBySlug(slug: string): Promise<CodingProblem | undefined> {
    return Array.from(this.codingProblems.values()).find(p => p.slug === slug);
  }

  async createCodingProblem(insertProblem: InsertCodingProblem): Promise<CodingProblem> {
    const id = randomUUID();
    const problem: CodingProblem = {
      ...insertProblem,
      id,
      createdAt: new Date(),
      companyTags: insertProblem.companyTags ?? null,
      constraints: insertProblem.constraints ?? null,
      editorial: insertProblem.editorial ?? null,
      editorialCode: insertProblem.editorialCode ?? null,
      timeComplexity: insertProblem.timeComplexity ?? null,
      spaceComplexity: insertProblem.spaceComplexity ?? null,
      acceptanceRate: insertProblem.acceptanceRate ?? null,
      totalSubmissions: insertProblem.totalSubmissions ?? null,
      totalAccepted: insertProblem.totalAccepted ?? null,
    };
    this.codingProblems.set(id, problem);
    return problem;
  }

  async getCodingTestCases(problemId: string): Promise<CodingTestCase[]> {
    return Array.from(this.codingTestCases.values()).filter(tc => tc.problemId === problemId);
  }

  async createCodingTestCase(insertTestCase: InsertCodingTestCase): Promise<CodingTestCase> {
    const id = randomUUID();
    const testCase: CodingTestCase = { ...insertTestCase, id, isHidden: insertTestCase.isHidden ?? false };
    this.codingTestCases.set(id, testCase);
    return testCase;
  }

  async createCodingSubmission(insertSubmission: InsertCodingSubmission): Promise<CodingSubmission> {
    const id = randomUUID();
    const submission: CodingSubmission = {
      ...insertSubmission,
      id,
      submittedAt: new Date(),
      runtime: insertSubmission.runtime ?? null,
      memory: insertSubmission.memory ?? null
    };
    this.codingSubmissions.set(id, submission);
    return submission;
  }

  async getUserSubmissions(userId: string, problemId?: string): Promise<CodingSubmission[]> {
    return Array.from(this.codingSubmissions.values())
      .filter(s => s.userId === userId && (!problemId || s.problemId === problemId))
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async getUserCodingProgress(userId: string): Promise<UserCodingProgress | undefined> {
    return Array.from(this.userCodingProgress.values()).find(p => p.userId === userId);
  }

  async updateUserCodingProgress(userId: string, updates: Partial<UserCodingProgress>): Promise<UserCodingProgress> {
    let progress = await this.getUserCodingProgress(userId);
    if (!progress) {
      const id = randomUUID();
      progress = {
        id,
        userId,
        solvedCount: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        xp: 0,
        streak: 0,
        lastSolvedAt: null,
        rank: null,
        lastActiveAt: null,
        ...updates
      };
      this.userCodingProgress.set(id, progress);
    } else {
      progress = { ...progress, ...updates };
      this.userCodingProgress.set(progress.id, progress);
    }
    return progress;
  }

  // Categories
  async getProblemCategories(): Promise<ProblemCategory[]> {
    return Array.from(this.problemCategories.values());
  }

  async createProblemCategory(category: InsertProblemCategory): Promise<ProblemCategory> {
    const id = randomUUID();
    const newCategory: ProblemCategory = {
      ...category,
      id,
      description: category.description ?? null,
      icon: category.icon ?? null,
      problemCount: category.problemCount ?? 0,
    };
    this.problemCategories.set(id, newCategory);
    return newCategory;
  }

  // Badges
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter(b => b.userId === userId);
  }

  async awardBadge(userId: string, badge: InsertUserBadge): Promise<UserBadge> {
    const id = randomUUID();
    const newBadge: UserBadge = {
      ...badge,
      id,
      userId,
      badgeDescription: badge.badgeDescription ?? null,
      earnedAt: new Date(),
    };
    this.userBadges.set(id, newBadge);
    return newBadge;
  }

  // Leaderboard
  async getLeaderboard(limit: number = 100): Promise<UserCodingProgress[]> {
    return Array.from(this.userCodingProgress.values())
      .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
      .slice(0, limit);
  }

  // Solved Problems
  async markProblemSolved(userId: string, problemId: string): Promise<SolvedProblem> {
    const existing = Array.from(this.solvedProblems.values())
      .find(sp => sp.userId === userId && sp.problemId === problemId);

    if (existing) {
      return existing;
    }

    const id = randomUUID();
    const solved: SolvedProblem = {
      id,
      userId,
      problemId,
      firstSolvedAt: new Date(),
    };
    this.solvedProblems.set(id, solved);
    return solved;
  }

  async getUserSolvedProblems(userId: string): Promise<SolvedProblem[]> {
    return Array.from(this.solvedProblems.values())
      .filter(sp => sp.userId === userId);
  }

  async isProblemSolved(userId: string, problemId: string): Promise<boolean> {
    return Array.from(this.solvedProblems.values())
      .some(sp => sp.userId === userId && sp.problemId === problemId);
  }
}

let storageImpl: IStorage;
if (process.env.DATABASE_URL) {
  try {
    storageImpl = new DrizzleStorage();
    console.log('[storage] Using Drizzle (Postgres) storage');
  } catch (err) {
    console.error('[storage] Failed to initialize DrizzleStorage, falling back to MemStorage', err);
    storageImpl = new MemStorage();
  }
} else {
  console.log('[storage] DATABASE_URL not set, using in-memory storage');
  storageImpl = new MemStorage();
}

export const storage = storageImpl;
