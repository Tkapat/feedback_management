import type { FeedbackCategory, FeedbackStatus, FeedbackType } from "@/types";

export const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "teaching", label: "Teaching" },
  { value: "classroom", label: "Classroom" },
  { value: "laboratory", label: "Laboratory" },
  { value: "other", label: "Other services" },
];

export const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: "appreciation", label: "Appreciation" },
  { value: "complaint", label: "Complaint" },
  { value: "suggestion", label: "Suggestion" },
];

export const STATUSES: { value: FeedbackStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

export const STATUS_BADGE: Record<FeedbackStatus, string> = {
  pending: "bg-amber-50 text-amber-600 border border-amber-100",
  in_review: "bg-sky-50 text-sky-600 border border-sky-100",
  resolved: "bg-green-50 text-green-600 border border-green-100",
  rejected: "bg-red-50 text-red-600 border border-red-100",
};

export const STATUS_DOT: Record<FeedbackStatus, string> = {
  pending: "bg-amber-500",
  in_review: "bg-sky-500",
  resolved: "bg-green-500",
  rejected: "bg-red-500",
};