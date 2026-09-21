import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  const backgroundClass = className.includes("bg-") ? "" : "bg-white";

  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--border)] ${backgroundClass} p-5 shadow-[var(--shadow-card)] ${className}`}
      {...props}
    />
  );
}
