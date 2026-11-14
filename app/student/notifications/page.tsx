"use client";
import PageHeader from "@/components/layout/PageHeader";
import useFetch from "@/hooks/useFetch";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Check, X } from "lucide-react";
import Reveal from "@/components/animations/Reveal";
import EmptyState from "@/components/ui/EmptyState";

export default function NotificationsPage() {
  const { data: notifications, loading, reload } = useFetch<{ _id: string; message: string; read: boolean; createdAt: string }[]>(
    "/notifications/mine",
  );

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    toast.success("Marked as read");
    reload();
  };

  if (loading) return (
    <div className="mx-auto max-w-3xl p-6">
      <PageHeader title="Notifications" subtitle="Updates from CampusVoice." />
      <div className="mt-6 flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-200 animate-pulse" />
        ))}
      </div>
    </div>
  );

  const items = notifications || [];
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount ? `${unreadCount} unread` : "All caught up."}
        actions={
          unreadCount > 0 && (
            <button
              onClick={() => { api.patch("/notifications/all/read").then(reload); toast.success("All marked as read"); }}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 transition"
            >
              Mark all as read
            </button>
          )
        }
      />

      <Reveal>
        {items.length === 0 ? (
          <EmptyState title="No notifications" description="You’ll see updates here when administrators respond to your feedback or share announcements." />
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((n) => (
              <div
                key={n._id}
                className={`card p-4 flex items-start gap-3 transition-colors hover:bg-slate-50 ${!n.read ? "border-primary-200 bg-primary-50" : ""}`}
                onClick={() => !n.read && markRead(n._id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-2">
                  {!n.read && <div className="h-2 w-2 rounded-full bg-primary-600" />}
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-ink-400">
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="mb-2 text-sm text-ink-700 leading-relaxed">{n.message}</p>
                {!n.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead(n._id); }}
                    className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 transition"
                  >
                    <Check size={12} /> Read
                  </button>
                )}
                {n.read && (
                  <span className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-semibold text-ink-400 bg-slate-100">
                    <X size={12} /> Read
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
