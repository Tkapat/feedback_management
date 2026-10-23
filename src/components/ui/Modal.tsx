"use client";
import { ReactNode, useRef } from "react";
import { X } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.to(backdrop.current, {
        opacity: open ? 1 : 0,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
      if (open) {
        gsap.fromTo(
          panel.current,
          { opacity: 0, y: 16, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out", overwrite: "auto" },
        );
      } else {
        gsap.to(panel.current, { opacity: 0, y: 10, scale: 0.97, duration: 0.2, ease: "power2.in", overwrite: "auto" });
      }
    });
    gsap.set(wrap.current, { pointerEvents: open ? "auto" : "none", visibility: open ? "visible" : "hidden" });
    return () => mm.revert();
  }, { dependencies: [open] });

  return (
    <div ref={wrap} style={{ pointerEvents: "none", visibility: "hidden" }} className="fixed inset-0 z-50">
      <div ref={backdrop} onClick={onClose} style={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          style={{ opacity: 0 }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-ink-900">{title}</h3>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-ink-500 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}