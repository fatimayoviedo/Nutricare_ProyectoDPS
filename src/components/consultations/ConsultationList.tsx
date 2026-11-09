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
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const [day, setDay] = useState("");
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

  const [year, monthNumber] = month.split('-').map(Number);
  const dayCount = new Date(year, monthNumber, 0).getDate();
  const offset = (new Date(year, monthNumber-1, 1).getDay()+6)%7;
  const visible = consultations.filter(item => !day || item.date.slice(0,10) === day);
  if (loading) return <div className="grid min-h-64 place-items-center"><Spinner label="Cargando agenda" /></div>;
  return (
    <div className="grid gap-6 xl:grid-cols-[0.62fr_1.38fr]">
      <Card><label className="flex items-center gap-3 font-bold"><CalendarDays className="text-[var(--primary)]" /> Mes <input aria-label="Mes de la agenda" type="month" value={month} onChange={event => { if(event.target.value) setMonth(event.target.value); setDay(''); }} className="min-w-0 rounded-xl border p-2" /></label><div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs">{['L','M','M','J','V','S','D'].map((label,index)=><span key={index}>{label}</span>)}{Array.from({length:offset},(_,index)=><span key={'blank'+index} />)}{Array.from({length:dayCount},(_,index)=>{const date=month+'-'+String(index+1).padStart(2,'0');const hasAppointment=consultations.some(item=>item.date.startsWith(date));return <button key={date} onClick={()=>setDay(date)} className={'grid aspect-square place-items-center rounded-full '+(day===date?'bg-[var(--primary)] text-white':hasAppointment?'bg-[var(--soft-green)] font-bold':'hover:bg-slate-100')}>{index+1}</button>;})}</div><button className="mt-5 text-sm font-bold text-[var(--primary)]" onClick={()=>setDay('')}>Ver todas las fechas</button></Card>
      <Card><h2 className="text-xl font-bold">Agenda</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">{visible.length} consultas {day ? `del ${day}` : "registradas"}</p>{error ? <div className="mt-4"><Alert tone="error">{error}</Alert></div> : null}<div className="mt-5 divide-y divide-[var(--border)]">{visible.length === 0 ? <p className="py-10 text-center text-sm text-[var(--ink-muted)]">No hay consultas programadas.</p> : visible.map((item) => <div key={item.id} className="flex gap-4 py-5"><div className="w-16 text-lg font-extrabold text-[var(--primary)]">{new Date(item.date).toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" })}</div><div className="flex-1"><Link href={`/consultas/${item.id}`} className="font-bold hover:text-[var(--primary)]">{item.patientName}</Link><p className="mt-1 text-sm text-[var(--ink-muted)]">{item.type} · {item.status === "completed" ? "Completada" : item.status === "cancelled" ? "Cancelada" : "Programada"}</p><p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--primary-dark)]">{item.mode === "Videollamada" ? <Video className="size-3" /> : <Clock3 className="size-3" />}{item.mode} · {new Date(item.date).toLocaleDateString("es-SV")}</p></div><button type="button" onClick={() => setConsultationToDelete(item.id)} className="h-fit rounded-lg border border-red-100 p-2 text-red-500" aria-label="Eliminar consulta"><Trash2 className="size-4" /></button></div>)}</div></Card>
      <ConfirmDialog open={Boolean(consultationToDelete)} title="Eliminar consulta" description="La consulta se eliminará de la agenda. Esta acción no se puede deshacer." confirmLabel="Sí, eliminar" tone="danger" onCancel={() => setConsultationToDelete(null)} onConfirm={() => void remove()} />
    </div>
  );
}
