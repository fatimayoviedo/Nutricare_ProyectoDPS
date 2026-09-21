"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Trash2, Video } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { consultationService } from "@/services/consultationService";
import type { Consultation } from "@/types";
import { getErrorMessage } from "@/utils/errorHandler";

export function ConsultationList() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultationToDelete, setConsultationToDelete] = useState<string | null>(null);

  useEffect(() => {
    consultationService.list().then(setConsultations).catch((cause: unknown) => setError(getErrorMessage(cause))).finally(() => setLoading(false));
  }, []);

  async function remove() {
    if (!consultationToDelete) return;
    try {
      await consultationService.remove(consultationToDelete);
      setConsultations((current) => current.filter((item) => item.id !== consultationToDelete));
      setConsultationToDelete(null);
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  }

  if (loading) return <div className="grid min-h-64 place-items-center"><Spinner label="Cargando agenda" /></div>;
  return (
    <div className="grid gap-6 xl:grid-cols-[0.62fr_1.38fr]">
      <Card><div className="flex items-center gap-3"><CalendarDays className="text-[var(--primary)]" /><h2 className="text-xl font-bold">Septiembre 2026</h2></div><div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs text-[var(--ink-muted)]">{["L","M","M","J","V","S","D"].map((day, index) => <span key={`${day}-${index}`} className="font-bold">{day}</span>)}{Array.from({ length: 30 }, (_, index) => <span key={index} className={`grid aspect-square place-items-center rounded-full ${index + 1 === 15 ? "bg-[var(--primary)] font-bold text-white" : "hover:bg-[var(--soft-green)]"}`}>{index + 1}</span>)}</div></Card>
      <Card><h2 className="text-xl font-bold">Agenda</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">{consultations.length} consultas programadas</p>{error ? <div className="mt-4"><Alert tone="error">{error}</Alert></div> : null}<div className="mt-5 divide-y divide-[var(--border)]">{consultations.length === 0 ? <p className="py-10 text-center text-sm text-[var(--ink-muted)]">No hay consultas programadas.</p> : consultations.map((item) => <div key={item.id} className="flex gap-4 py-5"><div className="w-16 text-lg font-extrabold text-[var(--primary)]">{new Date(item.date).toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" })}</div><div className="flex-1"><Link href={`/consultas/${item.id}`} className="font-bold hover:text-[var(--primary)]">{item.patientName}</Link><p className="mt-1 text-sm text-[var(--ink-muted)]">{item.type}</p><p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--primary-dark)]">{item.mode === "Videollamada" ? <Video className="size-3" /> : <Clock3 className="size-3" />}{item.mode} · {new Date(item.date).toLocaleDateString("es-SV")}</p></div><button type="button" onClick={() => setConsultationToDelete(item.id)} className="h-fit rounded-lg border border-red-100 p-2 text-red-500" aria-label="Eliminar consulta"><Trash2 className="size-4" /></button></div>)}</div></Card>
      <ConfirmDialog open={Boolean(consultationToDelete)} title="Eliminar consulta" description="La consulta se eliminará de la agenda. Esta acción no se puede deshacer." confirmLabel="Sí, eliminar" tone="danger" onCancel={() => setConsultationToDelete(null)} onConfirm={() => void remove()} />
    </div>
  );
}
