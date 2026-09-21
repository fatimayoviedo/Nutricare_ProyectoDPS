"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CalendarCheck, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { consultationSchema, type ConsultationFormValues } from "@/schemas/consultationSchema";
import { consultationService } from "@/services/consultationService";
import { patientService } from "@/services/patientService";
import type { Consultation, Patient } from "@/types";
import { getErrorMessage } from "@/utils/errorHandler";

const textareaClass = "min-h-32 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-base outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-ring)]";

export function ConsultationDetail({ id }: { id: string }) {
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: { patientId: "", date: "", type: "", notes: "", mode: "Videollamada", status: "scheduled" },
  });

  useEffect(() => {
    Promise.all([consultationService.get(id), patientService.list()])
      .then(([consultationData, patientData]) => {
        setConsultation(consultationData);
        setPatients(patientData);
        reset({
          patientId: consultationData.patientId,
          date: consultationData.date.slice(0, 16),
          type: consultationData.type,
          notes: consultationData.notes,
          mode: consultationData.mode,
          status: consultationData.status,
        });
      })
      .catch((cause: unknown) => setError(getErrorMessage(cause)))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setMessage(null);
    setError(null);
    try {
      const updated = await consultationService.update(id, values);
      setConsultation(updated);
      setMessage("La consulta se actualizó correctamente.");
    } catch (cause) { setError(getErrorMessage(cause)); }
  });

  if (loading) return <div className="grid min-h-72 place-items-center"><Spinner label="Cargando consulta" /></div>;
  if (!consultation) return <Alert tone="error">{error ?? "No fue posible encontrar la consulta."}</Alert>;

  return (
    <>
      <PageHeader
        title="Detalle de consulta"
        description={`Seguimiento de ${consultation.patientName}`}
        action={<Link href="/consultas" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--ink-muted)]"><ArrowLeft className="size-4" /> Volver a la agenda</Link>}
      />
      {message ? <div className="mb-5"><Alert>{message}</Alert></div> : null}
      {error ? <div className="mb-5"><Alert tone="error">{error}</Alert></div> : null}
      <Card className="max-w-5xl">
        <div className="mb-6 flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><CalendarCheck /></span><div><h2 className="text-xl font-bold">Información y seguimiento</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Actualiza la programación, las notas clínicas y el estado de la consulta.</p></div></div>
        <form onSubmit={onSubmit} className="grid gap-5" noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <Select label="Paciente" error={errors.patientId?.message} {...register("patientId")}><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</Select>
            <Input label="Fecha y hora" type="datetime-local" error={errors.date?.message} {...register("date")} />
            <Input label="Tipo de consulta" error={errors.type?.message} {...register("type")} />
            <Select label="Modalidad" error={errors.mode?.message} {...register("mode")}><option value="Videollamada">Videollamada</option><option value="Presencial">Presencial</option></Select>
            <Select label="Estado" error={errors.status?.message} {...register("status")}><option value="scheduled">Programada</option><option value="completed">Completada</option><option value="cancelled">Cancelada</option></Select>
          </div>
          <label className="grid gap-2 text-sm font-medium">Notas y acuerdos<textarea rows={5} placeholder="Registra observaciones, acuerdos y próximos pasos." className={textareaClass} {...register("notes")} />{errors.notes?.message ? <span className="text-xs font-normal text-red-600">{errors.notes.message}</span> : null}</label>
          <div><Button type="submit" disabled={isSubmitting}><Save className="size-4" /> {isSubmitting ? "Guardando..." : "Guardar cambios"}</Button></div>
        </form>
      </Card>
    </>
  );
}
