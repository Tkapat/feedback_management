"use client";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { Star, AlertCircle } from "lucide-react";
import { formatDate, titleCase } from "@/lib/utils";
import type { FeedbackStatus } from "@/types";

const BADGE_VARIANT: Record<FeedbackStatus, "success" | "danger" | "info" | "warning"> = {
  resolved: "success",
  rejected: "danger",
  in_review: "info",
  pending: "warning",
};

interface Props {
  items: any[];
  onOpen: (item: any) => void;
  onStatusChange: (id: string, status: string) => void;
  onTogglePriority: (id: string) => void;
}

export default function FeedbackTable({ items, onOpen, onStatusChange, onTogglePriority }: Props) {
  return (
    <DataTable items={items}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="pb-3 pl-2 text-xs font-semibold uppercase tracking-wider text-ink-500">ID</th>
            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Student</th>
            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Department</th>
            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Subject</th>
            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Type</th>
            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Date</th>
            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Status</th>
            <th className="pb-3 pr-2 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item._id}
              onClick={() => onOpen(item)}
              className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-primary-50/50"
            >
              <td className="py-3.5 pl-2 text-sm font-medium text-ink-600">#{item._id.slice(-6)}</td>
              <td className="py-3.5 text-sm">
                <span className="flex items-center gap-2">
                  {item.isAnonymous ? (
                    <span className="inline-flex items-center gap-1 text-ink-400">
                      <AlertCircle size={13} /> Anonymous
                    </span>
                  ) : (
                    <span className="font-medium text-ink-900">{item.student?.name || "—"}</span>
                  )}
                </span>
              </td>
              <td className="py-3.5 text-sm text-ink-500">{item.department?.name || "—"}</td>
              <td className="py-3.5 text-sm text-ink-500">{item.subject?.name || "—"}</td>
              <td className="py-3.5 text-sm text-ink-600">{titleCase(item.type)}</td>
              <td className="py-3.5 text-sm text-ink-500">{formatDate(item.createdAt)}</td>
              <td className="py-3.5">
                <Badge variant={BADGE_VARIANT[item.status as FeedbackStatus] ?? "warning"}>
                  {titleCase(item.status)}
                </Badge>
              </td>
              <td className="py-3.5 pr-2 text-right">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onTogglePriority(item._id)}
                    aria-label="Toggle priority"
                    className={`rounded-lg p-1.5 transition-colors ${
                      item.priority
                        ? "bg-amber-50 text-amber-600"
                        : "text-ink-400 hover:bg-slate-100 hover:text-amber-500"
                    }`}
                  >
                    <Star size={15} className={item.priority ? "fill-amber-400" : ""} />
                  </button>
                  {item.status !== "resolved" && (
                    <button
                      onClick={() => onStatusChange(item._id, "resolved")}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => onOpen(item)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-slate-100"
                  >
                    Open
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}