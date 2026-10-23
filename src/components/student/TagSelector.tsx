interface Props { options: string[]; value: string[]; onChange: (v: string[]) => void; max?: number }

export default function TagSelector({ options, value, onChange, max = 5 }: Props) {
  const toggle = (t: string) => {
    if (value.includes(t)) onChange(value.filter((x) => x !== t));
    else if (value.length < max) onChange([...value, t]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((t) => (
        <button key={t} type="button" onClick={() => toggle(t)}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition ${value.includes(t) ? "border-primary-600 bg-primary-50 text-primary-700" : "border-slate-200 text-ink-600 hover:bg-slate-50"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}