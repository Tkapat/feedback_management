"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartReveal from "@/components/animations/ChartReveal";
import type { Overview } from "@/types";

const COLORS = { appreciation: "#16A34A", complaint: "#DC2626", suggestion: "#F59E0B" };

export default function TypeDonutChart({ data }: { data: Overview["byType"] }) {
  return (
    <ChartReveal className="card p-5">
      <h3 className="mb-4 font-semibold">Feedback by type</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
              {data.map((d) => <Cell key={d.name} fill={COLORS[d.name as keyof typeof COLORS]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartReveal>
  );
}