"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlanList } from "@/components/plans/PlanList";
import { useAuth } from "@/hooks/useAuth";

export default function PlansPage() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title={user?.role === "patient" ? "Mi plan nutricional" : "Planes nutricionales"} description={user?.role === "patient" ? "Consulta tu menú mensual completo, porciones y distribución diaria." : "Consulta y administra el plan mensual asignado a cada paciente."} action={user?.role === "nutritionist" ? <Link href="/planes/nuevo" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white"><Plus className="size-4" /> Nuevo plan</Link> : undefined} />
      <PlanList />
    </>
  );
}
