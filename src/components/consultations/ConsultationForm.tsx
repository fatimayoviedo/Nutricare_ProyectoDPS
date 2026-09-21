"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarPlus } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { consultationSchema, type ConsultationFormValues } from "@/schemas/consultationSchema";
import { consultationService } from "@/services/consultationService";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types";
import { getErrorMessage } from "@/utils/errorHandler";

export function ConsultationForm() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: { patientId: "", date: "", type: "Seguimiento nutricional", notes: "", mode: "Videollamada", status: "scheduled" },
  });
  useEffect(() => { patientService.list().then(setPatients).catch((cause: unknown) => setError(getErrorMessage(cause))); }, []);
  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await consultationService.create(values);
      router.push("/consultas");
      router.refresh();
    } catch (cause) { setError(getErrorMessage(cause)); }
  });
  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Select label="Paciente" error={errors.patientId?.message} {...register("patientId")}><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</Select>
      <Input label="Fecha y hora" type="datetime-local" error={errors.date?.message} {...register("date")} />
      <Input label="Tipo de consulta" error={errors.type?.message} {...register("type")} />
      <Select label="Modalidad" error={errors.mode?.message} {...register("mode")}><option value="Videollamada">Videollamada</option><option value="Presencial">Presencial</option></Select>
      <Input label="Notas iniciales" error={errors.notes?.message} {...register("notes")} />
      <Button type="submit" disabled={isSubmitting}><CalendarPlus className="size-4" /> {isSubmitting ? "Programando..." : "Programar consulta"}</Button>
    </form>
  );
}
