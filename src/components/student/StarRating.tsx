"use client";
import { useRef, useState } from "react";
import { Star } from "lucide-react";
import { gsap } from "@/lib/gsap";

interface Props {
  value?: number;
  onChange: (n: number) => void;
}

export default function StarRating({ value = 0, onChange }: Props) {
  const [hover, setHover] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (n: number) => {
    onChange(n);
    gsap.fromTo(
      refs.current[n - 1],
      { scale: 1 },
      { scale: 1.35, duration: 0.18, yoyo: true, repeat: 1, ease: "back.out(3)" },
    );
  };

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            ref={(el) => {
              refs.current[n - 1] = el;
            }}
            onClick={() => pick(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-checked={value === n}
            role="radio"
            className="rounded-lg p-1.5 transition-colors hover:bg-amber-50"
          >
            <Star
              size={30}
              className={`transition-colors ${active ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
            />
          </button>
        );
      })}
      <span className="ml-2 self-center text-sm font-medium text-ink-500">
        {hover || value ? `${hover || value}/5` : "No rating"}
      </span>
    </div>
  );
}