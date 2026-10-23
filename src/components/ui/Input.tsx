import { ReactNode } from "react";

export default function Input({
  label,
  type = "text",
  placeholder,
  error,
  className = "",
  ...props
}: {
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-ink-600">{label}</p>}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition placeholder:text-ink-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 ${error ? "border-red-600" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}