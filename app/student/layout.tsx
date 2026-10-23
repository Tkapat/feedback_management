"use client";
import { ReactNode } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute role="student">
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}