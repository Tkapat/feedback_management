"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role === "admin") router.replace("/admin/dashboard");
    else router.replace("/student/dashboard");
  }, [user, loading, router]);

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-32 rounded-full bg-slate-200 animate-pulse" /></div>;
  return null;
}