import { queryClient, apiRequest } from "./queryClient";
import type { User, Job, Connection, Message, Notification, JobApplication, SavedJob, Experience, Education, Skill, PipelineColumn } from "@shared/schema";

// Current user ID (hardcoded for MVP - in production would come from auth)
export const CURRENT_USER_ID = "current-user-id";

// Users API
export async function getUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const res = await apiRequest("PATCH", `/api/users/${id}`, updates);
  return res.json();
}

// Experiences API
export async function getExperiences(userId: string): Promise<Experience[]> {
  const response = await fetch(`/api/users/${userId}/experiences`);
  if (!response.ok) throw new Error("Failed to fetch experiences");
  return response.json();
}

// Education API
export async function getEducation(userId: string): Promise<Education[]> {
  const response = await fetch(`/api/users/${userId}/education`);
  if (!response.ok) throw new Error("Failed to fetch education");
  return response.json();
}

// Skills API
export async function getSkills(userId: string): Promise<Skill[]> {
  const response = await fetch(`/api/users/${userId}/skills`);
  if (!response.ok) throw new Error("Failed to fetch skills");
  return response.json();
}

// Jobs API
export async function getJobs(): Promise<Job[]> {
  const response = await fetch("/api/jobs");
  if (!response.ok) throw new Error("Failed to fetch jobs");
  return response.json();
}

export async function searchJobs(query?: string, location?: string): Promise<Job[]> {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (location) params.append("location", location);

  const response = await fetch(`/api/jobs?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to search jobs");
  return response.json();
}

export async function applyToJob(userId: string, jobId: string): Promise<JobApplication> {
  const res = await apiRequest("POST", "/api/applications", {
    userId,
    jobId,
    status: "applied",
  });
  return res.json();
}

export async function getApplications(userId: string): Promise<JobApplication[]> {
  const response = await fetch(`/api/users/${userId}/applications`);
  if (!response.ok) throw new Error("Failed to fetch applications");
  return response.json();
}

export async function createApplication(data: any): Promise<JobApplication> {
  const res = await apiRequest("POST", "/api/applications", data);
  return res.json();
}

export async function updateApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication> {
  const res = await apiRequest("PATCH", `/api/applications/${id}`, updates);
  return res.json();
}

export async function saveJob(userId: string, jobId: string): Promise<SavedJob> {
  const res = await apiRequest("POST", "/api/saved-jobs", { userId, jobId });
  return res.json();
}

export async function unsaveJob(userId: string, jobId: string): Promise<void> {
  await apiRequest("DELETE", `/api/users/${userId}/saved-jobs/${jobId}`, undefined);
}

export async function getSavedJobs(userId: string): Promise<SavedJob[]> {
  const response = await fetch(`/api/users/${userId}/saved-jobs`);
  if (!response.ok) throw new Error("Failed to fetch saved jobs");
  return response.json();
}

// Connections API
export async function getConnections(userId: string, status?: string): Promise<Connection[]> {
  const params = status ? `?status=${status}` : "";
  const response = await fetch(`/api/users/${userId}/connections${params}`);
  if (!response.ok) throw new Error("Failed to fetch connections");
  return response.json();
}

export async function createConnection(userId: string, connectedUserId: string): Promise<Connection> {
  const res = await apiRequest("POST", "/api/connections", {
    userId,
    connectedUserId,
    status: "pending",
  });
  return res.json();
}

export async function updateConnection(id: string, status: string): Promise<Connection> {
  const res = await apiRequest("PATCH", `/api/connections/${id}`, { status });
  return res.json();
}

export async function deleteConnection(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/connections/${id}`, undefined);
}

// Messages API
export async function getConversations(userId: string): Promise<Message[]> {
  const response = await fetch(`/api/users/${userId}/conversations`);
  if (!response.ok) throw new Error("Failed to fetch conversations");
  return response.json();
}

export async function getMessages(userId1: string, userId2: string): Promise<Message[]> {
  const response = await fetch(`/api/messages/${userId1}/${userId2}`);
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
  const res = await apiRequest("POST", "/api/messages", {
    senderId,
    receiverId,
    content,
    read: false,
  });
  return res.json();
}

// Notifications API
export async function getNotifications(userId: string): Promise<Notification[]> {
  const response = await fetch(`/api/users/${userId}/notifications`);
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiRequest("PATCH", `/api/notifications/${id}/read`, undefined);
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await apiRequest("PATCH", `/api/users/${userId}/notifications/read-all`, undefined);
}

// Pipeline Columns API
export async function getPipelineColumns(): Promise<PipelineColumn[]> {
  const response = await fetch("/api/pipeline-columns");
  if (!response.ok) throw new Error("Failed to fetch pipeline columns");
  return response.json();
}

export async function createPipelineColumn(data: any): Promise<PipelineColumn> {
  const res = await apiRequest("POST", "/api/pipeline-columns", data);
  return res.json();
}

export async function updatePipelineColumn(id: string, updates: Partial<PipelineColumn>): Promise<PipelineColumn> {
  const res = await apiRequest("PATCH", `/api/pipeline-columns/${id}`, updates);
  return res.json();
}

export async function deletePipelineColumn(id: string): Promise<void> {
  await apiRequest("DELETE", `/api/pipeline-columns/${id}`, undefined);
}
