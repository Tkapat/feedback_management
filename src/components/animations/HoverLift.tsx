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