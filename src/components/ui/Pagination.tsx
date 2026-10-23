"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageMeta } from "@/types";

interface Props {
  meta: PageMeta | null;
  onChange: (page: number) => void;
}

export default function Pagination({ meta, onChange }: Props) {
  if (!meta || meta.pages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-sm text-ink-500">
        Page <span className="font-semibold text-ink-700">{meta.page}</span> of{" "}
        <span className="font-semibold text-ink-700">{meta.pages}</span> · {meta.total} total
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onChange(meta.page - 1)}
          disabled={meta.page <= 1}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          onClick={() => onChange(meta.page + 1)}
          disabled={meta.page >= meta.pages}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}