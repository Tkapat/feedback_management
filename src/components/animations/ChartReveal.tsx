"use client";
import { ReactNode, useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

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