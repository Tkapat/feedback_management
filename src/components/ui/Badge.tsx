import { ReactNode } from "react";

export default function Badge({ children, variant = "default", className = "" }: { children: ReactNode; variant?: "default" | "success" | "warning" | "info" | "danger"; className?: string }) {
  const tones = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-sky-50 text-sky-600",
    danger: "bg-red-50 text-red-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[variant]} ${className}`}>{children}</span>
  );
}