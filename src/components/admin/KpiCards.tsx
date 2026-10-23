"use client";
import { MessageSquare, Star, Clock, CheckCircle2 } from "lucide-react";
import HoverLift from "@/components/animations/HoverLift";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import Reveal from "@/components/animations/Reveal";

const TONES = {
  primary: { bg: "bg-primary-50", text: "text-primary-600", shadow: "shadow-primary-200" },
  success: { bg: "bg-green-50", text: "text-green-600", shadow: "shadow-green-200" },
  warning: { bg: "bg-amber-50", text: "text-amber-600", shadow: "shadow-amber-200" },
  info: { bg: "bg-sky-50", text: "text-sky-600", shadow: "shadow-sky-200" },
};

function Kpi({ label, value, decimals = 0, suffix = "", Icon, tone }:
  { label: string; value: number; decimals?: number; suffix?: string; Icon: React.ComponentType<{ size?: number }>; tone: keyof typeof TONES }) {
  const T = TONES[tone];
  return (
    <HoverLift className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${T.bg} ${T.text} ${T.shadow}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 font-bold text-2xl text-ink-900 font-display"><AnimatedCounter value={value} decimals={decimals} suffix={suffix} /></p>
    </HoverLift>
  );
}

export default function KpiCards({ data }: { data: any }) {
  return (
    <Reveal className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="Total feedback" value={data.total} Icon={MessageSquare} tone="primary" />
      <Kpi label="Average rating" value={data.avgRating} decimals={1} Icon={Star} tone="warning" />
      <Kpi label="Pending" value={data.pending} Icon={Clock} tone="info" />
      <Kpi label="Resolved" value={data.resolvedPercent} suffix="%" Icon={CheckCircle2} tone="success" />
    </Reveal>
  );
}