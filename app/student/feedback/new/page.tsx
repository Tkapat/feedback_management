"use client";
import PageHeader from "@/components/layout/PageHeader";
import FeedbackForm from "@/components/student/FeedbackForm";
import Reveal from "@/components/animations/Reveal";

export default function NewFeedbackPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Give feedback" subtitle="Help us improve teaching and facilities." />
      <Reveal>
        <FeedbackForm />
      </Reveal>
    </div>
  );
}