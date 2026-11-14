"use client";
import { useState, useRef } from "react";
import { X, Download } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

interface Props {
  images?: string[];
  className?: string;
}

export default function ImageGallery({ images = [], className }: Props) {
  const [open, setOpen] = useState(false);
  const [activeSrc, setActiveSrc] = useState(images[0]);

  if (images.length === 0) return null;

  return (
    <>
      <section className={`mt-4 ${className ?? ""}`}>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">Proof images</h3>
        <div className="flex flex-wrap gap-2">
          {images.map((src) => (
            <div key={src} className="relative group">
              <img
                src={src}
                alt="Feedback proof"
                className="h-24 w-32 rounded-xl object-cover border border-slate-200 bg-slate-50 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { setActiveSrc(src); setOpen(true); }}
              />
              <span className="absolute -top-2 -right-2 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">View</span>
            </div>
          ))}
        </div>
      </section>

      <ImageModal open={open} onClose={() => setOpen(false)} src={activeSrc} />
    </>
  );
}

function ImageModal({ open, onClose, src }: { open: boolean; onClose: () => void; src: string }) {
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.to(backdrop.current, { opacity: open ? 1 : 0, duration: 0.25, ease: "power2.out", overwrite: "auto" });
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
    gsap.set(panel.current, { pointerEvents: open ? "auto" : "none", visibility: open ? "visible" : "hidden" });
    return () => mm.revert();
  }, { dependencies: [open] });

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = src.split("/").pop() || "proof.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      ref={backdrop}
      onClick={onClose}
      style={{ pointerEvents: open ? "auto" : "none", visibility: open ? "visible" : "hidden" }}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Proof image"
          style={{ opacity: 0 }}
          className="relative max-w-[70vw] max-h-[60vh] rounded-2xl bg-white p-4 shadow-2xl border border-slate-200"
        >
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
            <button
              onClick={handleDownload}
              className="rounded-lg p-2.5 bg-white text-ink-600 shadow-lg hover:bg-slate-50 hover:text-primary-600 transition"
              aria-label="Download image"
            >
              <Download size={16} className="text-[13px]" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2.5 bg-white text-ink-600 shadow-lg hover:bg-slate-50 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <img src={src} alt="Proof image" className="w-full h-full object-contain rounded-xl bg-slate-50 block mx-auto" />
        </div>
      </div>
    </div>
  );
}
