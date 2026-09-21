"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { ClipboardPlus, FileUp, Plus, Stethoscope, Trash2, Utensils } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { planSchema, type PlanFormValues } from "@/schemas/planSchema";
import { patientService } from "@/services/patientService";
import { planService } from "@/services/planService";
import type { NutritionPlan, Patient } from "@/types";
import { getErrorMessage } from "@/utils/errorHandler";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const fieldClass = "min-h-28 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal leading-6 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-ring)]";
const monthFormatter = new Intl.DateTimeFormat("es-SV", { month: "long", year: "numeric" });

const planMonths = Array.from({ length: 12 }, (_, index) => {
  const date = new Date(2026, 8 + index, 1, 12);
  return { value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, label: monthFormatter.format(date).replace(/^./, (letter) => letter.toUpperCase()) };
});

const exampleMeals = [
  { id: "meal-breakfast", time: "07:00", title: "Desayuno", description: "Avena con yogur natural y fruta", portion: "⅓ taza de avena, ½ taza de yogur y ½ taza de fruta", comments: "", calories: 380 },
  { id: "meal-snack-am", time: "10:30", title: "Merienda", description: "Fruta con semillas o frutos secos", portion: "1 porción de fruta y 6 almendras", comments: "", calories: 180 },
  { id: "meal-lunch", time: "13:00", title: "Almuerzo", description: "Proteína magra, cereal integral y vegetales", portion: "5 oz de proteína, ⅓ taza de cereal y 1½ taza de vegetales", comments: "", calories: 560 },
  { id: "meal-snack-pm", time: "16:30", title: "Merienda", description: "Yogur o batido de fruta", portion: "1 yogur o 1 vaso de batido", comments: "", calories: 220 },
  { id: "meal-dinner", time: "19:30", title: "Cena", description: "Vegetales, proteína ligera y tostada integral", portion: "1½ taza de vegetales, 4 oz de proteína y 1 tostada", comments: "", calories: 410 },
];

function linesToList(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer el archivo seleccionado."));
    reader.readAsDataURL(file);
  });
}

export function PlanForm() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [supplements, setSupplements] = useState("");
  const [medicalExams, setMedicalExams] = useState("");
  const [exerciseRecommendations, setExerciseRecommendations] = useState("");
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: { patientId: "", planMonth: "", title: "Plan equilibrado · 1,750 kcal", objective: "Mejorar hábitos de forma sostenible", active: true, meals: exampleMeals },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "meals" });
  const selectedPatientId = useWatch({ control, name: "patientId" });
  const availableMonths = planMonths.filter((month) => !plans.some((plan) => plan.patientId === selectedPatientId && plan.planMonth === month.value));

  useEffect(() => {
    if (user?.role !== "nutritionist") return;
    Promise.all([patientService.list(), planService.list()]).then(([patientData, planData]) => { setPatients(patientData); setPlans(planData); }).catch((cause: unknown) => setError(getErrorMessage(cause)));
  }, [user?.role]);

  useEffect(() => {
    setValue("planMonth", "");
  }, [selectedPatientId, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const attachment = selectedFile ? { name: selectedFile.name, mimeType: selectedFile.type || "application/octet-stream", sizeBytes: selectedFile.size, dataUrl: await readFileAsDataUrl(selectedFile) } : undefined;
      await planService.create({
        ...values,
        clinicalGuidance: {
          clinicalNotes: linesToList(clinicalNotes), recommendations: linesToList(recommendations), supplements: linesToList(supplements), medicalExams: linesToList(medicalExams), exerciseRecommendations: linesToList(exerciseRecommendations),
        },
        attachment,
      });
      router.push("/planes");
      router.refresh();
    } catch (cause) { setError(getErrorMessage(cause)); }
  });

  function selectFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "doc", "docx"].includes(extension)) { setError("El archivo del plan debe ser PDF, DOC o DOCX."); return; }
    if (file.size > MAX_FILE_SIZE) { setError("El archivo del plan no puede superar 5 MB."); return; }
    setSelectedFile(file);
  }

  if (loading) return <p className="py-8 text-center text-sm text-[var(--ink-muted)]">Cargando formulario...</p>;
  if (user?.role !== "nutritionist") return <Alert tone="error">Solo la nutricionista puede crear y asignar planes.</Alert>;

  return (
    <form onSubmit={onSubmit} className="grid gap-8" noValidate>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <section className="grid gap-5">
        <div><h2 className="text-lg font-bold">Datos generales</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Asigna el plan y define su objetivo principal.</p></div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Select label="Paciente" error={errors.patientId?.message} {...register("patientId")}><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</Select>
          <Select label="Mes asignado" error={errors.planMonth?.message} disabled={!selectedPatientId} {...register("planMonth")}><option value="">{selectedPatientId ? "Selecciona un mes disponible" : "Primero selecciona un paciente"}</option>{availableMonths.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}</Select>
        </div>
        {selectedPatientId && availableMonths.length === 0 ? <Alert tone="error">Este paciente ya tiene asignados todos los meses disponibles.</Alert> : null}
        <div className="grid gap-5 lg:grid-cols-2"><Input label="Nombre del plan" error={errors.title?.message} {...register("title")} /><Input label="Objetivo" error={errors.objective?.message} {...register("objective")} /></div>
      </section>

      <section className="grid gap-4 border-t border-[var(--border)] pt-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-bold"><Utensils className="size-5 text-[var(--primary)]" /> Menú del plan</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Edita los tiempos existentes o agrega todas las comidas que necesites.</p></div><Button type="button" variant="secondary" onClick={() => append({ id: crypto.randomUUID(), time: "", title: "", description: "", portion: "", comments: "", calories: undefined })}><Plus className="size-4" /> Agregar comida</Button></div>
        <div className="grid gap-4">
          {fields.map((field, index) => <div key={field.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <input type="hidden" {...register(`meals.${index}.id`)} />
            <div className="mb-4 flex items-center justify-between gap-3"><p className="font-bold">Comida {index + 1}</p><Button type="button" variant="ghost" className="min-h-9 px-3 text-red-600" disabled={fields.length === 1} onClick={() => remove(index)} aria-label={`Eliminar comida ${index + 1}`}><Trash2 className="size-4" /> Eliminar</Button></div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[0.65fr_1fr_1.5fr_1.5fr_0.7fr]">
              <Input type="time" label="Hora" error={errors.meals?.[index]?.time?.message} {...register(`meals.${index}.time`)} />
              <Input label="Tiempo de comida" placeholder="Ej. Almuerzo" error={errors.meals?.[index]?.title?.message} {...register(`meals.${index}.title`)} />
              <Input label="Preparación" placeholder="Ej. Pollo con arroz y ensalada" error={errors.meals?.[index]?.description?.message} {...register(`meals.${index}.description`)} />
              <Input label="Porción" placeholder="Ej. 5 oz, ⅓ taza y 1 taza" error={errors.meals?.[index]?.portion?.message} {...register(`meals.${index}.portion`)} />
              <Input type="number" min="1" label="Calorías" error={errors.meals?.[index]?.calories?.message} {...register(`meals.${index}.calories`, { setValueAs: (value) => value === "" ? undefined : Number(value) })} />
              <div className="md:col-span-2 xl:col-span-5"><Input label="Comentario (opcional)" placeholder="Ej. Puede sustituir el arroz por papa cocida" error={errors.meals?.[index]?.comments?.message} {...register(`meals.${index}.comments`)} /></div>
            </div>
          </div>)}
        </div>
      </section>

      <section className="grid gap-4 border-t border-[var(--border)] pt-7">
        <div><h2 className="flex items-center gap-2 text-lg font-bold"><FileUp className="size-5 text-[var(--primary)]" /> Archivo del plan</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Opcional: adjunta el documento completo que recibirá el paciente.</p></div>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-5 py-7 text-center transition hover:border-[var(--primary)]"><FileUp className="size-8 text-[var(--primary)]" /><span className="mt-2 font-bold">Seleccionar PDF, DOC o DOCX</span><span className="mt-1 text-xs text-[var(--ink-muted)]">Tamaño máximo: 5 MB</span><input type="file" className="sr-only" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => selectFile(event.target.files?.[0])} /></label>
        {selectedFile ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[var(--soft-green)] px-4 py-3"><div><p className="text-sm font-bold">{selectedFile.name}</p><p className="text-xs text-[var(--ink-muted)]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p></div><Button type="button" variant="ghost" onClick={() => setSelectedFile(null)}><Trash2 className="size-4" /> Quitar archivo</Button></div> : null}
      </section>

      <section className="grid gap-4 border-t border-[var(--border)] pt-7">
        <div><h2 className="flex items-center gap-2 text-lg font-bold"><Stethoscope className="size-5 text-[var(--primary)]" /> Indicaciones iniciales</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Escribe una indicación por línea. Después podrás actualizarlas desde el plan.</p></div>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">Notas clínicas<textarea rows={4} value={clinicalNotes} onChange={(event) => setClinicalNotes(event.target.value)} placeholder="Ej. Mantener seguimiento mensual del peso" className={fieldClass} /></label>
          <label className="grid gap-2 text-sm font-bold">Sugerencias y recomendaciones<textarea rows={4} value={recommendations} onChange={(event) => setRecommendations(event.target.value)} placeholder="Ej. Priorizar vegetales y horarios regulares" className={fieldClass} /></label>
          <label className="grid gap-2 text-sm font-bold">Vitaminas o suplementos<textarea rows={4} value={supplements} onChange={(event) => setSupplements(event.target.value)} placeholder="Ej. Vitamina D según resultados de laboratorio" className={fieldClass} /></label>
          <label className="grid gap-2 text-sm font-bold">Exámenes médicos sugeridos<textarea rows={4} value={medicalExams} onChange={(event) => setMedicalExams(event.target.value)} placeholder="Ej. Perfil lipídico coordinado con su médico" className={fieldClass} /></label>
          <label className="grid gap-2 text-sm font-bold lg:col-span-2">Ejercicio sugerido<textarea rows={4} value={exerciseRecommendations} onChange={(event) => setExerciseRecommendations(event.target.value)} placeholder="Ej. Caminata moderada 30 minutos, 4 veces por semana" className={fieldClass} /></label>
        </div>
      </section>

      <Button type="submit" disabled={isSubmitting} fullWidth><ClipboardPlus className="size-4" /> {isSubmitting ? "Creando..." : "Crear y asignar plan"}</Button>
    </form>
  );
}
