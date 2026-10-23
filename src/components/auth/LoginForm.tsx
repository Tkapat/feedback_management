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

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from("[data-anim]", { y: 24, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" });
    });
    return () => mm.revert();
  }, { scope: root });

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
        <div data-anim><Input label="Email" type="email" placeholder="you@college.edu" autoComplete="email" error={errors.email?.message} {...register("email")} /></div>
        <div data-anim><Input label="Password" type="password" placeholder="••••••••" autoComplete="current-password" error={errors.password?.message} {...register("password")} /></div>
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