"use client";
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/api";
import type { Role, User } from "@/types";

interface LoginPayload { email: string; password: string; role: Role }
interface Ctx {
  user: User | null;
  loading: boolean;
  login: (p: LoginPayload) => Promise<User>;
  register: (p: Record<string, string>) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((r) => setUser(r.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (p: LoginPayload) => {
    const { data } = await api.post("/auth/login", p);
    setUser(data.data);
    return data.data as User;
  }, []);

  const register = useCallback(async (p: Record<string, string>) => {
    const { data } = await api.post("/auth/register", p);
    setUser(data.data);
    return data.data as User;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};