"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import ChartReveal from "@/components/animations/ChartReveal";
import type { GroupStat } from "@/types";

interface Props {
  data: GroupStat[];
  title?: string;
}

export default function FacultyRatingBar({ data, title = "Average rating per faculty" }: Props) {
  const rows = data.map((d) => ({
    ...d,
    shortName: d.name.length > 12 ? d.name.slice(0, 12) + "…" : d.name,
  }));

  return (
    <ChartReveal className="card p-5">
      <h3 className="mb-4 font-semibold">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="shortName" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 5]} />
            <Tooltip
              cursor={{ fill: "rgba(79,70,229,.05)" }}
              formatter={(value) => [`${Number(value ?? 0).toFixed(2)} / 5`, "Avg rating"]}
            />
            <Bar dataKey="avgRating" fill="#4F46E5" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartReveal>
  );
}