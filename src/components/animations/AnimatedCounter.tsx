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

  return <span ref={el}>{format(value)}</span>;
}