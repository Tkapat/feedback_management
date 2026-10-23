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