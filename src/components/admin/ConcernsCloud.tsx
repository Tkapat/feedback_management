"use client";

interface Props {
  tags: { tag: string; count: number }[];
  keywords: { word: string; count: number }[];
}

export default function ConcernsCloud({ tags, keywords }: Props) {
  const maxTag = Math.max(1, ...tags.map((t) => t.count));
  const maxKey = Math.max(1, ...keywords.map((k) => k.count));

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Top Tags</h4>
        {tags.length === 0 ? (
          <p className="text-sm text-ink-400">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.tag}
                style={{ opacity: 0.55 + (t.count / maxTag) * 0.45 }}
                className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
              >
                {t.tag} <span className="font-bold">{t.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Complaint Keywords</h4>
        {keywords.length === 0 ? (
          <p className="text-sm text-ink-400">No complaint keywords yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span
                key={k.word}
                style={{ opacity: 0.55 + (k.count / maxKey) * 0.45 }}
                className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
              >
                {k.word} <span className="font-bold">{k.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}