"use client";
import { Check, X } from "lucide-react";
import type { FeedbackStatus } from "@/types";
import { titleCase } from "@/lib/utils";

interface Props {
  status: FeedbackStatus;
}

export default function StatusTimeline({ status }: Props) {
  const rejected = status === "rejected";
  const reached = (step: "pending" | "in_review" | "resolved") => {
    if (rejected) return step === "pending";
    const order: FeedbackStatus[] = ["pending", "in_review", "resolved"];
    return order.indexOf(status) >= order.indexOf(step);
  };

  const steps = [
    { key: "pending", label: "Submitted", done: reached("pending") },
    { key: "in_review", label: "In Review", done: reached("in_review") },
    { key: rejected ? "rejected" : "resolved", label: rejected ? "Rejected" : "Resolved", done: rejected ? true : reached("resolved") },
  ];

  return (
    <div className="flex items-start">
      {steps.map((step, i) => (
        <div key={step.key} className="relative flex flex-1 flex-col items-center gap-2">
          {i < steps.length - 1 && (
            <div
              className={`absolute left-1/2 top-4 h-0.5 w-full ${
                step.done && steps[i + 1].done
                  ? rejected && i === 0
                    ? "bg-red-300"
                    : "bg-primary-400"
                  : "bg-slate-200"
              }`}
            />
          )}
          <span
            className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-sm font-bold ${
              step.done
                ? rejected && i === steps.length - 1
                  ? "border-red-500 bg-red-500 text-white"
                  : step.key === "pending"
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-green-500 bg-green-500 text-white"
                : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            {step.done ? (
              rejected && i === steps.length - 1 ? (
                <X size={14} />
              ) : (
                <Check size={14} />
              )
            ) : (
              i + 1
            )}
          </span>
          <p
            className={`text-center text-xs font-semibold ${
              step.done ? (rejected && i === 2 ? "text-red-600" : "text-ink-800") : "text-ink-400"
            }`}
          >
            {titleCase(step.label)}
          </p>
        </div>
      ))}
    </div>
  );
}