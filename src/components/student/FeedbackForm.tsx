"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "@/lib/api";
import useFetch from "@/hooks/useFetch";
import { feedbackSchema, FeedbackValues } from "@/lib/validators";
import { CATEGORIES, FEEDBACK_TYPES } from "@/constants/options";
import type { Department, Settings, Subject } from "@/types";
import StarRating from "./StarRating";
import TagSelector from "./TagSelector";
import Button from "@/components/ui/Button";

function Chip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${active ? "border-primary-600 bg-primary-600 text-white" : "border-slate-200 bg-white text-ink-600 hover:bg-slate-50"}`}>
      {children}
    </button>
  );
}

export default function FeedbackForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { data: departments } = useFetch<Department[]>("/departments");
  const { data: settings } = useFetch<Settings>("/settings");

  const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { category: "teaching", type: "appreciation", department: "", subject: "", faculty: "", tags: [], comment: "", isAnonymous: false },
  });

  const category = watch("category");
  const department = watch("department");
  const subjectId = watch("subject");
  const isTeaching = category === "teaching";
  const selectedSubject = subjects.find((s) => s._id === subjectId);

  useEffect(() => {
    setValue("subject", ""); setValue("faculty", ""); setSubjects([]);
    if (department) api.get("/subjects", { params: { department } }).then((r) => setSubjects(r.data.data));
  }, [department, setValue]);

  useEffect(() => { setValue("faculty", selectedSubject?.faculty._id ?? ""); }, [selectedSubject, setValue]);

  const onSubmit = async (values: FeedbackValues) => {
    setSubmitting(true);
    try {
      const payload: Partial<FeedbackValues> = { ...values };
      if (!isTeaching) { delete payload.subject; delete payload.faculty; delete payload.rating; }
      await api.post("/feedback", payload);
      toast.success("Feedback submitted. Thank you!");
      router.push("/student/feedback/history");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const closed = settings && !settings.feedbackOpen;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-7 p-6 sm:p-8">
      {closed && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          Feedback is currently closed by the administrator.
        </div>
      )}

      <Controller name="category" control={control} render={({ field }) => (
        <div><p className="mb-2 text-sm font-medium text-ink-600">Category</p>
          <div className="flex flex-wrap gap-2">{CATEGORIES.map((c) => <Chip key={c.value} active={field.value === c.value} onClick={() => field.onChange(c.value)}>{c.label}</Chip>)}</div></div>
      )} />

      <Controller name="type" control={control} render={({ field }) => (
        <div><p className="mb-2 text-sm font-medium text-ink-600">Feedback type</p>
          <div className="flex flex-wrap gap-2">{FEEDBACK_TYPES.map((t) => <Chip key={t.value} active={field.value === t.value} onClick={() => field.onChange(t.value)}>{t.label}</Chip>)}</div></div>
      )} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-ink-600">Department</p>
          <select className="input" {...register("department")}>
            <option value="">Select department</option>
            {departments?.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department.message}</p>}
        </div>

        {isTeaching && (
          <div>
            <p className="mb-2 text-sm font-medium text-ink-600">Subject</p>
            <select className="input" disabled={!department} {...register("subject")}>
              <option value="">Select subject</option>
              {subjects.map((s) => <option key={s._id} value={s._id}>{s.name} (Sem {s.semester})</option>)}
            </select>
            {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
          </div>
        )}
      </div>

      {isTeaching && selectedSubject && (
        <div className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">Faculty: <strong>{selectedSubject.faculty.name}</strong></div>
      )}

      {isTeaching && (
        <Controller name="rating" control={control} render={({ field }) => (
          <div><p className="mb-2 text-sm font-medium text-ink-600">Your rating</p>
            <StarRating value={field.value} onChange={field.onChange} />
            {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>}</div>
        )} />
      )}

      <Controller name="tags" control={control} render={({ field }) => (
        <div><p className="mb-2 text-sm font-medium text-ink-600">Quick tags (optional)</p>
          <TagSelector options={settings?.tags ?? []} value={field.value} onChange={field.onChange} /></div>
      )} />

      <div>
        <p className="mb-2 text-sm font-medium text-ink-600">Comments</p>
        <textarea rows={5} maxLength={1000} className="input resize-none" placeholder="Tell us what went well or what can improve..." {...register("comment")} />
        <div className="mt-1 flex justify-between text-xs">
          <span className="text-red-600">{errors.comment?.message}</span>
          <span className="text-ink-400">{watch("comment").length}/1000</span>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-600">
        <input type="checkbox" className="h-4 w-4 rounded accent-indigo-600" {...register("isAnonymous")} />
        Submit anonymously (hidden from the administrator)
      </label>

      <Button type="submit" loading={submitting} disabled={!!closed} className="w-full sm:w-auto">Submit feedback</Button>
    </form>
  );
}