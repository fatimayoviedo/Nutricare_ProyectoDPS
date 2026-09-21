"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, CakeSlice, Edit3, Mail, Ruler, UserRound } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types";
import { calculateAge } from "@/utils/calculateAge";
import { getErrorMessage } from "@/utils/errorHandler";

export function PatientDetail({ id }: { id: string }) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { patientService.get(id).then(setPatient).catch((cause: unknown) => setError(getErrorMessage(cause))); }, [id]);
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!patient) return <div className="grid min-h-64 place-items-center"><Spinner label="Cargando expediente" /></div>;
  const initials = patient.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="grid gap-6 xl:grid-cols-[0.45fr_1fr]">
      <Card><div className="flex items-start justify-between"><span className="grid size-20 place-items-center rounded-full bg-[var(--lime)] text-xl font-extrabold">{initials}</span><Link href={`/pacientes/${id}/editar`} className="rounded-xl border border-[var(--primary)] p-2.5 text-[var(--primary)]" aria-label="Editar paciente"><Edit3 className="size-4" /></Link></div><div className="mt-5 flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold">{patient.name}</h2><span className="rounded-full bg-[var(--soft-green)] px-3 py-1 text-xs font-bold text-[var(--primary)]">{patient.status === "active" ? "Activo" : "Inactivo"}</span></div><p className="mt-2 flex items-center gap-2 text-sm text-[var(--ink-muted)]"><Mail className="size-4" /> {patient.email}</p><div className="mt-6 rounded-2xl bg-[var(--soft-green)] p-4"><p className="text-xs text-[var(--ink-muted)]">Objetivo principal</p><p className="mt-1 font-bold">{patient.objective}</p></div></Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card><CakeSlice className="text-[var(--primary)]" /><p className="mt-4 text-sm text-[var(--ink-muted)]">Edad</p><p className="mt-1 text-2xl font-bold">{calculateAge(patient.dateOfBirth)} años</p><p className="mt-1 text-xs text-[var(--ink-muted)]">Nacimiento: {new Date(`${patient.dateOfBirth}T12:00:00`).toLocaleDateString("es-SV")}</p></Card><Card><UserRound className="text-[var(--primary)]" /><p className="mt-4 text-sm text-[var(--ink-muted)]">Sexo</p><p className="mt-1 text-lg font-bold">{patient.sex === "female" ? "Mujer" : "Hombre"}</p></Card><Card><Ruler className="text-[var(--primary)]" /><p className="mt-4 text-sm text-[var(--ink-muted)]">Estatura</p><p className="mt-1 text-lg font-bold">{patient.heightCm} cm</p></Card><Card><CalendarDays className="text-[var(--primary)]" /><p className="mt-4 text-sm text-[var(--ink-muted)]">Próxima cita</p><p className="mt-1 text-lg font-bold">{patient.nextConsultation ? new Date(patient.nextConsultation).toLocaleDateString("es-SV") : "Sin programar"}</p></Card></div>
    </div>
  );
}
