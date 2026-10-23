"use client";
import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import FeedbackCard from "@/components/student/FeedbackCard";
import FeedbackFilters from "@/components/student/FeedbackFilters";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import Pagination from "@/components/ui/Pagination";
import Reveal from "@/components/animations/Reveal";
import useFetch from "@/hooks/useFetch";

export default function HistoryPage() {
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const { data: feedbacks, meta, loading } = useFetch<any[]>("/feedback/mine", {
    status: status || undefined,
    page,
    limit: 10,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="My Feedback" subtitle="Track all your submissions" />
      <FeedbackFilters
        onFilter={(s) => {
          setStatus(s === "all" ? "" : s);
          setPage(1);
        }}
      />

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : (feedbacks || []).length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description={status ? "No feedback matches this filter." : "You haven't submitted any feedback yet."}
          action={status ? undefined : "/student/feedback/new"}
          actionLabel={status ? undefined : "Give Feedback"}
        />
      ) : (
        <>
          <Reveal className="space-y-3">
            {(feedbacks || []).map((f) => (
              <FeedbackCard key={f._id} item={f} />
            ))}
          </Reveal>
          <Pagination meta={meta} onChange={setPage} />
        </>
      )}
    </div>
  );
}