"use client";
import { ReactNode, useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

interface Props {
  items: unknown[];
  className?: string;
  children: ReactNode;
}

export default function DataTable({ items, className = "", children }: Props) {
  const body = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const rows = body.current?.querySelectorAll("tbody tr");
      if (!rows?.length) return;
      gsap.from(rows, { opacity: 0, y: 8, duration: 0.35, stagger: 0.04, ease: "power2.out", clearProps: "all" });
    });
    return () => mm.revert();
  }, { dependencies: [items], scope: body });

  return (
    <div ref={body} className={`overflow-x-auto ${className}`}>
      {children}
    </div>
  );
}