"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartReveal from "@/components/animations/ChartReveal";
import type { Overview } from "@/types";

const COLORS: Record<string, string> = {
  teaching: "#2563EB",
  classroom: "#7C3AED",
  laboratory: "#0891B2",
  faculty: "#DB2777",
  library: "#059669",
  cleanliness: "#B45309",
  other: "#6B7280",
};

export default function CategoryDonutChart({ data }: { data: Overview["byCategory"] }) {
  return (
    <ChartReveal className="card p-5">
      <h3 className="mb-4 font-semibold">Feedback by category</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
              {data.map((d) => <Cell key={d.name} fill={COLORS[d.name] ?? "#6B7280"} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartReveal>
  );
}