"use client";

import { CheckCircle2, ClipboardList, Trash2, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ClinicalGuidanceEditor } from "@/components/plans/ClinicalGuidanceEditor";
import { MonthlyPlanView } from "@/components/plans/MonthlyPlanView";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { patientService } from "@/services/patientService";
import { planService } from "@/services/planService";
import type { NutritionPlan, Patient } from "@/types";
import { getErrorMessage } from "@/utils/errorHandler";

export function PlanList() {
  const { user } = useAuth();
  const isNutritionist = user?.role === "nutritionist";
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([planService.list(), patientService.list()])
      .then(([planData, patientData]) => { setPlans(planData); setPatients(patientData); })
      .catch((cause: unknown) => setError(getErrorMessage(cause)))
      .finally(() => setLoading(false));
  }, []);

  const effectivePatientId = isNutritionist ? selectedPatientId : "gerardo-pena";
  const selectedPatient = patients.find((patient) => patient.id === effectivePatientId);
  const selectedPlan = useMemo(() => plans.find((plan) => plan.patientId === effectivePatientId && plan.planMonth === "2026-09" && plan.active) ?? plans.find((plan) => plan.patientId === effectivePatientId && plan.planMonth <= "2026-09") ?? plans.find((plan) => plan.patientId === effectivePatientId), [effectivePatientId, plans]);

  async function remove() {
    if (!planToDelete) return;
    try { await planService.remove(planToDelete); setPlans((current) => current.filter((plan) => plan.id !== planToDelete)); setPlanToDelete(null); }
    catch (cause) { setError(getErrorMessage(cause)); }
  }

  if (loading) return <div className="grid min-h-64 place-items-center"><Spinner label="Cargando planes mensuales" /></div>;

  return (
    <div className="grid gap-6">
      {error ? <Alert tone="error">{error}</Alert> : null}
      {isNutritionist ? <Card className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-end"><div><p className="text-sm font-bold text-[var(--primary)]">Vista profesional</p><h2 className="mt-1 text-xl font-bold">Planes de pacientes</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Consulta el panorama completo o selecciona un paciente para revisar su plan mensual.</p></div><Select label="Filtrar por paciente" value={effectivePatientId} onChange={(event) => setSelectedPatientId(event.target.value)}><option value="all">Todos los pacientes</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</Select></Card> : null}

      {isNutritionist && effectivePatientId === "all" ? <>
        <div className="grid gap-4 sm:grid-cols-2"><Card><UsersRound className="text-[var(--primary)]" /><p className="mt-4 text-sm text-[var(--ink-muted)]">Pacientes activos</p><p className="mt-1 text-3xl font-extrabold">{patients.filter((patient) => patient.status === "active").length}</p></Card><Card><ClipboardList className="text-[var(--primary)]" /><p className="mt-4 text-sm text-[var(--ink-muted)]">Planes mensuales activos</p><p className="mt-1 text-3xl font-extrabold">{plans.filter((plan) => plan.active).length}</p></Card></div>
        <Card><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Panorama global</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Estado del plan nutricional de cada paciente.</p></div><span className="rounded-full bg-[var(--soft-green)] px-3 py-1 text-xs font-bold text-[var(--primary)]">{patients.length} pacientes</span></div><div className="mt-5 divide-y divide-[var(--border)]">{patients.map((patient) => { const plan = plans.find((item) => item.patientId === patient.id && item.active); return <button key={patient.id} type="button" onClick={() => setSelectedPatientId(patient.id)} className="flex w-full items-center gap-4 py-4 text-left transition hover:bg-[var(--surface-muted)]"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--lime)] text-sm font-bold">{patient.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span className="min-w-0 flex-1"><span className="block font-bold">{patient.name}</span><span className="mt-1 block truncate text-sm text-[var(--ink-muted)]">{plan?.title ?? "Sin plan asignado"}</span></span><span className={`rounded-full px-3 py-1 text-xs font-bold ${plan ? "bg-[var(--soft-green)] text-[var(--primary)]" : "bg-orange-50 text-orange-700"}`}>{plan ? "Plan activo" : "Pendiente"}</span></button>; })}</div></Card>
      </> : selectedPlan ? <>
        {isNutritionist ? <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[var(--ink-muted)]">Plan de <strong className="text-[var(--ink)]">{selectedPatient?.name}</strong></p><button type="button" onClick={() => setPlanToDelete(selectedPlan.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-xs font-bold text-red-500 transition hover:bg-red-50"><Trash2 className="size-4" /> Eliminar plan</button></div> : null}
        {isNutritionist ? <ClinicalGuidanceEditor key={selectedPlan.id} plan={selectedPlan} onSaved={(updated) => setPlans((current) => current.map((plan) => plan.id === updated.id ? updated : plan))} /> : null}
        <MonthlyPlanView plan={selectedPlan} />
      </> : <Card className="grid min-h-60 place-items-center text-center"><div><CheckCircle2 className="mx-auto text-slate-300" /><p className="mt-3 font-bold">No hay un plan registrado para este paciente</p></div></Card>}
      <ConfirmDialog open={Boolean(planToDelete)} title="Eliminar plan nutricional" description="El plan dejará de estar disponible para el paciente. Esta acción no se puede deshacer." confirmLabel="Sí, eliminar" tone="danger" onCancel={() => setPlanToDelete(null)} onConfirm={() => void remove()} />
    </div>
  );
}
