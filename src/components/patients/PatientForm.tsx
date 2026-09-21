"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { patientSchema, type PatientFormValues } from "@/schemas/patientSchema";
import { patientService } from "@/services/patientService";
import { getErrorMessage } from "@/utils/errorHandler";

export function PatientForm({ patientId }: { patientId?: string }) {
  const router = useRouter();
  const [loadError, setLoadError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { status: "active", name: "", email: "", dateOfBirth: "", sex: "male", heightCm: 168, objective: "", nextConsultation: "" },
  });

  useEffect(() => {
    if (!patientId) return;
    patientService.get(patientId)
      .then((patient) => reset({ name: patient.name, email: patient.email, dateOfBirth: patient.dateOfBirth, sex: patient.sex, heightCm: patient.heightCm, objective: patient.objective, status: patient.status, nextConsultation: patient.nextConsultation ?? "" }))
      .catch((error: unknown) => setLoadError(getErrorMessage(error)));
  }, [patientId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setLoadError(null);
    try {
      if (patientId) await patientService.update(patientId, values);
      else await patientService.create(values);
      router.push("/pacientes");
      router.refresh();
    } catch (error) {
      setLoadError(getErrorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2" noValidate>
      {loadError ? <div className="sm:col-span-2"><Alert tone="error">{loadError}</Alert></div> : null}
      <Input label="Nombre completo" error={errors.name?.message} {...register("name")} />
      <Input label="Correo electrónico" type="email" error={errors.email?.message} {...register("email")} />
      <Input label="Fecha de nacimiento" type="date" error={errors.dateOfBirth?.message} {...register("dateOfBirth")} />
      <Select label="Sexo" error={errors.sex?.message} {...register("sex")}><option value="female">Mujer</option><option value="male">Hombre</option></Select>
      <Input label="Estatura (cm)" type="number" step="0.1" error={errors.heightCm?.message} {...register("heightCm", { valueAsNumber: true })} />
      <Input label="Objetivo principal" error={errors.objective?.message} {...register("objective")} />
      <Select label="Estado" error={errors.status?.message} {...register("status")}><option value="active">Activo</option><option value="inactive">Inactivo</option></Select>
      <Input label="Próxima consulta" type="datetime-local" error={errors.nextConsultation?.message} {...register("nextConsultation")} />
      <div className="sm:col-span-2"><Button type="submit" disabled={isSubmitting}><Save className="size-4" /> {isSubmitting ? "Guardando..." : patientId ? "Guardar cambios" : "Crear paciente"}</Button></div>
    </form>
  );
}
