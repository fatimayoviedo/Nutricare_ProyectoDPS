"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Activity, Plus, Ruler, Scale, ScanLine, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { measurementSchema, type MeasurementFormValues } from "@/schemas/measurementSchema";
import { measurementService } from "@/services/measurementService";
import { patientService } from "@/services/patientService";
import type { Measurement, Patient } from "@/types";
import { calculateAge } from "@/utils/calculateAge";
import { getErrorMessage } from "@/utils/errorHandler";

const numberOrUndefined = (value: string) => value === "" ? undefined : Number(value);

export function MeasurementManager() {
  const { user } = useAuth();
  const isNutritionist = user?.role === "nutritionist";
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    if (typeof window === "undefined") return "all";
    try { return JSON.parse(window.localStorage.getItem("nutricare_session") ?? "null")?.role === "patient" ? "gerardo-pena" : "all"; }
    catch { return "all"; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState<string | null>(null);
  const { register, handleSubmit, reset, control, setValue, formState: { errors, isSubmitting } } = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      patientId: "gerardo-pena", date: new Date().toISOString().slice(0, 10), measurementMode: "office",
      weightKg: 68.4, heightCm: 168, bodyFatPercentage: 23.8, muscleMassPercentage: 37.2, metabolicAge: 30,
      additionalMeasurements: [],
    },
  });
  const { fields: additionalFields, append: appendAdditionalMeasurement, remove: removeAdditionalMeasurement } = useFieldArray({ control, name: "additionalMeasurements" });
  const formPatientId = useWatch({ control, name: "patientId" });
  const measurementMode = useWatch({ control, name: "measurementMode" });
  const formPatient = patients.find((patient) => patient.id === formPatientId);

  useEffect(() => {
    Promise.all([measurementService.list(), patientService.list()])
      .then(([measurementData, patientData]) => { setMeasurements(measurementData); setPatients(patientData); })
      .catch((cause: unknown) => setError(getErrorMessage(cause)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (formPatient) setValue("heightCm", formPatient.heightCm);
  }, [formPatient, setValue]);

  useEffect(() => {
    if (measurementMode === "office") {
      setValue("waistCm", undefined);
      setValue("abdomenCm", undefined);
      setValue("armCm", undefined);
      setValue("hipCm", undefined);
    } else {
      setValue("bodyFatPercentage", undefined);
      setValue("muscleMassPercentage", undefined);
      setValue("metabolicAge", undefined);
    }
  }, [measurementMode, setValue]);

  const effectivePatientId = isNutritionist ? selectedPatientId : "gerardo-pena";
  const filteredMeasurements = useMemo(() => effectivePatientId === "all" ? measurements : measurements.filter((item) => item.patientId === effectivePatientId), [effectivePatientId, measurements]);
  const latest = useMemo(() => filteredMeasurements.toSorted((a, b) => b.date.localeCompare(a.date))[0], [filteredMeasurements]);
  const patientsWithMeasurements = new Set(measurements.map((item) => item.patientId)).size;
  const averageWeight = filteredMeasurements.length ? (filteredMeasurements.reduce((total, item) => total + item.weightKg, 0) / filteredMeasurements.length).toFixed(1) : "-";
  const averageBmi = filteredMeasurements.length ? (filteredMeasurements.reduce((total, item) => total + item.bmi, 0) / filteredMeasurements.length).toFixed(1) : "-";

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const created = await measurementService.create(values);
      setMeasurements((current) => [created, ...current]);
      reset({ patientId: values.patientId, date: new Date().toISOString().slice(0, 10), measurementMode: values.measurementMode, weightKg: created.weightKg, heightCm: created.heightCm, additionalMeasurements: [] });
      setShowForm(false);
    } catch (cause) { setError(getErrorMessage(cause)); }
  });

  async function remove() {
    if (!measurementToDelete) return;
    try { await measurementService.remove(measurementToDelete); setMeasurements((current) => current.filter((item) => item.id !== measurementToDelete)); setMeasurementToDelete(null); }
    catch (cause) { setError(getErrorMessage(cause)); }
  }

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner label="Cargando mediciones" /></div>;

  return (
    <>
      <PageHeader title="Mediciones" description={isNutritionist ? "Consulta el panorama global o filtra el historial antropométrico de cada paciente." : "Consulta tus datos antropométricos y la evolución de tus registros."} action={isNutritionist ? <Button type="button" onClick={() => setShowForm((current) => !current)}><Plus className="size-4" /> Nueva medición</Button> : undefined} />
      {error ? <div className="mb-5"><Alert tone="error">{error}</Alert></div> : null}
      {isNutritionist ? <Card className="mb-6 grid gap-4 lg:grid-cols-[1fr_22rem] lg:items-end"><div><p className="text-sm font-bold text-[var(--primary)]">Seguimiento antropométrico</p><h2 className="mt-1 text-xl font-bold">Mediciones de pacientes</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Selecciona un paciente para revisar únicamente su historial y sus indicadores.</p></div><Select label="Filtrar por paciente" value={effectivePatientId} onChange={(event) => setSelectedPatientId(event.target.value)}><option value="all">Todos los pacientes</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</Select></Card> : null}

      {showForm ? <Card className="mb-6">
        <h2 className="text-xl font-bold">Registrar medición</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">Elige la modalidad para solicitar únicamente los datos disponibles en cada consulta.</p>
        <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" noValidate>
          <Select label="Paciente" error={errors.patientId?.message} {...register("patientId")}><option value="">Selecciona un paciente</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</Select>
          <Input label="Fecha" type="date" error={errors.date?.message} {...register("date")} />
          <Select label="Modalidad de medición" error={errors.measurementMode?.message} {...register("measurementMode")}><option value="office">Consultorio · báscula especializada</option><option value="remote">En línea · medidas tomadas por el paciente</option></Select>
          {formPatient ? <div className="grid gap-2 rounded-2xl bg-[var(--surface-muted)] p-4 text-sm sm:col-span-2 sm:grid-cols-3 xl:col-span-3"><p><span className="text-[var(--ink-muted)]">Edad calculada</span><br /><strong>{calculateAge(formPatient.dateOfBirth)} años</strong></p><p><span className="text-[var(--ink-muted)]">Sexo</span><br /><strong>{formPatient.sex === "female" ? "Mujer" : "Hombre"}</strong></p><p><span className="text-[var(--ink-muted)]">Estatura</span><br /><strong>{formPatient.heightCm} cm</strong></p></div> : null}
          <input type="hidden" {...register("heightCm", { valueAsNumber: true })} />
          <Input label="Peso (kg)" type="number" step="0.1" error={errors.weightKg?.message} {...register("weightKg", { valueAsNumber: true })} />
          {measurementMode === "office" ? <>
            <Input key="office-fat" label="Grasa corporal (%)" type="number" step="0.1" error={errors.bodyFatPercentage?.message} {...register("bodyFatPercentage", { setValueAs: numberOrUndefined })} />
            <Input key="office-muscle" label="Masa muscular (%)" type="number" step="0.1" error={errors.muscleMassPercentage?.message} {...register("muscleMassPercentage", { setValueAs: numberOrUndefined })} />
            <Input key="office-age" label="Edad metabólica" type="number" error={errors.metabolicAge?.message} {...register("metabolicAge", { setValueAs: numberOrUndefined })} />
            <p className="text-sm leading-6 text-[var(--ink-muted)] sm:col-span-2 xl:col-span-3">Estos indicadores se registran con la báscula especializada del consultorio.</p>
          </> : <>
            <Input key="remote-waist" label="Cintura (cm)" type="number" step="0.1" error={errors.waistCm?.message} {...register("waistCm", { setValueAs: numberOrUndefined })} />
            <Input key="remote-abdomen" label="Abdomen (cm)" type="number" step="0.1" error={errors.abdomenCm?.message} {...register("abdomenCm", { setValueAs: numberOrUndefined })} />
            <Input key="remote-arm" label="Brazo (cm)" type="number" step="0.1" error={errors.armCm?.message} {...register("armCm", { setValueAs: numberOrUndefined })} />
            <Input key="remote-hip" label="Cadera (cm)" type="number" step="0.1" error={errors.hipCm?.message} {...register("hipCm", { setValueAs: numberOrUndefined })} />
            <p className="text-sm leading-6 text-[var(--ink-muted)] sm:col-span-2 xl:col-span-3">Para consultas en línea o pacientes en el extranjero: mide con cinta métrica sin comprimir la piel.</p>
          </>}
          <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:col-span-2 xl:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-bold">Medidas adicionales</p><p className="mt-1 text-sm text-[var(--ink-muted)]">Agrega una o más medidas opcionales disponibles para esta consulta.</p></div>
              <Button type="button" variant="secondary" onClick={() => appendAdditionalMeasurement({ name: "", value: 0, unit: "cm" })}><Plus className="size-4" /> Agregar medida</Button>
            </div>
            {additionalFields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-xl bg-white p-3 sm:grid-cols-[1fr_0.7fr_0.55fr_auto] sm:items-end">
              <Input label="Nombre de la medida" placeholder="Ej. Pantorrilla" error={errors.additionalMeasurements?.[index]?.name?.message} {...register(`additionalMeasurements.${index}.name`)} />
              <Input label="Valor" type="number" step="0.1" error={errors.additionalMeasurements?.[index]?.value?.message} {...register(`additionalMeasurements.${index}.value`, { valueAsNumber: true })} />
              <Select label="Unidad" error={errors.additionalMeasurements?.[index]?.unit?.message} {...register(`additionalMeasurements.${index}.unit`)}><option value="cm">cm</option><option value="kg">kg</option><option value="%">%</option><option value="mm">mm</option></Select>
              <button type="button" onClick={() => removeAdditionalMeasurement(index)} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-red-200 px-4 text-red-600 transition hover:bg-red-50" aria-label={`Eliminar medida adicional ${index + 1}`}><Trash2 className="size-4" /></button>
            </div>)}
          </div>
          <div className="sm:col-span-2 xl:col-span-3"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Procesando..." : "Guardar y calcular IMC"}</Button></div>
        </form>
      </Card> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{effectivePatientId === "all" ? <><StatCard label="Pacientes con registros" value={String(patientsWithMeasurements)} detail="Cobertura global" icon={Activity} /><StatCard label="Registros totales" value={String(filteredMeasurements.length)} detail="Historial consolidado" icon={Ruler} /><StatCard label="Peso promedio" value={`${averageWeight} kg`} detail="Todos los registros" icon={Scale} /><StatCard label="IMC promedio" value={averageBmi} detail="Panorama general" icon={ScanLine} /></> : <><StatCard label="Peso" value={latest ? `${latest.weightKg} kg` : "-"} detail="Último registro" icon={Scale} /><StatCard label="Estatura" value={latest ? `${latest.heightCm} cm` : "-"} detail="Dato del perfil" icon={Ruler} /><StatCard label="IMC" value={latest ? String(latest.bmi) : "-"} detail={latest && latest.bmi < 25 ? "Rango saludable" : "Requiere seguimiento"} icon={Activity} /><StatCard label="Cintura" value={latest?.waistCm ? `${latest.waistCm} cm` : "-"} detail="Última medición manual" icon={ScanLine} /></>}</div>

      <Card className="mt-6"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold">Historial dinámico</h2><span className="rounded-full bg-[var(--soft-green)] px-3 py-1 text-xs font-bold text-[var(--primary)]">{filteredMeasurements.length} registros</span></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-[var(--ink-muted)]"><tr><th className="pb-3 font-semibold">Fecha</th><th className="pb-3 font-semibold">Paciente</th><th className="pb-3 font-semibold">Modalidad</th><th className="pb-3 font-semibold">Peso</th><th className="pb-3 font-semibold">IMC</th><th className="pb-3 font-semibold">Indicadores</th><th /></tr></thead><tbody>{filteredMeasurements.map((row) => <tr key={row.id} className="border-t border-[var(--border)]"><td className="py-4 font-bold">{new Date(`${row.date}T12:00:00`).toLocaleDateString("es-SV")}</td><td>{patients.find((patient) => patient.id === row.patientId)?.name ?? row.patientId}</td><td><span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold">{row.measurementMode === "office" ? "Consultorio" : "Remota"}</span></td><td>{row.weightKg} kg</td><td>{row.bmi}</td><td className="max-w-sm text-xs leading-5 text-[var(--ink-muted)]">{row.measurementMode === "office" ? `Grasa ${row.bodyFatPercentage ?? "-"}% · Músculo ${row.muscleMassPercentage ?? "-"}% · Edad metabólica ${row.metabolicAge ?? "-"}` : `Cintura ${row.waistCm ?? "-"} · Abdomen ${row.abdomenCm ?? "-"} · Brazo ${row.armCm ?? "-"} · Cadera ${row.hipCm ?? "-"} cm`}{row.additionalMeasurements?.length ? ` · Adicionales: ${row.additionalMeasurements.map((item) => `${item.name} ${item.value} ${item.unit}`).join(" · ")}` : ""}</td><td>{isNutritionist ? <button type="button" onClick={() => setMeasurementToDelete(row.id)} className="rounded-lg p-2 text-red-500" aria-label="Eliminar medición"><Trash2 className="size-4" /></button> : null}</td></tr>)}</tbody></table></div></Card>
      <ConfirmDialog open={Boolean(measurementToDelete)} title="Eliminar medición" description="El registro y sus indicadores se eliminarán del historial. Esta acción no se puede deshacer." confirmLabel="Sí, eliminar" tone="danger" onCancel={() => setMeasurementToDelete(null)} onConfirm={() => void remove()} />
    </>
  );
}
