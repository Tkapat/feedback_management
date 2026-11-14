"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ChartReveal from "@/components/animations/ChartReveal";
import type { GroupStat } from "@/types";

interface Props {
  data: GroupStat[];
  title?: string;
}

export default function DepartmentGroupedBar({ data, title = "Feedback by department" }: Props) {
  const rows = data.map((d) => ({
    name: d.name.length > 12 ? d.name.slice(0, 12) + "…" : d.name,
    total: d.total,
  }));

  return (
    <ChartReveal className="card p-5">
      <h3 className="mb-4 font-semibold">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={rows}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip cursor={{ fill: "rgba(79,70,229,.05)" }} />
            <Bar dataKey="total" name="Total feedback" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartReveal>
  );
}