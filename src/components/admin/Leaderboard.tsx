"use client";

interface Props {
  title: string;
  items: { name: string; value: number }[];
  empty?: string;
}

export default function Leaderboard({ title, items, empty = "No data yet" }: Props) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="card p-5">
      <h3 className="mb-4 font-semibold text-ink-900">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-ink-400">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.name} className="relative overflow-hidden rounded-xl bg-slate-50 p-2.5">
              <div
                className="absolute inset-y-0 left-0 bg-primary-100/70"
                style={{ width: `${(item.value / max) * 100}%` }}
                aria-hidden
              />
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`grid h-6 w-6 flex-none place-items-center rounded-full text-xs font-bold ${
                      i === 0
                        ? "bg-amber-400 text-white"
                        : i === 1
                          ? "bg-slate-400 text-white"
                          : i === 2
                            ? "bg-orange-300 text-white"
                            : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate font-medium text-ink-900">{item.name}</span>
                </div>
                <span className="flex-none font-display text-sm font-bold text-ink-700">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}