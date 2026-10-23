"use client";
import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import AdminFilters from "@/components/admin/AdminFilters";
import FeedbackTable from "@/components/admin/FeedbackTable";
import FeedbackDrawer from "@/components/admin/FeedbackDrawer";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import Pagination from "@/components/ui/Pagination";
import useFetch from "@/hooks/useFetch";
import api, { getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import type { PageMeta } from "@/types";

export default function AdminFeedbackPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [filters, setFilters] = useState<Record<string, string>>({ page: "1" });
  const [exporting, setExporting] = useState(false);

  const { data: items, meta, loading, reload } = useFetch<any[]>("/admin/feedback", {
    ...filters,
    limit: 10,
  });

  const handleReply = async (id: string, message: string) => {
    if (!message.trim()) return toast.error("Write a reply first");
    try {
      await api.post(`/admin/feedback/${id}/reply`, { message });
      toast.success("Reply sent — status moved to In Review");
      setOpen(false);
      setSelected(null);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/feedback/${id}/status`, { status });
      toast.success(`Status updated to ${status.replace("_", " ")}`);
      const res = await api.get(`/admin/feedback/${id}`);
      setSelected(res.data.data);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleTogglePriority = async (id: string) => {
    try {
      const res = await api.patch(`/admin/feedback/${id}/priority`);
      toast.success(res.data?.data?.priority ? "Marked as priority" : "Priority removed");
      const updated = await api.get(`/admin/feedback/${id}`);
      setSelected(updated.data.data);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get("/admin/feedback/export", { params: filters, responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `feedback-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setExporting(false);
    }
  };

  const openItem = (item: any) => {
    setSelected(item);
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Feedback Management"
        subtitle="Review, reply and resolve student feedback"
        actions={
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-soft transition hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={16} /> {exporting ? "Exporting…" : "Export CSV"}
          </button>
        }
      />

      <AdminFilters
        initial={filters}
        onFilter={(f) => setFilters({ ...f, page: "1" })}
      />

      <div className="card p-6">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (items || []).length === 0 ? (
          <EmptyState
            title="No feedback found"
            description="Try adjusting the filters, or there may be no submissions yet."
          />
        ) : (
          <FeedbackTable items={items || []} onOpen={openItem} onStatusChange={handleStatusChange} onTogglePriority={handleTogglePriority} />
        )}
        <Pagination
          meta={meta as PageMeta | null}
          onChange={(page) => setFilters((f) => ({ ...f, page: String(page) }))}
        />
      </div>

      <FeedbackDrawer
        open={open}
        onClose={() => setOpen(false)}
        item={selected}
        onReply={handleReply}
        onStatusChange={handleStatusChange}
        onTogglePriority={handleTogglePriority}
      />
    </div>
  );
}