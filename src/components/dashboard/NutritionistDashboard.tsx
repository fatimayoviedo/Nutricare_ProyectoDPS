"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardCheck, Clock3, Plus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { StatCard } from "./StatCard";
import { consultationService } from "@/services/consultationService";
import { patientService } from "@/services/patientService";
import { planService } from "@/services/planService";
import type { Consultation, NutritionPlan, Patient } from "@/types";
import { getErrorMessage } from "@/utils/errorHandler";

export function NutritionistDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([patientService.list(), consultationService.list(), planService.list()]).then(([patientData, consultationData, planData]) => {
      setPatients(patientData);
      setConsultations(consultationData);
      setPlans(planData);
    }).catch((cause: unknown) => setError(getErrorMessage(cause))).finally(() => setLoading(false));
  }, []);
  const nextConsultation = useMemo(() => consultations.filter((item) => item.status === "scheduled").toSorted((a, b) => a.date.localeCompare(b.date))[0], [consultations]);
  if (loading) return <div className="grid min-h-72 place-items-center"><Spinner label="Cargando resumen profesional" /></div>;
  return (
    <div className="grid gap-6">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Pacientes activos" value={String(patients.filter((patient) => patient.status === "active").length)} icon={UsersRound} />
        <StatCard label="Consultas" value={String(consultations.length)} detail={nextConsultation ? `Próxima: ${new Date(nextConsultation.date).toLocaleDateString("es-SV")}` : "Sin pendientes"} icon={CalendarDays} />
        <StatCard label="Planes activos" value={String(plans.filter((plan) => plan.active).length)} icon={ClipboardCheck} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div><h2 className="text-xl font-bold">Pacientes recientes</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Seguimiento de tus últimas atenciones</p></div>
            <Link href="/pacientes" className="text-sm font-bold text-[var(--primary)]">Ver todos</Link>
          </div>
          <div className="mt-5 divide-y divide-[var(--border)]">
            {patients.slice(0, 3).map((patient) => (
              <div key={patient.name} className="flex items-center gap-3 py-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--lime)] text-sm font-bold">{patient.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span>
                <div className="min-w-0 flex-1"><p className="truncate font-bold">{patient.name}</p><p className="truncate text-sm text-[var(--ink-muted)]">{patient.objective}</p></div>
                <p className="hidden text-sm font-semibold text-[var(--primary-dark)] sm:block">{patient.nextConsultation ? new Date(patient.nextConsultation).toLocaleDateString("es-SV") : "Sin cita"}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[var(--primary-dark)] text-white">
          <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-white/12"><Clock3 /></span><div><p className="text-sm text-emerald-100">Próxima consulta</p><h2 className="text-xl font-bold">{nextConsultation?.patientName ?? "Sin consultas"}</h2></div></div>
          <p className="mt-8 text-4xl font-extrabold tracking-[-0.05em]">{nextConsultation ? new Date(nextConsultation.date).toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" }) : "--:--"}</p>
          <p className="mt-2 text-sm text-emerald-100">{nextConsultation ? `${nextConsultation.type} · ${nextConsultation.mode}` : "Programa una nueva consulta"}</p>
          <Link href="/consultas" className="mt-8 block rounded-xl bg-white px-4 py-3 text-center text-sm font-bold text-[var(--primary-dark)]">Abrir consulta</Link>
        </Card>
      </div>

      <Card className="flex flex-col items-start justify-between gap-4 bg-[var(--soft-green)] sm:flex-row sm:items-center">
        <div><h2 className="text-lg font-bold">¿Nuevo paciente?</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Crea su expediente y prepara el primer plan nutricional.</p></div>
        <Link href="/pacientes/nuevo"><Button><Plus className="size-4" /> Agregar paciente</Button></Link>
      </Card>
    </div>
  );
}
