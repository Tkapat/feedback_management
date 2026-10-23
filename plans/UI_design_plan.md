# FRONTEND AND UI PLAN

## Principles
1. Clean and calm: whitespace, soft shadows, 12-16px radius.
2. One primary colour (indigo), neutral greys, semantic colours only for status.
3. Motion with purpose. Never block the user. Respect prefers-reduced-motion.
4. Pages are thin. Pages fetch data and compose components from /components.
5. Every visual block is its own component so it can be swapped or restyled alone.

## Tokens
primary-600 #4F46E5 · primary-50 #EEF2FF · accent #14B8A6 · bg #F8FAFC · surface #FFFFFF
border #E2E8F0 · text #0F172A / #475569 / #94A3B8
success #16A34A (resolved, appreciation) · warning #F59E0B (pending, suggestion)
info #0EA5E9 (in review) · danger #DC2626 (complaint, rejected)
Fonts: Plus Jakarta Sans (headings), Inter (body). Spacing: 8px grid.

## Layout
Dashboards: fixed sidebar 256px (drawer on mobile) + sticky topbar + content max-w 1280px.
Auth: split screen. Left = gradient brand panel with floating blobs. Right = form.
Tables become stacked cards below md.

## Pages
Auth: Role toggle pill (Student | Admin) on top. Register link only in Student mode.
Student: Dashboard (4 stat cards, CTA, 5 recent) · New Feedback (conditional form) ·
         History (filter chips, cards, pagination) · Detail (info, timeline, replies)
Admin:   Dashboard (KPIs, donut, faculty bar, dept grouped bar, trend line, 2 leaderboards, concerns cloud)
         Feedback (filter bar, table, side drawer with reply/status/priority)
         Analytics (tabs: Faculty | Subject | Department)
         Departments / Faculty / Subjects (table + modal form)
         Students (search, activate switch) · Settings (window, dates, tag manager)

## GSAP animation map
| Where            | Effect                                              | Component            |
| Auth load        | brand panel slides in, form items stagger           | LoginForm, AuthBrandPanel |
| Brand blobs      | slow infinite floating loop                         | AuthBrandPanel       |
| Role toggle      | pill slides (xPercent), heading crossfades          | RoleToggle, LoginForm |
| Page enter       | children y:24→0, fade, stagger 0.08                 | Reveal               |
| KPI numbers      | count 0→value, 1.2s power2.out                      | AnimatedCounter      |
| Cards            | hover lift -4px + shadow                            | HoverLift            |
| Charts           | fade + scale 0.96→1 on scroll into view             | ChartReveal          |
| Star rating      | pop scale 1→1.35→1 back.out                         | StarRating           |
| Drawer           | slide from right + backdrop fade                    | Drawer               |
| Table rows       | stagger fade on data load                           | DataTable            |
Rules: durations 0.25-0.8s, ease power3.out / power2.inOut, always wrap in
gsap.matchMedia with prefers-reduced-motion, use useGSAP for cleanup, animate on mount or
event only (never every re-render), keep GSAP inside components/animations or the component that owns it.

## States
Skeleton shimmer while loading · EmptyState with CTA · inline field errors · toast for server errors.


## Important codes to use --

# client setup
npx create-next-app@latest client --typescript --tailwind --app --src-dir --eslint
cd client
npm i axios gsap @gsap/react recharts react-hook-form zod @hookform/resolvers react-hot-toast lucide-react
ts
// client/src/types/index.ts
export type Role = "student" | "admin";
export type FeedbackType = "appreciation" | "complaint" | "suggestion";
export type FeedbackCategory = "teaching" | "classroom" | "laboratory" | "other";
export type FeedbackStatus = "pending" | "in_review" | "resolved" | "rejected";

export interface User { id: string; name: string; email: string; role: Role; rollNo?: string; department?: string }
export interface Department { _id: string; name: string; code: string }
export interface Faculty { _id: string; name: string }
export interface Subject { _id: string; name: string; code: string; semester: number; faculty: Faculty }
export interface Reply { _id: string; message: string; createdAt: string }

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

export interface PageMeta { page: number; limit: number; total: number; pages: number }
export interface Overview {
  total: number; avgRating: number; pending: number; resolvedPercent: number;
  byType: { name: FeedbackType; value: number }[];
  byStatus: { name: FeedbackStatus; value: number }[];
  monthly: { month: string; count: number }[];
}
export interface GroupStat {
  _id: string; name: string; total: number; avgRating: number;
  complaints: number; appreciations: number; suggestions: number;
}
export interface Settings { feedbackOpen: boolean; startDate?: string; endDate?: string; currentCycle: string; tags: string[] }
ts
// client/src/lib/gsap.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register once. Import gsap from here everywhere.
gsap.registerPlugin(useGSAP, ScrollTrigger);

// Only run animations when the user has not asked for reduced motion
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
ts
// client/src/lib/api.ts
import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // sends the httpOnly cookie
});

export const getErrorMessage = (err: unknown): string =>
  ((err as AxiosError<{ message?: string }>)?.response?.data?.message) ?? "Something went wrong";

export default api;
ts
// client/src/hooks/useFetch.ts
"use client";
import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import type { PageMeta } from "@/types";

export default function useFetch<T>(url: string | null, params?: Record<string, unknown>) {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify(params ?? {});

  const load = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await api.get(url, { params: JSON.parse(key) });
      setData(res.data.data as T);
      setMeta(res.data.meta ?? null);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [url, key]);

  useEffect(() => { load(); }, [load]);
  return { data, meta, loading, error, reload: load };
}
tsx
// client/src/context/AuthContext.tsx
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
tsx
// client/src/components/auth/ProtectedRoute.tsx
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
    return <div className="grid min-h-screen place-items-center"><div className="skeleton h-10 w-40 rounded-xl" /></div>;
  }
  return <>{children}</>;
}
4.3 Code: GSAP animation components (all in components/animations/)
tsx
// client/src/components/animations/Reveal.tsx
"use client";
import { ReactNode, useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

interface Props { children: ReactNode; className?: string; y?: number; stagger?: number; delay?: number }

// Wrap a group: its direct children fade/slide in one after another
export default function Reveal({ children, className = "", y = 24, stagger = 0.08, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from(ref.current!.children, { y, opacity: 0, duration: 0.7, delay, stagger, ease: "power3.out", clearProps: "transform,opacity" });
    });
    return () => mm.revert();
  }, { scope: ref });

  return <div ref={ref} className={className}>{children}</div>;
}
tsx
// client/src/components/animations/AnimatedCounter.tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

interface Props { value: number; decimals?: number; suffix?: string }

export default function AnimatedCounter({ value, decimals = 0, suffix = "" }: Props) {
  const el = useRef<HTMLSpanElement>(null);
  const format = (n: number) => n.toFixed(decimals) + suffix;

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const obj = { n: 0 };
      gsap.to(obj, {
        n: value, duration: 1.2, ease: "power2.out",
        onUpdate: () => { if (el.current) el.current.textContent = format(obj.n); },
      });
    });
    return () => mm.revert();
  }, { dependencies: [value] });

  // Final value is rendered by default (SSR and reduced-motion safe)
  return <span ref={el}>{format(value)}</span>;
}
tsx
// client/src/components/animations/HoverLift.tsx
"use client";
import { ReactNode, useRef } from "react";
import { gsap } from "@/lib/gsap";

const REST = "0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06)";
const LIFT = "0 12px 32px rgba(79,70,229,.15)";

export default function HoverLift({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const to = (y: number, boxShadow: string) =>
    gsap.to(ref.current, { y, boxShadow, duration: 0.25, ease: "power2.out", overwrite: "auto" });

  return (
    <div ref={ref} className={className}
      onMouseEnter={() => to(-4, LIFT)} onMouseLeave={() => to(0, REST)}>
      {children}
    </div>
  );
}
tsx
// client/src/components/animations/ChartReveal.tsx
"use client";
import { ReactNode, useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

// Wrap any chart card: fades and scales in when scrolled into view
export default function ChartReveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from(ref.current, {
        opacity: 0, scale: 0.96, y: 20, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
    });
    return () => mm.revert();
  }, { scope: ref });

  return <div ref={ref} className={className}>{children}</div>;
}
tsx
// client/src/components/ui/Drawer.tsx
"use client";
import { ReactNode, useRef } from "react";
import { X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode }

export default function Drawer({ open, onClose, title, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useGSAP(() => {
    const d = first.current ? 0 : 0.4;
    first.current = false;
    gsap.to(panel.current, { xPercent: open ? 0 : 100, duration: d, ease: "power3.inOut" });
    gsap.to(backdrop.current, { opacity: open ? 1 : 0, duration: d });
  }, { dependencies: [open] });

  return (
    <>
      <div ref={backdrop} onClick={onClose} style={{ opacity: 0 }}
        className={`fixed inset-0 z-40 bg-slate-900/40 ${open ? "" : "pointer-events-none"}`} />
      <aside ref={panel} style={{ transform: "translateX(100%)" }} aria-hidden={!open}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button>
        </div>
        {children}
      </aside>
    </>
  );
}
tsx
// client/src/components/student/StarRating.tsx
"use client";
import { useRef, useState } from "react";
import { Star } from "lucide-react";
import { gsap } from "@/lib/gsap";

interface Props { value?: number; onChange: (n: number) => void }

export default function StarRating({ value = 0, onChange }: Props) {
  const [hover, setHover] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (n: number) => {
    onChange(n);
    gsap.fromTo(refs.current[n - 1], { scale: 1 },
      { scale: 1.35, duration: 0.18, yoyo: true, repeat: 1, ease: "back.out(3)" });
  };

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" ref={(el) => { refs.current[n - 1] = el; }}
          onClick={() => pick(n)} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`} className="p-1">
          <Star size={30} className={n <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
        </button>
      ))}
    </div>
  );
}
4.4 Code: auth UI (toggle, brand panel, login form)
tsx
// client/src/components/auth/RoleToggle.tsx
"use client";
import { useRef } from "react";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Role } from "@/types";

const OPTIONS = [
  { value: "student" as Role, label: "Student", Icon: GraduationCap },
  { value: "admin" as Role, label: "Admin", Icon: ShieldCheck },
];

export default function RoleToggle({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useGSAP(() => {
    gsap.to(pill.current, {
      xPercent: value === "admin" ? 100 : 0,
      duration: first.current ? 0 : 0.45,
      ease: "power3.inOut",
    });
    first.current = false;
  }, { dependencies: [value], scope: wrap });

  return (
    <div ref={wrap} role="tablist" aria-label="Login as" className="rounded-2xl bg-slate-100 p-1">
      <div className="relative grid grid-cols-2">
        <span ref={pill} className="absolute inset-y-0 left-0 w-1/2 rounded-xl bg-white shadow-soft" />
        {OPTIONS.map(({ value: v, label, Icon }) => (
          <button key={v} type="button" role="tab" aria-selected={value === v} onClick={() => onChange(v)}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              value === v ? "text-primary-600" : "text-ink-600 hover:text-ink-900"}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
tsx
// client/src/components/auth/AuthBrandPanel.tsx
"use client";
import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

export default function AuthBrandPanel() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from(root.current, { xPercent: -8, opacity: 0, duration: 0.9, ease: "power3.out" });
      gsap.from("[data-copy]", { y: 24, opacity: 0, duration: 0.8, stagger: 0.12, delay: 0.3, ease: "power3.out" });
      // Slow floating blobs (infinite, yoyo)
      gsap.to("[data-blob='1']", { y: -30, x: 20, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to("[data-blob='2']", { y: 25, x: -25, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <aside ref={root} className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div data-blob="1" className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div data-blob="2" className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-accent-500/30 blur-3xl" />
      <h2 data-copy className="relative text-xl font-bold">🎓 CampusVoice</h2>
      <div className="relative">
        <h3 data-copy className="text-4xl font-bold leading-tight">Your voice shapes a better campus.</h3>
        <p data-copy className="mt-4 max-w-md text-white/80">
          Share feedback on teaching, classrooms and facilities. Track every response in one place.
        </p>
      </div>
      <p data-copy className="relative text-sm text-white/60">College Feedback Management System</p>
    </aside>
  );
}
tsx
// client/src/components/auth/LoginForm.tsx
"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { loginSchema, LoginValues } from "@/lib/validators";
import type { Role } from "@/types";
import RoleToggle from "./RoleToggle";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const COPY: Record<Role, { title: string; sub: string }> = {
  student: { title: "Welcome back", sub: "Sign in to share and track your feedback." },
  admin: { title: "Admin console", sub: "Sign in to manage feedback and analytics." },
};

export default function LoginForm() {
  const [role, setRole] = useState<Role>("student");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  // Entrance: toggle, heading, fields stagger up
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from("[data-anim]", { y: 24, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" });
    });
    return () => mm.revert();
  }, { scope: root });

  // Heading text crossfade when role changes
  const changeRole = (next: Role) => {
    if (next === role) return;
    gsap.to(heading.current, {
      opacity: 0, y: -8, duration: 0.18,
      onComplete: () => {
        setRole(next);
        gsap.to(heading.current, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      },
    });
  };

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true);
    try {
      const user = await login({ ...values, role });
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      router.replace(user.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={root} className="w-full max-w-md">
      <div data-anim><RoleToggle value={role} onChange={changeRole} /></div>

      <div ref={heading} data-anim className="mt-8">
        <h1 className="text-3xl font-bold">{COPY[role].title}</h1>
        <p className="mt-2 text-ink-600">{COPY[role].sub}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div data-anim><Input label="Email" type="email" placeholder="you@college.edu" error={errors.email?.message} {...register("email")} /></div>
        <div data-anim><Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} /></div>
        <div data-anim><Button type="submit" loading={submitting} className="w-full">Sign in as {role === "admin" ? "Admin" : "Student"}</Button></div>
      </form>

      {role === "student" && (
        <p className="mt-6 text-center text-sm text-ink-600">
          New here? <Link href="/register" className="font-semibold text-primary-600 hover:underline">Create an account</Link>
        </p>
      )}
    </div>
  );
}
tsx
// client/src/app/(auth)/layout.tsx
import { ReactNode } from "react";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel />
      <section className="flex items-center justify-center p-6 sm:p-12">{children}</section>
    </main>
  );
}
tsx
// client/src/app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";
export default function LoginPage() { return <LoginForm />; }
4.5 Code: “component, then import into page” pattern
tsx
// client/src/components/ui/Card.tsx
import { ReactNode } from "react";
export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}
tsx
// client/src/components/admin/KpiCards.tsx
import { MessageSquare, Star, Clock, CheckCircle2, LucideIcon } from "lucide-react";
import HoverLift from "@/components/animations/HoverLift";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import Reveal from "@/components/animations/Reveal";
import type { Overview } from "@/types";

const TONES = {
  primary: "bg-primary-50 text-primary-600", success: "bg-green-50 text-green-600",
  warning: "bg-amber-50 text-amber-600", info: "bg-sky-50 text-sky-600",
};

function Kpi({ label, value, decimals = 0, suffix = "", Icon, tone }:
  { label: string; value: number; decimals?: number; suffix?: string; Icon: LucideIcon; tone: keyof typeof TONES }) {
  return (
    <HoverLift className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-600">{label}</p>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${TONES[tone]}`}><Icon size={18} /></span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold"><AnimatedCounter value={value} decimals={decimals} suffix={suffix} /></p>
    </HoverLift>
  );
}

export default function KpiCards({ data }: { data: Overview }) {
  return (
    <Reveal className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="Total feedback" value={data.total} Icon={MessageSquare} tone="primary" />
      <Kpi label="Average rating" value={data.avgRating} decimals={1} Icon={Star} tone="warning" />
      <Kpi label="Pending" value={data.pending} Icon={Clock} tone="info" />
      <Kpi label="Resolved" value={data.resolvedPercent} suffix="%" Icon={CheckCircle2} tone="success" />
    </Reveal>
  );
}
tsx
// client/src/components/charts/FacultyRatingBar.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import ChartReveal from "@/components/animations/ChartReveal";
import type { GroupStat } from "@/types";

export default function FacultyRatingBar({ data }: { data: GroupStat[] }) {
  return (
    <ChartReveal className="card p-5">
      <h3 className="mb-4 font-semibold">Average rating per faculty</h3>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="avgRating" fill="#4F46E5" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartReveal>
  );
}
tsx
// client/src/components/charts/TypeDonutChart.tsx
"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartReveal from "@/components/animations/ChartReveal";
import type { Overview } from "@/types";

const COLORS = { appreciation: "#16A34A", complaint: "#DC2626", suggestion: "#F59E0B" };

export default function TypeDonutChart({ data }: { data: Overview["byType"] }) {
  return (
    <ChartReveal className="card p-5">
      <h3 className="mb-4 font-semibold">Feedback by type</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
              {data.map((d) => <Cell key={d.name} fill={COLORS[d.name]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartReveal>
  );
}
tsx
// client/src/app/admin/dashboard/page.tsx   ← thin page: fetch + compose
"use client";
import useFetch from "@/hooks/useFetch";
import PageHeader from "@/components/layout/PageHeader";
import KpiCards from "@/components/admin/KpiCards";
import TypeDonutChart from "@/components/charts/TypeDonutChart";
import FacultyRatingBar from "@/components/charts/FacultyRatingBar";
import type { Overview, GroupStat } from "@/types";

export default function AdminDashboardPage() {
  const { data: overview, loading } = useFetch<Overview>("/admin/stats/overview");
  const { data: faculty } = useFetch<GroupStat[]>("/admin/stats/faculty");

  if (loading || !overview) return <div className="skeleton h-64 rounded-2xl" />;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of all student feedback" />
      <KpiCards data={overview} />
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><FacultyRatingBar data={(faculty ?? []).slice(0, 10)} /></div>
        <TypeDonutChart data={overview.byType} />
      </div>
    </>
  );
}
4.6 Code: student feedback form (dependent dropdowns, conditional fields)
ts
// client/src/lib/validators.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  rollNo: z.string().min(2, "Roll number is required"),
  department: z.string().min(1, "Select a department"),
  password: z.string().min(8, "At least 8 characters")
    .regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number"),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const feedbackSchema = z.object({
  category: z.enum(["teaching", "classroom", "laboratory", "other"]),
  type: z.enum(["appreciation", "complaint", "suggestion"]),
  department: z.string().min(1, "Select a department"),
  subject: z.string().optional(),
  faculty: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  tags: z.array(z.string()).max(5),
  comment: z.string().min(10, "Write at least 10 characters").max(1000),
  isAnonymous: z.boolean(),
})
.refine((d) => d.category !== "teaching" || !!d.subject, { message: "Select a subject", path: ["subject"] })
.refine((d) => d.category !== "teaching" || !!d.rating, { message: "Please give a rating", path: ["rating"] });
export type FeedbackValues = z.infer<typeof feedbackSchema>;
tsx
// client/src/components/student/FeedbackForm.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "@/lib/api";
import useFetch from "@/hooks/useFetch";
import { feedbackSchema, FeedbackValues } from "@/lib/validators";
import type { Department, Settings, Subject } from "@/types";
import StarRating from "./StarRating";
import TagSelector from "./TagSelector";
import Button from "@/components/ui/Button";

const CATEGORIES = [["teaching", "Teaching"], ["classroom", "Classroom"], ["laboratory", "Laboratory"], ["other", "Other services"]] as const;
const TYPES = [["appreciation", "Appreciation"], ["complaint", "Complaint"], ["suggestion", "Suggestion"]] as const;

function Chip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${active ? "border-primary-600 bg-primary-600 text-white" : "border-slate-200 bg-white text-ink-600 hover:bg-slate-50"}`}>
      {children}
    </button>
  );
}

export default function FeedbackForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { data: departments } = useFetch<Department[]>("/departments");
  const { data: settings } = useFetch<Settings>("/settings");

  const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { category: "teaching", type: "appreciation", department: "", subject: "", faculty: "", tags: [], comment: "", isAnonymous: false },
  });

  const category = watch("category");
  const department = watch("department");
  const subjectId = watch("subject");
  const isTeaching = category === "teaching";
  const selectedSubject = subjects.find((s) => s._id === subjectId);

  // 1) Department changes → reset and load its subjects
  useEffect(() => {
    setValue("subject", ""); setValue("faculty", ""); setSubjects([]);
    if (department) api.get("/subjects", { params: { department } }).then((r) => setSubjects(r.data.data));
  }, [department, setValue]);

  // 2) Subject changes → auto-fill faculty
  useEffect(() => { setValue("faculty", selectedSubject?.faculty._id ?? ""); }, [selectedSubject, setValue]);

  const onSubmit = async (values: FeedbackValues) => {
    setSubmitting(true);
    try {
      const payload: Partial<FeedbackValues> = { ...values };
      if (!isTeaching) { delete payload.subject; delete payload.faculty; delete payload.rating; }
      await api.post("/feedback", payload);
      toast.success("Feedback submitted. Thank you!");
      router.push("/student/feedback/history");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const closed = settings && !settings.feedbackOpen;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-7 p-6 sm:p-8">
      {closed && <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Feedback is currently closed by the administrator.</div>}

      <Controller name="category" control={control} render={({ field }) => (
        <div><p className="mb-2 text-sm font-medium text-ink-600">Category</p>
          <div className="flex flex-wrap gap-2">{CATEGORIES.map(([v, l]) => <Chip key={v} active={field.value === v} onClick={() => field.onChange(v)}>{l}</Chip>)}</div></div>
      )} />

      <Controller name="type" control={control} render={({ field }) => (
        <div><p className="mb-2 text-sm font-medium text-ink-600">Feedback type</p>
          <div className="flex flex-wrap gap-2">{TYPES.map(([v, l]) => <Chip key={v} active={field.value === v} onClick={() => field.onChange(v)}>{l}</Chip>)}</div></div>
      )} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-ink-600">Department</p>
          <select className="input" {...register("department")}>
            <option value="">Select department</option>
            {departments?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
        </div>

        {isTeaching && (
          <div>
            <p className="mb-2 text-sm font-medium text-ink-600">Subject</p>
            <select className="input" disabled={!department} {...register("subject")}>
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name} (Sem {s.semester})</option>)}
            </select>
            {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
          </div>
        )}
      </div>

      {isTeaching && selectedSubject && (
        <div className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">Faculty: <strong>{selectedSubject.faculty.name}</strong></div>
      )}

      {isTeaching && (
        <Controller name="rating" control={control} render={({ field }) => (
          <div><p className="mb-2 text-sm font-medium text-ink-600">Your rating</p>
            <StarRating value={field.value} onChange={field.onChange} />
            {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>}</div>
        )} />
      )}

      <Controller name="tags" control={control} render={({ field }) => (
        <div><p className="mb-2 text-sm font-medium text-ink-600">Quick tags (optional)</p>
          <TagSelector options={settings?.tags ?? []} value={field.value} onChange={field.onChange} /></div>
      )} />

      <div>
        <p className="mb-2 text-sm font-medium text-ink-600">Comments</p>
        <textarea rows={5} maxLength={1000} className="input resize-none" placeholder="Tell us what went well or what can improve..." {...register("comment")} />
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-red-600">{errors.comment?.message}</span>
          <span className="text-ink-400">{watch("comment").length}/1000</span>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-600">
        <input type="checkbox" className="h-4 w-4 rounded accent-indigo-600" {...register("isAnonymous")} />
        Submit anonymously (hidden from the administrator)
      </label>

      <Button type="submit" loading={submitting} disabled={closed} className="w-full sm:w-auto">Submit feedback</Button>
    </form>
  );
}
tsx
// client/src/components/student/TagSelector.tsx
interface Props { options: string[]; value: string[]; onChange: (v: string[]) => void; max?: number }

export default function TagSelector({ options, value, onChange, max = 5 }: Props) {
  const toggle = (t: string) => {
    if (value.includes(t)) onChange(value.filter((x) => x !== t));
    else if (value.length < max) onChange([...value, t]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((t) => (
        <button key={t} type="button" onClick={() => toggle(t)}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition ${value.includes(t) ? "border-primary-600 bg-primary-50 text-primary-700" : "border-slate-200 text-ink-600 hover:bg-slate-50"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}
tsx
// client/src/app/student/feedback/new/page.tsx   ← thin page
import PageHeader from "@/components/layout/PageHeader";
import FeedbackForm from "@/components/student/FeedbackForm";

export default function NewFeedbackPage() {
  return (
    <>
      <PageHeader title="Give feedback" subtitle="Help us improve teaching and facilities." />
      <div className="max-w-3xl"><FeedbackForm /></div>
    </>
  );
}
4.7 Code: tailwind and global styles
ts
// client/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: "#EEF2FF", 100: "#E0E7FF", 500: "#6366F1", 600: "#4F46E5", 700: "#4338CA" },
        accent: { 500: "#14B8A6" },
        ink: { 900: "#0F172A", 600: "#475569", 400: "#94A3B8" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06)",
        lift: "0 12px 32px rgba(79,70,229,.15)",
      },
    },
  },
  plugins: [],
};
export default config;
css
/* client/src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { @apply bg-slate-50 text-ink-900 antialiased; }
  h1, h2, h3 { @apply font-display; }
  :focus-visible { @apply outline-none ring-2 ring-primary-500 ring-offset-2; }
}
@layer components {
  .card { @apply rounded-2xl border border-slate-200 bg-white shadow-soft; }
  .input { @apply w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition placeholder:text-ink-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100; }
}
.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }