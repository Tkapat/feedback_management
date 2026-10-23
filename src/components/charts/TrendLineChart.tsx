"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import ChartReveal from "@/components/animations/ChartReveal";

interface MonthlyPoint { month: string; count: number }

export default function TrendLineChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ChartReveal className="card p-5">
      <h3 className="mb-4 font-semibold">Monthly feedback trend</h3>
      <div className="h-72">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartReveal>
  );
}