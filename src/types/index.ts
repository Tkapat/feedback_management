export type Role = "student" | "admin";
export type FeedbackType = "appreciation" | "complaint" | "suggestion";
export type FeedbackCategory = "teaching" | "classroom" | "laboratory" | "other";
export type FeedbackStatus = "pending" | "in_review" | "resolved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  rollNo?: string;
  department?: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
}

export interface Faculty {
  _id: string;
  name: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  semester: number;
  faculty: Faculty;
}

export interface Reply {
  _id: string;
  message: string;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  category: FeedbackCategory;
  type: FeedbackType;
  rating?: number;
  tags: string[];
  comment: string;
  isAnonymous: boolean;
  status: FeedbackStatus;
  priority: boolean;
  replies: Reply[];
  createdAt: string;
  department?: Department;
  subject?: Pick<Subject, "_id" | "name" | "code">;
  faculty?: Faculty;
  student?: { name: string; rollNo: string; email: string } | null;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Overview {
  total: number;
  avgRating: number;
  pending: number;
  resolvedPercent: number;
  byType: { name: FeedbackType; value: number }[];
  byStatus: { name: FeedbackStatus; value: number }[];
  monthly: { month: string; count: number }[];
}

export interface GroupStat {
  _id: string;
  name: string;
  total: number;
  avgRating: number;
  complaints: number;
  appreciations: number;
  suggestions: number;
}

export interface Settings {
  feedbackOpen: boolean;
  startDate?: string;
  endDate?: string;
  currentCycle: string;
  tags: string[];
}