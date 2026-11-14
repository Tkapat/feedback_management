"use client";
import { ReactNode, useRef } from "react";
import { X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode }

export default function Drawer({ open, onClose, title, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);

  // GSAP owns xPercent entirely — never set an inline `transform` via React,
  // GSAP would parse it into `x` and stack xPercent on top (drawer ends off-screen).
  useGSAP(() => {
    const panelEl = panel.current;
    const backdropEl = backdrop.current;

    if (open) {
      gsap.set(panelEl, { visibility: "visible" });
      gsap.set(backdropEl, { visibility: "visible" });
      gsap.fromTo(
        panelEl,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.4, ease: "power3.inOut", overwrite: true },
      );
      gsap.fromTo(backdropEl, { opacity: 0 }, { opacity: 1, duration: 0.3, overwrite: true });
    } else {
      gsap.to(panelEl, {
        xPercent: 100,
        duration: 0.35,
        ease: "power3.inOut",
        overwrite: true,
        onComplete: () => gsap.set(panelEl, { visibility: "hidden" }),
      });
      gsap.to(backdropEl, {
        opacity: 0,
        duration: 0.3,
        overwrite: true,
        onComplete: () => gsap.set(backdropEl, { visibility: "hidden" }),
      });
    }
  }, { dependencies: [open] });

  return (
    <>
      <div
        ref={backdrop}
        onClick={onClose}
        style={{ opacity: 0, visibility: "hidden" }}
        className="fixed inset-0 z-40 bg-slate-900/40"
      />
      <aside
        ref={panel}
        style={{ visibility: "hidden" }}
        aria-hidden={!open}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button>
        </div>
        {children}
      </aside>
    </>
  );
}