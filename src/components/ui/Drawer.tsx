"use client";
import { ReactNode, useRef } from "react";
import { X } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode }

export default function Drawer({ open, onClose, title, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useGSAP(() => {
    const d = first.current ? 0 : 0.4;
    first.current = false;
    gsap.to(panel.current, { xPercent: open ? 0 : 100, duration: d, ease: "power3.inOut" });
    gsap.to(backdrop.current, { opacity: open ? 1 : 0, duration: d });
  }, { dependencies: [open] });

  return (
    <>
      <div ref={backdrop} onClick={onClose} style={{ opacity: 0 }}
        className={`fixed inset-0 z-40 bg-slate-900/40 ${open ? "" : "pointer-events-none"} transition-opacity duration-300`} />
      <aside ref={panel} style={{ transform: "translateX(100%)" }} aria-hidden={!open}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button>
        </div>
        {children}
      </aside>
    </>
  );
}