"use client";
import { formatDate } from "@/lib/utils";
import { MessageSquare, ShieldCheck } from "lucide-react";

export default function ReplyThread({ replies }: { replies: any[] }) {
  if (!replies || replies.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
        <MessageSquare size={18} className="text-ink-400" />
        <div>
          <p className="text-sm font-medium text-ink-700">No replies yet</p>
          <p className="text-xs text-ink-400">The administrator will respond here once reviewed.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
        <MessageSquare size={14} /> Administrator Replies
      </h3>
      <div className="space-y-4">
        {replies.map((r) => (
          <div key={r._id} className="flex gap-3">
            <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-700 text-white">
              <ShieldCheck size={16} />
            </div>
            <div className="flex-1 rounded-2xl rounded-tl-sm border border-slate-100 bg-slate-50 p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink-900">Administrator</p>
                <p className="text-xs text-ink-400">{formatDate(r.createdAt)}</p>
              </div>
              <p className="text-sm leading-relaxed text-ink-600">{r.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}