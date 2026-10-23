"use client";
import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

export default function AuthBrandPanel() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from(root.current, { xPercent: -8, opacity: 0, duration: 0.9, ease: "power3.out" });
      gsap.from("[data-copy]", { y: 24, opacity: 0, duration: 0.8, stagger: 0.12, delay: 0.3, ease: "power3.out" });
      gsap.to("[data-blob='1']", { y: -30, x: 20, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to("[data-blob='2']", { y: 25, x: -25, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <aside ref={root} className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div data-blob="1" className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div data-blob="2" className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-teal-500/30 blur-3xl" />
      <h2 data-copy className="relative text-xl font-bold">🎓 CampusVoice</h2>
      <div className="relative">
        <h3 data-copy className="text-4xl font-bold leading-tight">Your voice shapes a better campus.</h3>
        <p data-copy className="mt-4 max-w-md text-white/80">
          Share feedback on teaching, classrooms and facilities. Track every response in one place.
        </p>
      </div>
      <p data-copy className="relative text-sm text-white/60">College Feedback Management System</p>
    </aside>
  );
}