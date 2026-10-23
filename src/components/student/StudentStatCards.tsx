"use client";
import { MessageSquare, Star, Clock, CheckCircle2 } from "lucide-react";
import HoverLift from "@/components/animations/HoverLift";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import Reveal from "@/components/animations/Reveal";

const TONES = {
  primary: { bg: "bg-primary-50", text: "text-primary-600", border: "border-primary-100" },
  success: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
  warning: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
  info: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100" },
};

function Kpi({ label, value, decimals = 0, suffix = "", Icon, tone }:
  { label: string; value: number; decimals?: number; suffix?: string; Icon: React.ComponentType<{ size?: number }>; tone: keyof typeof TONES }) {
  const T = TONES[tone];
  return (
    <HoverLift className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${T.bg} ${T.text} shadow-sm shadow-${tone === "primary" ? "primary" : tone}-200`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 font-bold text-2xl text-ink-900 font-display"><AnimatedCounter value={value} decimals={decimals} suffix={suffix} /></p>
    </HoverLift>
  );
}

export default function StudentStatCards({ data }: { data: { total: number; pending: number; in_review: number; resolved: number } }) {
  return (
    <Reveal className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="Total feedback" value={data.total} Icon={MessageSquare} tone="primary" />
      <Kpi label="Pending" value={data.pending} Icon={Clock} tone="warning" />
      <Kpi label="In Review" value={data.in_review} Icon={Star} tone="info" />
      <Kpi label="Resolved" value={data.resolved} Icon={CheckCircle2} tone="success" />
    </Reveal>
  );
}