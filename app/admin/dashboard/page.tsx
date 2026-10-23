"use client";
import KpiCards from "@/components/admin/KpiCards";
import TypeDonutChart from "@/components/charts/TypeDonutChart";
import FacultyRatingBar from "@/components/charts/FacultyRatingBar";
import DepartmentGroupedBar from "@/components/charts/DepartmentGroupedBar";
import TrendLineChart from "@/components/charts/TrendLineChart";
import Leaderboard from "@/components/admin/Leaderboard";
import ConcernsCloud from "@/components/admin/ConcernsCloud";
import Skeleton from "@/components/ui/Skeleton";
import useFetch from "@/hooks/useFetch";
import Reveal from "@/components/animations/Reveal";
import PageHeader from "@/components/layout/PageHeader";
import { CalendarRange } from "lucide-react";
import type { Overview, GroupStat, Settings } from "@/types";

export default function AdminDashboardPage() {
  const { data: overview, loading } = useFetch<Overview>("/admin/stats/overview");
  const { data: faculty } = useFetch<GroupStat[]>("/admin/stats/faculty");
  const { data: departments } = useFetch<GroupStat[]>("/admin/stats/departments");
  const { data: concerns } = useFetch<{ tags: { tag: string; count: number }[]; keywords: { word: string; count: number }[] }>(
    "/admin/stats/concerns",
  );
  const { data: settings } = useFetch<Settings>("/settings");

  if (loading || !overview) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const complaints = (faculty || [])
    .filter((f) => f.complaints > 0)
    .sort((a, b) => b.complaints - a.complaints)
    .slice(0, 5)
    .map((f) => ({ name: f.name, value: f.complaints }));

  const appreciations = (faculty || [])
    .filter((f) => f.appreciations > 0)
    .sort((a, b) => b.appreciations - a.appreciations)
    .slice(0, 5)
    .map((f) => ({ name: f.name, value: f.appreciations }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of all student feedback across campus"
        actions={
          <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-600 shadow-soft">
            <CalendarRange size={15} className="text-primary-600" />
            {settings?.currentCycle || "Current cycle"}
          </span>
        }
      />

      <KpiCards data={overview} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 xl:grid-cols-2">
            <FacultyRatingBar data={(faculty || []).slice(0, 10)} />
            <TypeDonutChart data={overview.byType} />
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <DepartmentGroupedBar data={(departments || []).slice(0, 10)} />
            <TrendLineChart data={overview.monthly} />
          </div>
        </div>

        <div className="space-y-6">
          <Leaderboard title="Top Faculty — Complaints" items={complaints} empty="No complaints recorded" />
          <Leaderboard title="Top Faculty — Appreciations" items={appreciations} empty="No appreciations yet" />
          <Reveal className="card p-5">
            <h3 className="mb-4 font-semibold text-ink-900">Insights</h3>
            <ConcernsCloud tags={concerns?.tags || []} keywords={concerns?.keywords || []} />
          </Reveal>
        </div>
      </div>
    </div>
  );
}