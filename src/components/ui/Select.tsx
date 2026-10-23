import { ReactNode } from "react";

export default function Select({
  label,
  options,
  value,
  onChange,
  disabled,
  error,
  className = "",
}: {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-ink-600">{label}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition focus:border-primary-500 focus:ring-4 focus:ring-primary-100 ${disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""} ${error ? "border-red-600" : ""} ${className}`}
      >
        <option value="">Select an option</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}