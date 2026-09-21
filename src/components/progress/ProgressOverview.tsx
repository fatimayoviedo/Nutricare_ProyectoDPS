"use client";

import { Activity, CheckCircle2, Dumbbell, Gauge, Percent, Target, TrendingDown, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { measurementService } from "@/services/measurementService";
import { patientService } from "@/services/patientService";
import type { Measurement, Patient } from "@/types";
import { getErrorMessage } from "@/utils/errorHandler";

export function ProgressOverview() {
  const { user } = useAuth();
  const isNutritionist = user?.role === "nutritionist";
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    if (typeof window === "undefined") return "gerardo-pena";
    try { return JSON.parse(window.localStorage.getItem("nutricare_session") ?? "null")?.role === "nutritionist" ? "all" : "gerardo-pena"; }
    catch { return "gerardo-pena"; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([measurementService.list(), patientService.list()])
      .then(([measurementData, patientData]) => { setMeasurements(measurementData); setPatients(patientData); })
      .catch((cause: unknown) => setError(getErrorMessage(cause)))
      .finally(() => setLoading(false));
  }, []);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const patientMeasurements = useMemo(() => measurements.filter((item) => item.patientId === selectedPatientId).toSorted((a, b) => a.date.localeCompare(b.date)), [measurements, selectedPatientId]);
  const summary = useMemo(() => {
    const first = patientMeasurements[0];
    const latest = patientMeasurements.at(-1);
    return { latest, change: first && latest ? Number((latest.weightKg - first.weightKg).toFixed(1)) : 0 };
  }, [patientMeasurements]);

  if (loading) return <div className="grid min-h-80 place-items-center"><Spinner label="Procesando progreso" /></div>;
  if (error) return <Alert tone="error">{error}</Alert>;

  return (
    <div className="grid gap-5">
      {isNutritionist ? <Card className="grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-end"><div><p className="text-sm font-bold text-[var(--primary)]">Seguimiento de pacientes</p><h2 className="mt-1 text-xl font-bold">Progreso nutricional</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Compara el estado global o consulta la evolución detallada de una persona.</p></div><Select label="Filtrar por paciente" value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}><option value="all">Todos los pacientes</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</Select></Card> : null}

      {isNutritionist && selectedPatientId === "all" ? <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{patients.map((patient) => {
          const records = measurements.filter((item) => item.patientId === patient.id).toSorted((a, b) => a.date.localeCompare(b.date));
          const first = records[0]; const latest = records.at(-1); const change = first && latest ? Number((latest.weightKg - first.weightKg).toFixed(1)) : 0;
          return <button key={patient.id} type="button" onClick={() => setSelectedPatientId(patient.id)} className="rounded-3xl border border-[var(--border)] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)]"><div className="flex items-center justify-between gap-3"><span className="grid size-12 place-items-center rounded-full bg-[var(--lime)] font-bold">{patient.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><span className="rounded-full bg-[var(--soft-green)] px-3 py-1 text-xs font-bold text-[var(--primary)]">{records.length} registros</span></div><h3 className="mt-5 text-lg font-bold">{patient.name}</h3><p className="mt-1 text-sm text-[var(--ink-muted)]">{patient.objective}</p><div className="mt-5 grid grid-cols-2 gap-3"><div><p className="text-xs text-[var(--ink-muted)]">Peso actual</p><p className="mt-1 text-xl font-extrabold">{latest ? `${latest.weightKg} kg` : "—"}</p></div><div><p className="text-xs text-[var(--ink-muted)]">Cambio</p><p className={`mt-1 text-xl font-extrabold ${change <= 0 ? "text-[var(--primary)]" : "text-orange-600"}`}>{change > 0 ? "+" : ""}{change} kg</p></div></div></button>;
        })}</div>
        <Card className="flex items-start gap-4 bg-[var(--soft-green)]"><UsersRound className="mt-1 text-[var(--primary)]" /><div><h2 className="font-bold">Panorama global de seguimiento</h2><p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">Selecciona cualquier paciente para abrir su gráfica, composición corporal y tendencia individual.</p></div></Card>
      </> : <>
        {isNutritionist ? <p className="text-sm text-[var(--ink-muted)]">Mostrando progreso de <strong className="text-[var(--ink)]">{selectedPatient?.name}</strong></p> : null}
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <Card className="overflow-hidden"><div className="flex items-center justify-between"><div><p className="text-sm text-[var(--ink-muted)]">Peso actual</p><h2 className="mt-1 text-3xl font-extrabold">{summary.latest?.weightKg ?? "-"} kg</h2></div><span className="rounded-full bg-[var(--soft-green)] px-3 py-1 text-xs font-bold text-[var(--primary)]">{patientMeasurements.length} registros</span></div><div className="mt-6 h-56" role="img" aria-label="Gráfica dinámica de evolución del peso"><ResponsiveContainer width="100%" height="100%"><LineChart data={patientMeasurements} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}><CartesianGrid stroke="#dce7e3" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="date" tickFormatter={(value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("es-SV", { month: "short" })} tick={{ fill: "#6b7e79", fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: "#6b7e79", fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value} kg`, "Peso"]} labelFormatter={(label) => new Date(`${label}T12:00:00`).toLocaleDateString("es-SV")} contentStyle={{ borderRadius: 14, borderColor: "#dce7e3" }} /><Line type="monotone" dataKey="weightKg" stroke="#0aa186" strokeWidth={4} dot={{ fill: "white", stroke: "#0aa186", strokeWidth: 3, r: 5 }} activeDot={{ r: 7 }} /></LineChart></ResponsiveContainer></div></Card>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1"><Card><span className="grid size-11 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><TrendingDown /></span><p className="mt-5 text-sm text-[var(--ink-muted)]">Cambio total</p><p className="mt-1 text-3xl font-extrabold">{summary.change > 0 ? "+" : ""}{summary.change} kg</p></Card><Card><span className="grid size-11 place-items-center rounded-2xl bg-[var(--lime)] text-[var(--primary-dark)]"><Target /></span><p className="mt-5 text-sm text-[var(--ink-muted)]">Meta</p><p className="mt-1 text-3xl font-extrabold">65 kg</p></Card></div>
        </div>
        <div className={`grid gap-5 ${isNutritionist ? "" : "md:grid-cols-2"}`}>{!isNutritionist ? <Card className="bg-[var(--soft-green)]"><CheckCircle2 className="text-[var(--primary)]" /><h2 className="mt-4 text-lg font-bold text-[var(--primary-dark)]">Tendencia de seguimiento</h2><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">El avance se mantiene registrado. Continúa revisando el plan y las mediciones periódicas.</p></Card> : null}<Card><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><Activity /></span><div><h2 className="text-lg font-bold">Composición corporal</h2><p className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">Indicadores de la medición más reciente.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-2xl bg-[var(--surface-muted)] p-4"><Gauge className="size-5 text-[var(--primary)]" /><p className="mt-3 text-xs text-[var(--ink-muted)]">IMC</p><p className="mt-1 text-xl font-extrabold">{summary.latest?.bmi ?? "-"}</p></div><div className="rounded-2xl bg-[var(--surface-muted)] p-4"><Percent className="size-5 text-[var(--primary)]" /><p className="mt-3 text-xs text-[var(--ink-muted)]">Grasa corporal</p><p className="mt-1 text-xl font-extrabold">{summary.latest?.bodyFatPercentage ?? "-"}%</p></div><div className="rounded-2xl bg-[var(--surface-muted)] p-4"><Dumbbell className="size-5 text-[var(--primary)]" /><p className="mt-3 text-xs text-[var(--ink-muted)]">Masa muscular</p><p className="mt-1 text-xl font-extrabold">{summary.latest?.muscleMassPercentage ?? "-"}%</p></div><div className="rounded-2xl bg-[var(--surface-muted)] p-4"><Activity className="size-5 text-[var(--primary)]" /><p className="mt-3 text-xs text-[var(--ink-muted)]">Edad metabólica</p><p className="mt-1 text-xl font-extrabold">{summary.latest?.metabolicAge ?? "-"} años</p></div></div></Card></div>
      </>}
    </div>
  );
}
