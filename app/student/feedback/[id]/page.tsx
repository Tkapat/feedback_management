"use client";
import { use } from "react";
import PageHeader from "@/components/layout/PageHeader";
import useFetch from "@/hooks/useFetch";
import StatusTimeline from "@/components/student/StatusTimeline";
import ReplyThread from "@/components/student/ReplyThread";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Reveal from "@/components/animations/Reveal";
import { Star, MessageSquare, Building2, BookOpen, Calendar, EyeOff } from "lucide-react";
import { formatDate, titleCase } from "@/lib/utils";
import type { FeedbackStatus } from "@/types";

const BADGE_VARIANT: Record<string, "success" | "danger" | "info" | "warning"> = {
  resolved: "success",
  rejected: "danger",
  in_review: "info",
  pending: "warning",
};

export default function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: item, loading } = useFetch<any>(`/feedback/mine/${id}`);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState title="Feedback not found" description="This submission may have been removed." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Feedback Details" subtitle={`Submitted ${formatDate(item.createdAt)}`} />
      <Reveal className="space-y-6">
        <div className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  {titleCase(item.category)} — {titleCase(item.type)}
                </h2>
                <Badge variant={BADGE_VARIANT[item.status] ?? "warning"}>
                  {titleCase(item.status)}
                </Badge>
                {item.priority && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> Priority
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={14} /> {item.department?.name || "—"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen size={14} /> {item.subject?.name || "General"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} /> {formatDate(item.createdAt)}
                </span>
                {item.isAnonymous && (
                  <span className="inline-flex items-center gap-1.5 text-ink-400">
                    <EyeOff size={14} /> Anonymous
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">Comment</h3>
            <p className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-ink-700">{item.comment}</p>
          </div>

          {item.rating ? (
            <div className="mt-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">Rating</h3>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={20}
                    className={n <= item.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                  />
                ))}
                <span className="ml-2 text-sm font-semibold text-ink-600">{item.rating}/5</span>
              </div>
            </div>
          ) : null}

          {item.tags?.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((t: string) => (
                  <span
                    key={t}
                    className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-500">
            <MessageSquare size={14} /> Status Timeline
          </h3>
          <StatusTimeline status={item.status as FeedbackStatus} />
        </div>

        <div className="card p-6">
          <ReplyThread replies={item.replies || []} />
        </div>
      </Reveal>
    </div>
  );
}