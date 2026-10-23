"use client";
import StudentStatCards from "@/components/student/StudentStatCards";
import FeedbackCard from "@/components/student/FeedbackCard";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import useFetch from "@/hooks/useFetch";
import Reveal from "@/components/animations/Reveal";
import Link from "next/link";
import { Star, Clock, CheckCircle2, FileText, History, Sparkles } from "lucide-react";

const STATUS_ROWS = [
  { key: "pending", label: "Pending", tone: "bg-amber-50 text-amber-600", Icon: Clock },
  { key: "in_review", label: "In Review", tone: "bg-sky-50 text-sky-600", Icon: Sparkles },
  { key: "resolved", label: "Resolved", tone: "bg-green-50 text-green-600", Icon: CheckCircle2 },
] as const;

export default function StudentDashboardPage() {
  const { data: summary, loading } = useFetch<{
    total: number;
    pending: number;
    in_review: number;
    resolved: number;
  }>("/feedback/mine/summary");
  const { data: feedbacks } = useFetch<any[]>("/feedback/mine?limit=5");

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Reveal className="mb-8 rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-600 via-primary-600 to-indigo-800 p-7 text-white shadow-lift sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Star size={12} className="text-amber-300" /> Student Portal
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back{summary?.total ? "" : " 👋"}
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-white/80 sm:text-base">
              {summary?.total
                ? "Here's what's happening with your feedback today."
                : "Your voice shapes a better campus. Share your first feedback to get started."}
            </p>
          </div>
          <Link
            href="/student/feedback/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-primary-700 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            <FileText size={16} /> Give Feedback
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-lg">
          {STATUS_ROWS.map((row) => (
            <div key={row.key} className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur">
              <p className="font-display text-2xl font-bold">{summary?.[row.key] ?? 0}</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-white/70">{row.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <StudentStatCards
        data={{
          total: summary?.total || 0,
          pending: summary?.pending || 0,
          in_review: summary?.in_review || 0,
          resolved: summary?.resolved || 0,
        }}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink-900">Recent Feedback</h2>
            <Link
              href="/student/feedback/history"
              className="text-sm font-semibold text-primary-600 hover:underline"
            >
              View all
            </Link>
          </div>
          <Reveal className="space-y-3">
            {(feedbacks || []).map((f) => (
              <FeedbackCard key={f._id} item={f} />
            ))}
            {(feedbacks || []).length === 0 && (
              <EmptyState
                title="No feedback yet"
                description="Share your first feedback to help improve teaching and campus facilities."
                action="/student/feedback/new"
                actionLabel="Give Feedback"
              />
            )}
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal className="card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-ink-900">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/student/feedback/new"
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-primary-200 hover:bg-primary-50"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
                  <FileText size={20} />
                </span>
                <span className="text-sm font-medium text-ink-900">New Feedback</span>
              </Link>
              <Link
                href="/student/feedback/history"
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-sky-200 hover:bg-sky-50"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
                  <History size={20} />
                </span>
                <span className="text-sm font-medium text-ink-900">History</span>
              </Link>
            </div>
          </Reveal>

          <Reveal className="card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-ink-900">Status Overview</h3>
            <div className="space-y-3">
              {STATUS_ROWS.map((row) => {
                const Icon = row.Icon;
                return (
                  <div key={row.key} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-8 w-8 place-items-center rounded-lg ${row.tone}`}>
                        <Icon size={14} />
                      </span>
                      <span className="text-sm font-medium text-ink-800">{row.label}</span>
                    </div>
                    <span className="font-mono text-xl font-bold text-ink-900">
                      {summary?.[row.key] ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}