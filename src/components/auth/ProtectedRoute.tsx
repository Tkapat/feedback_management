"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";

export default function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
  }, [user, loading, role, router]);

  if (loading || !user || user.role !== role) {
    return <div className="grid min-h-screen place-items-center"><div className="h-10 w-40 rounded-xl bg-slate-200 animate-pulse" /></div>;
  }
  return <>{children}</>;
}