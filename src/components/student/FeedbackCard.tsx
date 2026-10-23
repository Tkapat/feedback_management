"use client";
import Link from "next/link";
import { Star, MessageSquare, Clock } from "lucide-react";
import { STATUS_DOT, STATUS_BADGE } from "@/constants/options";
import { titleCase, formatDate } from "@/lib/utils";

export default function FeedbackCard({ item }: { item: any }) {
  const status = item.status as keyof typeof STATUS_DOT;

  return (
    <Link href={`/student/feedback/${item._id}`} className="group block">
      <div className="card border border-slate-200 p-5 transition-all duration-200 hover:border-primary-200 hover:shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
            <span className={`text-xs font-semibold ${STATUS_BADGE[status]}`}>{titleCase(item.status)}</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-ink-900">{formatDate(item.createdAt)}</p>
            <p className="text-[10px] text-ink-400">{titleCase(item.category)}</p>
          </div>
        </div>
        <h3 className="mb-1 text-base font-semibold text-ink-900">
          {titleCase(item.category)} — {titleCase(item.type)}
        </h3>
        {item.subject && (
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare size={14} className="text-ink-400" />
            <span className="text-sm text-ink-500">{item.subject?.name}</span>
          </div>
        )}
        <p className="mb-4 line-clamp-2 text-sm text-ink-600">{item.comment}</p>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          {item.rating ? (
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-ink-600">{item.rating}/5</span>
            </div>
          ) : (
            <span />
          )}
          <Clock size={12} className="text-ink-400" />
        </div>
      </div>
    </Link>
  );
}