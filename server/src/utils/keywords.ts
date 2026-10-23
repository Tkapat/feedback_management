const STOP = new Set(
  "the and but are was were been with from this that these those have has had does did very too can will just not our your their they them also than then there here what when which while would could should about into over more most some such only other".split(" ")
);

export const topKeywords = (comments: string[], limit = 15) => {
  const counts: Record<string, number> = {};
  for (const c of comments) {
    for (const w of c.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)) {
      if (w.length > 3 && !STOP.has(w)) counts[w] = (counts[w] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
};