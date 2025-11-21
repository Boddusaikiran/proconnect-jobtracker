import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { db } from "./db";
import session from "express-session";
import createMemoryStore from "memorystore";
import { Pool } from 'pg';
import {
   connections,
   education,
   experiences,
   jobApplications,
   jobs,
   messages,
   notifications,
   pipelineColumns, // Added
   savedJobs,
   skills,
   users,
   type InsertJob,
   type InsertJobApplication,
   type InsertMessage,
   type Notification as AppNotification,
   type InsertNotification,
   type InsertUser,
   type PipelineColumn, // Added
   type InsertPipelineColumn, // Added
} from '../shared/schema';
import type {
   IStorage,
} from './storage';

const MemoryStore = createMemoryStore(session);

export class DrizzleStorage implements IStorage {
   sessionStore: session.Store; // Added
   db: typeof db; // Changed type

   constructor() { // Changed constructor signature and implementation
      this.db = db;
      this.sessionStore = new MemoryStore({
         checkPeriod: 86400000,
      });
   }

   // Users
   async getUser(id: string) {
      const res = await this.db.select().from(users).where(eq(users.id, id));
      return res[0];
   }

   async getUserByUsername(username: string) {
      const res = await this.db.select().from(users).where(eq(users.username, username));
      return res[0];
   }

   async getUserByEmail(email: string) {
      const res = await this.db.select().from(users).where(eq(users.email, email));
      return res[0];
   }

   async createUser(insertUser: InsertUser) {
      const [row] = await this.db.insert(users).values(insertUser).returning();
      return row;
   }

   async getAllUsers() {
      return await this.db.select().from(users);
   }

   async updateUser(id: string, updates: Partial<any>) {
      await this.db.update(users).set(updates).where(eq(users.id, id));
      return this.getUser(id);
   }

   // Experiences (minimal implementations that map to table)
   async getExperiences(userId: string) {
      return await this.db.select().from(experiences).where(eq(experiences.userId, userId));
   }

   async createExperience(insertExperience: any) {
      const [row] = await this.db.insert(experiences).values(insertExperience).returning();
      return row;
   }

   async updateExperience(id: string, updates: Partial<any>) {
      await this.db.update(experiences).set(updates).where(eq(experiences.id, id));
      const [row] = await this.db.select().from(experiences).where(eq(experiences.id, id));
      return row;
   }

   async deleteExperience(id: string): Promise<void> { // Changed return type and implementation
      await this.db.delete(experiences).where(eq(experiences.id, id));
   }

   // Education
   async getEducation(userId: string) {
      return await this.db.select().from(education).where(eq(education.userId, userId));
   }

   async createEducation(insertEducation: any) {
      const [row] = await this.db.insert(education).values(insertEducation).returning();
      return row;
   }

   async updateEducation(id: string, updates: Partial<any>) {
      await this.db.update(education).set(updates).where(eq(education.id, id));
      const [row] = await this.db.select().from(education).where(eq(education.id, id));
      return row;
   }

   async deleteEducation(id: string): Promise<void> { // Changed return type and implementation
      await this.db.delete(education).where(eq(education.id, id));
   }

   // Skills
   async getSkills(userId: string) {
      return await this.db.select().from(skills).where(eq(skills.userId, userId));
   }

   async createSkill(insertSkill: any) {
      const [row] = await this.db.insert(skills).values(insertSkill).returning();
      return row;
   }

   async updateSkill(id: string, updates: Partial<any>) {
      await this.db.update(skills).set(updates).where(eq(skills.id, id));
      const [row] = await this.db.select().from(skills).where(eq(skills.id, id));
      return row;
   }

   async deleteSkill(id: string): Promise<void> { // Changed return type and implementation
      await this.db.delete(skills).where(eq(skills.id, id));
   }

   // Connections (basic)
   async getConnections(userId: string, status?: string) {
      const q = this.db.select().from(connections).where(eq(connections.userId, userId));
      return await q;
   }

   async createConnection(insertConnection: any) {
      const [row] = await this.db.insert(connections).values(insertConnection).returning();
      return row;
   }

   async updateConnection(id: string, status: string) {
      await this.db.update(connections).set({ status }).where(eq(connections.id, id));
      const [row] = await this.db.select().from(connections).where(eq(connections.id, id));
      return row;
   }

   async deleteConnection(id: string): Promise<void> { // Changed return type and implementation
      await this.db.delete(connections).where(eq(connections.id, id));
   }

   async getMutualConnectionsCount(userId1: string, userId2: string) {
      // naive: use in-memory approach is complex in SQL here; return 0 for now
      return 0;
   }

   // Jobs
   async getAllJobs() {
      return await this.db.select().from(jobs).orderBy(desc(jobs.postedAt));
   }

   async getJob(id: string) {
      const res = await this.db.select().from(jobs).where(eq(jobs.id, id));
      return res[0];
   }

   async createJob(insertJob: InsertJob) {
      const [row] = await this.db.insert(jobs).values(insertJob).returning();
      return row;
   }

   async searchJobs(query: string, location?: string) {
      let q = this.db.select().from(jobs) as any;
      if (query) q = q.where(ilike(jobs.title, `%${query}%`));
      if (location) q = q.where(ilike(jobs.location, `%${location}%`));
      return await q;
   }

   // Applications
   async getApplications(userId: string) {
      return await this.db.select().from(jobApplications).where(eq(jobApplications.userId, userId));
   }

   async getApplicationByJobAndUser(jobId: string, userId: string) {
      const res = await this.db.select().from(jobApplications).where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.userId, userId)));
      return res[0];
   }

   async createApplication(application: InsertJobApplication) {
      const [row] = await this.db.insert(jobApplications).values(application).returning();
      return row;
   }

   async updateApplication(id: string, updates: Partial<any>) {
      await this.db.update(jobApplications).set(updates).where(eq(jobApplications.id, id));
      const [row] = await this.db.select().from(jobApplications).where(eq(jobApplications.id, id));
      return row;
   }

   // Saved Jobs
   async getSavedJobs(userId: string) {
      return await this.db.select().from(savedJobs).where(eq(savedJobs.userId, userId));
   }

   async createSavedJob(insertSavedJob: any) {
      const [row] = await this.db.insert(savedJobs).values(insertSavedJob).returning();
      return row;
   }

   async deleteSavedJob(userId: string, jobId: string): Promise<void> { // Changed return type and implementation
      await this.db
         .delete(savedJobs)
         .where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
   }

   async isSavedJob(userId: string, jobId: string) {
      const res = await this.db.select().from(savedJobs).where(and(eq(savedJobs.userId, userId), eq(savedJobs.jobId, jobId)));
      return res.length > 0;
   }

   // Messages
   async getConversations(userId: string) {
      // simplified: return messages involving the user
      return await this.db.select().from(messages).where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId))).orderBy(desc(messages.createdAt));
   }

   async getMessages(userId1: string, userId2: string) {
      return await this.db.select().from(messages).where(
         or(
            and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
            and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
         )
      ).orderBy(asc(messages.createdAt));
   }

   async createMessage(message: InsertMessage) {
      const [row] = await this.db.insert(messages).values(message).returning();
      return row;
   }

   async markMessageAsRead(id: string) {
      await this.db.update(messages).set({ read: true }).where(eq(messages.id, id));
      return true;
   }

   async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> { // Added
      await this.db
         .update(messages)
         .set({ read: true })
         .where(
            and(
               eq(messages.senderId, senderId), // Changed from fromId
               eq(messages.receiverId, receiverId), // Changed from toId
               eq(messages.read, false)
            )
         );
   }

   // Notifications
   async getNotifications(userId: string): Promise<AppNotification[]> { // Changed return type
      return await this.db
         .select()
         .from(notifications)
         .where(eq(notifications.userId, userId))
         .orderBy(desc(notifications.createdAt));
   }

   async createNotification(notification: InsertNotification): Promise<AppNotification> { // Changed return type and variable name
      const [newNotification] = await this.db
         .insert(notifications)
         .values(notification)
         .returning();
      return newNotification;
   }

   async markNotificationAsRead(id: string): Promise<AppNotification | undefined> {
      const [notification] = await this.db
         .update(notifications)
         .set({ read: true })
         .where(eq(notifications.id, id))
         .returning();
      return notification;
   }

   async markAllNotificationsAsRead(userId: string): Promise<boolean> {
      await this.db
         .update(notifications)
         .set({ read: true })
         .where(eq(notifications.userId, userId));
      return true;
   }

   // Pipeline Columns
   async getPipelineColumns(userId: string): Promise<PipelineColumn[]> {
      return await this.db
         .select()
         .from(pipelineColumns)
         .where(eq(pipelineColumns.userId, userId))
         .orderBy(pipelineColumns.order);
   }

   async createPipelineColumn(column: InsertPipelineColumn): Promise<PipelineColumn> {
      const [newColumn] = await this.db
         .insert(pipelineColumns)
         .values(column)
         .returning();
      return newColumn;
   }

   async updatePipelineColumn(id: string, updates: Partial<PipelineColumn>): Promise<PipelineColumn | undefined> {
      const [updatedColumn] = await this.db
         .update(pipelineColumns)
         .set(updates)
         .where(eq(pipelineColumns.id, id))
         .returning();
      return updatedColumn;
   }

   async deletePipelineColumn(id: string): Promise<void> {
      await this.db.delete(pipelineColumns).where(eq(pipelineColumns.id, id));
   }
}

export default DrizzleStorage;
