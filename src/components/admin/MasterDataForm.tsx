"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Department, Faculty } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  resource: "departments" | "faculty" | "subjects";
  item?: any;
  departments?: Department[];
  faculty?: Faculty[];
  onSave: (data: any) => void;
}

const schemas = {
  departments: z.object({
    name: z.string().min(2, "Name is too short"),
    code: z.string().min(2, "Code is too short"),
  }),
  faculty: z.object({
    name: z.string().min(2, "Name is too short"),
    designation: z.string().min(2, "Designation is required"),
    department: z.string().min(1, "Select a department"),
  }),
  subjects: z.object({
    name: z.string().min(2, "Name is too short"),
    code: z.string().min(2, "Code is too short"),
    semester: z.coerce.number().int().min(1).max(8),
    department: z.string().min(1, "Select a department"),
    faculty: z.string().min(1, "Select a faculty member"),
  }),
};

const LABELS: Record<string, string> = {
  name: "Name",
  code: "Code",
  designation: "Designation",
  department: "Department",
  faculty: "Faculty",
  semester: "Semester",
};

export default function MasterDataForm({
  open,
  onClose,
  resource,
  item,
  departments = [],
  faculty = [],
  onSave,
}: Props) {
  const schema = schemas[resource];
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: item || {},
  });

  const fields = Object.keys(schema.shape);

  // Re-seed the form whenever the modal opens or the edited item changes
  useEffect(() => {
    if (open) reset(item || {});
  }, [open, item, reset]);

  return (
    <Modal open={open} onClose={onClose} title={`${item ? "Edit" : "Add"} ${resource.replace(/s$/, "")}`}>
      <form onSubmit={handleSubmit((data) => onSave(data))} className="space-y-4">
        {fields.map((key) => {
          const error = (errors as any)[key]?.message as string | undefined;

          if (key === "semester") {
            return (
              <Input
                key={key}
                label="Semester"
                type="number"
                min={1}
                max={8}
                error={error}
                {...register("semester")}
              />
            );
          }

          if (key === "department") {
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-ink-600" htmlFor={`md-${key}`}>
                  Department
                </label>
                <select id={`md-${key}`} className="input" {...register("department")}>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
                {error && <p className="text-xs text-red-600">{error}</p>}
              </div>
            );
          }

          if (key === "faculty") {
            return (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-ink-600" htmlFor={`md-${key}`}>
                  Faculty
                </label>
                <select id={`md-${key}`} className="input" {...register("faculty")}>
                  <option value="">Select faculty</option>
                  {faculty.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                {error && <p className="text-xs text-red-600">{error}</p>}
              </div>
            );
          }

          return (
            <Input
              key={key}
              label={LABELS[key] ?? key}
              error={error}
              {...register(key)}
            />
          );
        })}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}