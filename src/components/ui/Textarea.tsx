import { ReactNode } from "react";

export default function Textarea({
  label,
  placeholder,
  error,
  rows = 4,
  maxLength,
  className = "",
  ...props
}: {
  label?: string;
  placeholder?: string;
  error?: string;
  rows?: number;
  maxLength?: number;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-ink-600">{label}</p>}
      <textarea
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition resize-none placeholder:text-ink-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 ${error ? "border-red-600" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}