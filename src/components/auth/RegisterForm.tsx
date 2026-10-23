"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import api from "@/lib/api";
import { registerSchema, RegisterValues } from "@/lib/validators";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Department } from "@/types";

export default function RegisterForm() {
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const { register } = useAuth();
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from("[data-anim]", { y: 24, opacity: 0, duration: 0.7, stagger: 0.08, ease: "power3.out" });
    });
    return () => mm.revert();
  }, { scope: root });

  useEffect(() => {
    api
      .get("/departments")
      .then((r) => setDepartments(r.data.data || []))
      .catch(() => {});
  }, []);

  const onSubmit = async (values: RegisterValues) => {
    setSubmitting(true);
    try {
      await register(values);
      toast.success("Account created — welcome!");
      router.replace("/student/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={root} className="w-full max-w-md">
      <div data-anim className="mt-8">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="mt-2 text-ink-600">Register as a student to share your feedback.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div data-anim>
          <Input label="Name" placeholder="John Doe" autoComplete="name" error={errors.name?.message} {...reg("name")} />
        </div>
        <div data-anim>
          <Input
            label="Email"
            type="email"
            placeholder="you@college.edu"
            autoComplete="email"
            error={errors.email?.message}
            {...reg("email")}
          />
        </div>
        <div data-anim>
          <Input
            label="Roll Number"
            placeholder="COMP001"
            autoComplete="off"
            error={errors.rollNo?.message}
            {...reg("rollNo")}
          />
        </div>
        <div data-anim>
          <p className="mb-2 text-sm font-medium text-ink-600">Department</p>
          <select className="input" {...reg("department")}>
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d._id} value={d.code}>
                {d.name}
              </option>
            ))}
            {departments.length === 0 && (
              <>
                <option value="COMP">Computer Engineering</option>
                <option value="IT">Information Technology</option>
                <option value="EXTC">Electronics & Telecommunication</option>
                <option value="MECH">Mechanical Engineering</option>
              </>
            )}
          </select>
          {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
        </div>
        <div data-anim>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            {...reg("password")}
          />
          <p className="mt-1.5 text-xs text-ink-400">At least 8 characters with a letter and a number.</p>
        </div>
        <div data-anim>
          <Button type="submit" loading={submitting} className="w-full">
            Create Account
          </Button>
        </div>
      </form>

      <p data-anim className="mt-6 text-center text-sm text-ink-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}