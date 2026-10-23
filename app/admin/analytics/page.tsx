"use client";
import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import useFetch from "@/hooks/useFetch";
import FacultyRatingBar from "@/components/charts/FacultyRatingBar";
import DepartmentGroupedBar from "@/components/charts/DepartmentGroupedBar";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import type { GroupStat } from "@/types";
import { cx } from "@/lib/utils";

const TABS = ["faculty", "subjects", "departments"] as const;
type Tab = (typeof TABS)[number];

const LABELS: Record<Tab, string> = {
  faculty: "Faculty",
  subjects: "Subjects",
  departments: "Departments",
};

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("faculty");
  const { data, loading } = useFetch<GroupStat[]>(`/admin/stats/${tab}`);

  const items = data || [];

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Deep dive into feedback across faculty, subjects and departments" />

      <div role="tablist" aria-label="Analytics view" className="mb-6 inline-flex rounded-2xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cx(
              "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all",
              tab === t ? "bg-white text-primary-600 shadow-soft" : "text-ink-600 hover:text-ink-900",
            )}
          >
            {LABELS[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : items.length === 0 ? (
        <EmptyState title="No data yet" description={`No ${LABELS[tab].toLowerCase()} stats available for this period.`} />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <FacultyRatingBar data={items} title={`Average rating per ${LABELS[tab].slice(0, -1).toLowerCase()}`} />
          <DepartmentGroupedBar data={items} title={`Feedback mix by ${LABELS[tab].slice(0, -1).toLowerCase()}`} />
        </div>
      )}
    </div>
  );
}