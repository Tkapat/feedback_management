"use client";
import { ReactNode, useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

interface Props { children: ReactNode; className?: string; y?: number; stagger?: number; delay?: number }

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