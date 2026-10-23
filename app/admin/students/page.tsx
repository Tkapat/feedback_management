"use client";
import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import Reveal from "@/components/animations/Reveal";
import DataTable from "@/components/ui/DataTable";
import useFetch from "@/hooks/useFetch";
import useDebounce from "@/hooks/useDebounce";
import api, { getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import { Search, Users } from "lucide-react";
import type { PageMeta } from "@/types";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 400);
  const { data: students, meta, loading, reload } = useFetch<any[]>("/admin/students", {
    search: debounced || undefined,
    page: 1,
    limit: 20,
  });

  const toggleActive = async (id: string, next: boolean) => {
    try {
      await api.patch(`/admin/students/${id}/active`);
      toast.success(next ? "Student deactivated" : "Student activated");
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Search and manage student accounts"
        actions={
          <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-600 shadow-soft">
            <Users size={15} className="text-primary-600" />
            {meta?.total ?? students?.length ?? 0} students
          </span>
        }
      />

      <div className="card p-6">
        <div className="relative mb-5 max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            placeholder="Search by name, email or roll number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
            aria-label="Search students"
          />
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (students || []).length === 0 ? (
          <EmptyState
            title="No students found"
            description={debounced ? `Nothing matches “${debounced}”.` : "No student accounts yet."}
          />
        ) : (
          <DataTable items={students || []}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 pl-2 text-xs font-semibold uppercase tracking-wider text-ink-500">Name</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Email</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Roll No</th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Department</th>
                  <th className="pb-3 pr-2 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {(students || []).map((s) => (
                  <tr key={s._id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="py-3.5 pl-2 text-sm font-medium text-ink-900">{s.name}</td>
                    <td className="py-3.5 text-sm text-ink-500">{s.email}</td>
                    <td className="py-3.5 text-sm text-ink-500">{s.rollNo}</td>
                    <td className="py-3.5 text-sm text-ink-500">{s.department?.name || "—"}</td>
                    <td className="py-3.5 pr-2 text-right">
                      <button
                        onClick={() => toggleActive(s._id, s.isActive)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                          s.isActive
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? "bg-green-500" : "bg-red-500"}`} />
                        {s.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        )}
      </div>
    </div>
  );
}