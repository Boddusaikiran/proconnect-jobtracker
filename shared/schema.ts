import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  headline: text("headline").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  location: text("location"),
  about: text("about"),
  role: text("role").default("candidate").notNull(), // 'candidate', 'recruiter', 'admin'
  googleId: text("google_id"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const experiences = pgTable("experiences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  companyLogo: text("company_logo"),
  location: text("location"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  current: boolean("current").default(false),
  description: text("description"),
});

export const education = pgTable("education", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  school: text("school").notNull(),
  degree: text("degree").notNull(),
  field: text("field").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  current: boolean("current").default(false),
});

export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  endorsements: integer("endorsements").default(0),
});

export const connections = pgTable("connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  connectedUserId: varchar("connected_user_id").notNull(),
  status: text("status").notNull(), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  companyLogo: text("company_logo"),
  location: text("location").notNull(),
  type: text("type").notNull(), // 'Full-time', 'Part-time', 'Contract', 'Internship'
  level: text("level").notNull(), // 'Entry level', 'Mid-Senior level', 'Director', 'Executive'
  salary: text("salary"),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  postedAt: timestamp("posted_at").defaultNow().notNull(),
});

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  jobId: varchar("job_id").notNull(),
  status: text("status").notNull(), // 'applied', 'reviewing', 'interview', 'offer', 'rejected'
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
});

export const savedJobs = pgTable("saved_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  jobId: varchar("job_id").notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'connection_request', 'connection_accepted', 'message', 'job_application', 'profile_view'
  content: text("content").notNull(),
  actorId: varchar("actor_id"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pipelineColumns = pgTable("pipeline_columns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  color: text("color").default("bg-gray-500/10 text-gray-500"),
});

// Coding Platform Tables

export const codingProblems = pgTable("coding_problems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  category: text("category").notNull(), // 'Arrays', 'DP', etc.
  companyTags: text("company_tags").array(), // ['Google', 'Amazon']
  constraints: text("constraints"),
  starterCode: text("starter_code").notNull(), // JSON string of { language: code }
  editorial: text("editorial"), // Solution explanation
  editorialCode: text("editorial_code"), // JSON string of { language: solution }
  timeComplexity: text("time_complexity"), // e.g., 'O(n log n)'
  spaceComplexity: text("space_complexity"), // e.g., 'O(n)'
  acceptanceRate: integer("acceptance_rate").default(0), // percentage
  totalSubmissions: integer("total_submissions").default(0),
  totalAccepted: integer("total_accepted").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const codingTestCases = pgTable("coding_test_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  problemId: varchar("problem_id").notNull(),
  input: text("input").notNull(),
  output: text("output").notNull(),
  isHidden: boolean("is_hidden").default(false),
});

export const codingSubmissions = pgTable("coding_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  problemId: varchar("problem_id").notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  status: text("status").notNull(), // 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', etc.
  runtime: integer("runtime"), // in ms
  memory: integer("memory"), // in KB
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const userCodingProgress = pgTable("user_coding_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  solvedCount: integer("solved_count").default(0),
  easySolved: integer("easy_solved").default(0),
  mediumSolved: integer("medium_solved").default(0),
  hardSolved: integer("hard_solved").default(0),
  xp: integer("xp").default(0),
  streak: integer("streak").default(0),
  lastSolvedAt: timestamp("last_solved_at"),
  rank: integer("rank").default(0),
  lastActiveAt: timestamp("last_active_at"),
});

export const problemCategories = pgTable("problem_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  problemCount: integer("problem_count").default(0),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  badgeType: text("badge_type").notNull(), // 'easy_solver', 'streak_7', etc.
  badgeName: text("badge_name").notNull(),
  badgeDescription: text("badge_description"),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const solvedProblems = pgTable("solved_problems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  problemId: varchar("problem_id").notNull(),
  firstSolvedAt: timestamp("first_solved_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertExperienceSchema = createInsertSchema(experiences).omit({
  id: true,
});

export const insertEducationSchema = createInsertSchema(education).omit({
  id: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  postedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  appliedAt: true,
});

export const insertSavedJobSchema = createInsertSchema(savedJobs).omit({
  id: true,
  savedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertPipelineColumnSchema = createInsertSchema(pipelineColumns).omit({
  id: true,
});

export const insertCodingProblemSchema = createInsertSchema(codingProblems).omit({
  id: true,
  createdAt: true,
});

export const insertCodingTestCaseSchema = createInsertSchema(codingTestCases).omit({
  id: true,
});

export const insertCodingSubmissionSchema = createInsertSchema(codingSubmissions).omit({
  id: true,
  submittedAt: true,
});

export const insertUserCodingProgressSchema = createInsertSchema(userCodingProgress).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = z.infer<typeof insertExperienceSchema>;

export type Education = typeof education.$inferSelect;
export type InsertEducation = z.infer<typeof insertEducationSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;

export type SavedJob = typeof savedJobs.$inferSelect;
export type InsertSavedJob = z.infer<typeof insertSavedJobSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type PipelineColumn = typeof pipelineColumns.$inferSelect;
export type InsertPipelineColumn = z.infer<typeof insertPipelineColumnSchema>;

export type CodingProblem = typeof codingProblems.$inferSelect;
export type InsertCodingProblem = z.infer<typeof insertCodingProblemSchema>;

export type CodingTestCase = typeof codingTestCases.$inferSelect;
export type InsertCodingTestCase = z.infer<typeof insertCodingTestCaseSchema>;

export type CodingSubmission = typeof codingSubmissions.$inferSelect;
export type InsertCodingSubmission = z.infer<typeof insertCodingSubmissionSchema>;

export type UserCodingProgress = typeof userCodingProgress.$inferSelect;
export type InsertUserCodingProgress = z.infer<typeof insertUserCodingProgressSchema>;

export const insertProblemCategorySchema = createInsertSchema(problemCategories).omit({
  id: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertSolvedProblemSchema = createInsertSchema(solvedProblems).omit({
  id: true,
  firstSolvedAt: true,
});

export type ProblemCategory = typeof problemCategories.$inferSelect;
export type InsertProblemCategory = z.infer<typeof insertProblemCategorySchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type SolvedProblem = typeof solvedProblems.$inferSelect;
export type InsertSolvedProblem = z.infer<typeof insertSolvedProblemSchema>;
