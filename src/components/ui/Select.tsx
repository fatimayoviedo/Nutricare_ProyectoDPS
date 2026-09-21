import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className = "", children, ...props },
  ref,
) {
  const selectId = id ?? props.name;
  return (
    <label className="grid gap-2 text-sm font-medium text-[var(--ink)]" htmlFor={selectId}>
      {label}
      <select
        ref={ref}
        id={selectId}
        className={`min-h-12 rounded-xl border bg-white px-4 text-base outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-ring)] ${error ? "border-red-400" : "border-[var(--border)]"} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs font-normal text-red-600">{error}</span> : null}
    </label>
  );
});

