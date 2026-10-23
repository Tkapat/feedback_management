"use client";
import PageHeader from "@/components/layout/PageHeader";
import Skeleton from "@/components/ui/Skeleton";
import Reveal from "@/components/animations/Reveal";
import useFetch from "@/hooks/useFetch";
import api, { getErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import { CalendarRange, Tags, Save } from "lucide-react";
import type { Settings } from "@/types";

export default function SettingsPage() {
  const { data: settings, loading } = useFetch<Settings>("/settings");

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await api.put("/admin/settings", {
        feedbackOpen: fd.get("feedbackOpen") === "on",
        startDate: (fd.get("startDate") as string) || undefined,
        endDate: (fd.get("endDate") as string) || undefined,
        currentCycle: (fd.get("currentCycle") as string) || "",
        tags: String(fd.get("tags") || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const signature = settings
    ? `${settings.feedbackOpen}|${settings.startDate}|${settings.endDate}|${settings.currentCycle}|${settings.tags?.join(",")}`
    : "empty";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Configure the feedback window, cycle and quick tags" />

      <form key={signature} onSubmit={handleSave}>
        <Reveal className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-ink-900">
              <CalendarRange size={18} className="text-primary-600" /> Feedback Window
            </h3>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-ink-700">
                {settings?.feedbackOpen
                  ? "Window is open — students can submit"
                  : "Window is closed — submissions blocked"}
              </span>
              <span className="relative inline-flex">
                <input
                  name="feedbackOpen"
                  type="checkbox"
                  defaultChecked={settings?.feedbackOpen}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-primary-600" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="mb-1 block text-xs font-medium text-ink-600">
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={settings?.startDate ? settings.startDate.slice(0, 10) : ""}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="mb-1 block text-xs font-medium text-ink-600">
                  End Date
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={settings?.endDate ? settings.endDate.slice(0, 10) : ""}
                  className="input"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="currentCycle" className="mb-1 block text-xs font-medium text-ink-600">
                  Current Cycle
                </label>
                <input
                  id="currentCycle"
                  name="currentCycle"
                  type="text"
                  defaultValue={settings?.currentCycle || ""}
                  placeholder="e.g. 2026-ODD"
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-ink-900">
              <Tags size={18} className="text-primary-600" /> Quick Tags
            </h3>
            <p className="mb-3 text-sm text-ink-500">
              Comma-separated list students can pick when submitting feedback.
            </p>
            <input
              name="tags"
              type="text"
              defaultValue={settings?.tags?.join(", ") || ""}
              placeholder="punctual, clear slides, helpful, late, noisy"
              className="input"
              aria-label="Tags"
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              <span className="inline-flex items-center gap-2">
                <Save size={16} /> Save Settings
              </span>
            </button>
          </div>
        </Reveal>
      </form>
    </div>
  );
}