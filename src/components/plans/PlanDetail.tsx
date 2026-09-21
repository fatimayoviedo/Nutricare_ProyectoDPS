"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { planService } from "@/services/planService";
import type { NutritionPlan } from "@/types";
import { getErrorMessage } from "@/utils/errorHandler";

export function PlanDetail({ id }: { id: string }) {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { planService.get(id).then(setPlan).catch((cause: unknown) => setError(getErrorMessage(cause))); }, [id]);
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!plan) return <div className="grid min-h-64 place-items-center"><Spinner label="Cargando plan" /></div>;
  return <Card><span className="rounded-full bg-[var(--soft-green)] px-3 py-1 text-xs font-bold text-[var(--primary)]">{plan.active ? "Activo" : "Archivado"}</span><h2 className="mt-4 text-2xl font-bold">{plan.title}</h2><p className="mt-1 text-[var(--ink-muted)]">{plan.objective}</p><div className="mt-6 divide-y divide-[var(--border)]">{plan.meals.map((meal) => <div key={meal.id} className="flex gap-4 py-4"><Clock3 className="mt-1 size-5 text-[var(--primary)]" /><div><p className="font-bold">{meal.time} · {meal.title}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">{meal.description}</p></div></div>)}</div></Card>;
}
