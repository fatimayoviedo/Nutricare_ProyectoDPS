"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Pencil, Search, Trash2, UsersRound } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { usePatients } from "@/hooks/usePatients";
import { calculateAge } from "@/utils/calculateAge";
import { formatDate } from "@/utils/formatDate";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function PatientList() {
  const { patients, loading, error, loadPatients, removePatient } = usePatients();
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => { void loadPatients(); }, [loadPatients]);

  async function handleDelete() {
    if (!patientToDelete) return;
    await removePatient(patientToDelete.id);
    setPatientToDelete(null);
    setMessage("Paciente eliminado correctamente.");
  }

  return (
    <div>
      <form onSubmit={(event) => { event.preventDefault(); void loadPatients(search); }} className="flex gap-2">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl bg-[var(--surface-muted)] px-4 text-sm text-[var(--ink-muted)]">
          <Search className="size-4" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, correo u objetivo..." className="w-full bg-transparent outline-none" />
        </label>
        <button className="rounded-xl bg-[var(--primary-dark)] px-5 text-sm font-bold text-white">Buscar</button>
      </form>
      <div className="mt-4 grid gap-3">
        {error ? <Alert tone="error">{error}</Alert> : null}
        {message ? <Alert>{message}</Alert> : null}
        {loading ? <div className="grid min-h-40 place-items-center"><Spinner label="Consultando pacientes" /></div> : null}
        {!loading && patients.length === 0 ? (
          <div className="grid min-h-52 place-items-center text-center"><div><UsersRound className="mx-auto size-9 text-slate-300" /><p className="mt-3 font-bold">No hay pacientes para mostrar</p><p className="mt-1 text-sm text-[var(--ink-muted)]">Prueba otra búsqueda o crea un expediente.</p></div></div>
        ) : null}
        {!loading && patients.map((patient) => (
          <article key={patient.id} className="grid gap-4 rounded-2xl border border-[var(--border)] p-4 transition hover:border-emerald-300 hover:bg-emerald-50/30 md:grid-cols-[1.5fr_1fr_0.8fr_auto] md:items-center">
            <Link href={`/pacientes/${patient.id}`} className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--lime)] text-sm font-bold">{initials(patient.name)}</span>
              <div><p className="font-bold">{patient.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-[var(--ink-muted)]"><Mail className="size-3" /> {patient.email}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{calculateAge(patient.dateOfBirth)} años · {patient.sex === "female" ? "Mujer" : "Hombre"} · {patient.heightCm} cm</p></div>
            </Link>
            <div><p className="text-xs text-[var(--ink-muted)]">Objetivo</p><p className="mt-1 text-sm font-semibold">{patient.objective}</p></div>
            <div><p className="text-xs text-[var(--ink-muted)]">Próxima consulta</p><p className="mt-1 text-sm font-semibold">{patient.nextConsultation ? formatDate(patient.nextConsultation) : "Sin programar"}</p></div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${patient.status === "active" ? "bg-[var(--soft-green)] text-[var(--primary-dark)]" : "bg-slate-100 text-slate-500"}`}>{patient.status === "active" ? "Activo" : "Inactivo"}</span>
              <Link href={`/pacientes/${patient.id}/editar`} className="rounded-lg border border-[var(--border)] p-2 text-[var(--primary)]" aria-label={`Editar a ${patient.name}`}><Pencil className="size-4" /></Link>
              <button type="button" onClick={() => setPatientToDelete({ id: patient.id, name: patient.name })} className="rounded-lg border border-red-100 p-2 text-red-500" aria-label={`Eliminar a ${patient.name}`}><Trash2 className="size-4" /></button>
            </div>
          </article>
        ))}
      </div>
      <ConfirmDialog open={Boolean(patientToDelete)} title="Eliminar paciente" description={`Se eliminará a ${patientToDelete?.name ?? "este paciente"} junto con sus registros asociados. Esta acción no se puede deshacer.`} confirmLabel="Sí, eliminar" tone="danger" onCancel={() => setPatientToDelete(null)} onConfirm={() => void handleDelete()} />
    </div>
  );
}
