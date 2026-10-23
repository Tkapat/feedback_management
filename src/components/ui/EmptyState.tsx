import Link from "next/link";
import { Inbox } from "lucide-react";

interface Props {
  title: string;
  description: string;
  action?: string;
  actionLabel?: string;
}

export default function EmptyState({ title, description, action, actionLabel }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary-600">
        <Inbox size={24} />
      </div>
      <p className="text-base font-semibold text-ink-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>
      {action && actionLabel && (
        <Link
          href={action}
          className="mt-6 inline-flex items-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}