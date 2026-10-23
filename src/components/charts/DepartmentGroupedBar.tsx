"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import ChartReveal from "@/components/animations/ChartReveal";
import type { GroupStat } from "@/types";

const COLORS = { appreciation: "#16A34A", complaint: "#DC2626", suggestion: "#F59E0B" };

interface Props {
  data: GroupStat[];
  title?: string;
}

export default function DepartmentGroupedBar({ data, title = "Feedback by department" }: Props) {
  const rows = data.map((d) => ({
    name: d.name.length > 12 ? d.name.slice(0, 12) + "…" : d.name,
    appreciation: d.appreciations,
    complaint: d.complaints,
    suggestion: d.suggestions,
  }));

  return (
    <ChartReveal className="card p-5">
      <h3 className="mb-4 font-semibold">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip cursor={{ fill: "rgba(79,70,229,.05)" }} />
            <Legend />
            <Bar dataKey="appreciation" name="Appreciation" fill={COLORS.appreciation} radius={[6, 6, 0, 0]} />
            <Bar dataKey="complaint" name="Complaint" fill={COLORS.complaint} radius={[6, 6, 0, 0]} />
            <Bar dataKey="suggestion" name="Suggestion" fill={COLORS.suggestion} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartReveal>
  );
}