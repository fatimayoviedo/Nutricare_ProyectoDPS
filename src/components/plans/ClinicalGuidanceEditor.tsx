"use client";

import { useState, type FormEvent } from "react";
import { Save, Stethoscope } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { planService } from "@/services/planService";
import type { NutritionPlan } from "@/types";
import { getErrorMessage } from "@/utils/errorHandler";

const fieldClass = "min-h-28 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal leading-6 outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-ring)]";

function linesToList(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function ClinicalGuidanceEditor({ plan, onSaved }: { plan: NutritionPlan; onSaved: (plan: NutritionPlan) => void }) {
  const [clinicalNotes, setClinicalNotes] = useState((plan.clinicalGuidance?.clinicalNotes ?? []).join("\n"));
  const [recommendations, setRecommendations] = useState((plan.clinicalGuidance?.recommendations ?? []).join("\n"));
  const [supplements, setSupplements] = useState((plan.clinicalGuidance?.supplements ?? []).join("\n"));
  const [medicalExams, setMedicalExams] = useState((plan.clinicalGuidance?.medicalExams ?? []).join("\n"));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await planService.update(plan.id, {
        patientId: plan.patientId,
        planMonth: plan.planMonth,
        title: plan.title,
        objective: plan.objective,
        meals: plan.meals,
        active: plan.active,
        clinicalGuidance: {
          clinicalNotes: linesToList(clinicalNotes),
          recommendations: linesToList(recommendations),
          supplements: linesToList(supplements),
          medicalExams: linesToList(medicalExams),
          exerciseRecommendations: plan.clinicalGuidance?.exerciseRecommendations ?? [],
        },
        attachment: plan.attachment,
      });
      onSaved(updated);
      setMessage("Las indicaciones clínicas quedaron vinculadas al plan.");
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { setSaving(false); }
  }

  return (
    <Card>
      <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><Stethoscope /></span><div><h2 className="text-xl font-bold">Indicaciones clínicas del plan</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Escribe una indicación por línea. El paciente podrá consultarlas, pero no modificarlas.</p></div></div>
      {message ? <div className="mt-4"><Alert>{message}</Alert></div> : null}
      {error ? <div className="mt-4"><Alert tone="error">{error}</Alert></div> : null}
      <form onSubmit={save} className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">Notas clínicas<textarea rows={4} value={clinicalNotes} onChange={(event) => setClinicalNotes(event.target.value)} placeholder="Ej. Dar seguimiento mensual al peso" className={fieldClass} /></label>
        <label className="grid gap-2 text-sm font-bold">Sugerencias y recomendaciones<textarea rows={4} value={recommendations} onChange={(event) => setRecommendations(event.target.value)} placeholder="Ej. Priorizar vegetales y horarios regulares" className={fieldClass} /></label>
        <label className="grid gap-2 text-sm font-bold">Vitaminas o suplementos<textarea rows={4} value={supplements} onChange={(event) => setSupplements(event.target.value)} placeholder="Ej. Vitamina D según resultados de laboratorio" className={fieldClass} /></label>
        <label className="grid gap-2 text-sm font-bold">Exámenes médicos sugeridos<textarea rows={4} value={medicalExams} onChange={(event) => setMedicalExams(event.target.value)} placeholder="Ej. Perfil lipídico coordinado con su médico" className={fieldClass} /></label>
        <div className="lg:col-span-2"><Button type="submit" disabled={saving}><Save className="size-4" /> {saving ? "Guardando..." : "Guardar indicaciones"}</Button></div>
      </form>
    </Card>
  );
}
