import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  Clock,
  BarChart3,
  MessageSquare,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export const STUDENT_NAV: NavItem[] = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Give Feedback", href: "/student/feedback/new", icon: FileText },
  { name: "History", href: "/student/feedback/history", icon: Clock },
];

export const ADMIN_NAV: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Departments", href: "/admin/departments", icon: Building2 },
  { name: "Faculty", href: "/admin/faculty", icon: Users },
  { name: "Subjects", href: "/admin/subjects", icon: BookOpen },
  { name: "Students", href: "/admin/students", icon: GraduationCap },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export const navFor = (role: Role): NavItem[] =>
  role === "admin" ? ADMIN_NAV : STUDENT_NAV;