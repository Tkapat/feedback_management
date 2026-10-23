"use client";
import { ReactNode } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute role="admin">
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}