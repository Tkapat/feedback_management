"use client";
import { useState } from "react";
import { Filter, RotateCcw } from "lucide-react";

interface Props {
  initial?: Record<string, string>;
  onFilter: (filters: Record<string, string>) => void;
}

export default function AdminFilters({ initial = {}, onFilter }: Props) {
  const [status, setStatus] = useState(initial.status ?? "");
  const [type, setType] = useState(initial.type ?? "");
  const [department, setDepartment] = useState(initial.department ?? "");

  const apply = () => {
    const filters: Record<string, string> = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (department) filters.department = department;
    onFilter(filters);
  };

  const reset = () => {
    setStatus("");
    setType("");
    setDepartment("");
    onFilter({});
  };

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 pr-1 text-ink-500">
        <Filter size={16} />
        <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="input w-auto min-w-[150px]"
        aria-label="Filter by status"
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in_review">In Review</option>
        <option value="resolved">Resolved</option>
        <option value="rejected">Rejected</option>
      </select>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="input w-auto min-w-[150px]"
        aria-label="Filter by type"
      >
        <option value="">All Types</option>
        <option value="appreciation">Appreciation</option>
        <option value="complaint">Complaint</option>
        <option value="suggestion">Suggestion</option>
      </select>

      <button
        onClick={apply}
        className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700"
      >
        Apply
      </button>
      <button
        onClick={reset}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-slate-50"
      >
        <RotateCcw size={14} /> Reset
      </button>
    </div>
  );
}