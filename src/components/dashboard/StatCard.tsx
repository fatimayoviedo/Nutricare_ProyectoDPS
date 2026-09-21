import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail?: string; icon: LucideIcon }) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--ink-muted)]">{label}</p>
        <p className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">{value}</p>
        {detail ? <p className="mt-2 text-xs font-semibold text-[var(--primary)]">{detail}</p> : null}
      </div>
      <span className="grid size-11 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><Icon className="size-5" /></span>
    </Card>
  );
}
