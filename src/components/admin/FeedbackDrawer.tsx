"use client";
import { useState } from "react";
import Drawer from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Star, Send } from "lucide-react";
import { formatDate, titleCase } from "@/lib/utils";
import type { FeedbackStatus } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  item: any;
  onReply: (id: string, message: string) => void;
  onStatusChange: (id: string, status: string) => void;
  onTogglePriority: (id: string) => void;
}

const BADGE_VARIANT: Record<FeedbackStatus, "success" | "danger" | "info" | "warning"> = {
  resolved: "success",
  rejected: "danger",
  in_review: "info",
  pending: "warning",
};

function DrawerContent({ item, onReply, onStatusChange, onTogglePriority }: Omit<Props, "open" | "onClose">) {
  const [replyMessage, setReplyMessage] = useState("");

  const submitReply = () => {
    if (!replyMessage.trim()) return;
    onReply(item._id, replyMessage);
    setReplyMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={BADGE_VARIANT[item.status as FeedbackStatus] ?? "warning"}>
          {titleCase(item.status)}
        </Badge>
        <Badge>{titleCase(item.type)}</Badge>
        {item.priority && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            <Star size={11} className="fill-amber-500 text-amber-500" /> Priority
          </span>
        )}
      </div>

      <section>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-500">Student</h4>
        <p className="text-sm font-medium text-ink-900">
          {item.isAnonymous ? "Anonymous" : item.student?.name || "—"}
        </p>
        {!item.isAnonymous && item.student?.rollNo && (
          <p className="text-xs text-ink-400">{item.student.rollNo}</p>
        )}
      </section>

      <section>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-500">Context</h4>
        <p className="text-sm text-ink-600">
          {item.department?.name || "—"} {item.subject?.name ? `· ${item.subject.name}` : ""}
        </p>
        <p className="text-xs text-ink-400">{formatDate(item.createdAt)}</p>
      </section>

      <section>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-500">Comment</h4>
        <p className="rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-ink-700">{item.comment}</p>
        {item.rating ? (
          <p className="mt-2 text-xs font-semibold text-amber-600">★ {item.rating}/5 rating</p>
        ) : null}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="drawer-status"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-500"
          >
            Status
          </label>
          <select
            id="drawer-status"
            value={item.status}
            onChange={(e) => onStatusChange(item._id, e.target.value)}
            className="input"
          >
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-500">
            Priority
          </span>
          <button
            onClick={() => onTogglePriority(item._id)}
            className={`w-full rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              item.priority
                ? "bg-amber-100 text-amber-700"
                : "border border-slate-200 bg-white text-ink-600 hover:bg-slate-50"
            }`}
          >
            {item.priority ? "High Priority" : "Set Priority"}
          </button>
        </div>
      </section>

      <section>
        <label
          htmlFor="drawer-reply"
          className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-500"
        >
          Reply to student
        </label>
        <textarea
          id="drawer-reply"
          rows={3}
          value={replyMessage}
          onChange={(e) => setReplyMessage(e.target.value)}
          placeholder="Write a response…"
          className="input resize-none"
        />
        <Button onClick={submitReply} className="mt-3 w-full" disabled={!replyMessage.trim()}>
          <span className="inline-flex items-center gap-2">
            <Send size={14} /> Send Reply
          </span>
        </Button>
      </section>

      {item.replies?.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
            Replies ({item.replies.length})
          </h4>
          <div className="space-y-2">
            {item.replies.map((r: any) => (
              <div key={r._id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-sm text-ink-700">{r.message}</p>
                <p className="mt-1 text-xs text-ink-400">
                  Administrator · {formatDate(r.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function FeedbackDrawer({ open, onClose, item, onReply, onStatusChange, onTogglePriority }: Props) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={item ? `Feedback #${item._id.slice(-6)}` : "Feedback"}
    >
      {item ? (
        <DrawerContent
          key={item._id}
          item={item}
          onReply={onReply}
          onStatusChange={onStatusChange}
          onTogglePriority={onTogglePriority}
        />
      ) : null}
    </Drawer>
  );
}