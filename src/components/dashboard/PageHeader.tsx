import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-bold text-[var(--primary)]">NutriCare</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.04em] md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)] md:text-base">{description}</p>
      </div>
      {action}
    </div>
  );
}

