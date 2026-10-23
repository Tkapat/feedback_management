export default function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600 border border-amber-100",
    in_review: "bg-sky-50 text-sky-600 border border-sky-100",
    resolved: "bg-green-50 text-green-600 border border-green-100",
    rejected: "bg-red-50 text-red-600 border border-red-100",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${tones[status] || tones.pending}`}>
      {status.replace("_", " ")}
    </span>
  );
}