export function Spinner({ label = "Cargando" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-[var(--ink-muted)]">
      <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      {label}
    </span>
  );
}

