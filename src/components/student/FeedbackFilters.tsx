"use client";
import { useState } from "react";
import { Filter, Clock, CheckCircle, XCircle } from "lucide-react";

const FILTERS = [
  { key: "all", label: "All", icon: Filter },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "in_review", label: "In Review", icon: Filter },
  { key: "resolved", label: "Resolved", icon: CheckCircle },
  { key: "rejected", label: "Rejected", icon: XCircle },
];

export default function FeedbackFilters({ onFilter }: { onFilter: (status: string) => void }) {
  const [active, setActive] = useState("all");

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {FILTERS.map((f) => {
        const Icon = f.icon;
        const isActive = active === f.key;
        return (
          <button
            key={f.key}
            onClick={() => { setActive(f.key); onFilter(f.key); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition ${
              isActive ? "bg-primary-600 text-white" : "bg-white border border-slate-200 text-ink-600 hover:bg-slate-50"
            }`}
          >
            <Icon size={14} /> {f.label}
          </button>
        );
      })}
    </div>
  );
}