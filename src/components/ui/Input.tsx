import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = "", ...props },
  ref,
) {
  const inputId = id ?? props.name;
  return (
    <label className="grid gap-2 text-sm font-medium text-[var(--ink)]" htmlFor={inputId}>
      {label}
      <input
        ref={ref}
        id={inputId}
        className={`min-h-12 w-full rounded-xl border bg-white px-4 text-base outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-ring)] ${error ? "border-red-400" : "border-[var(--border)]"} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
});

