import { z } from "zod";

export const planSchema = z.object({
  patientId: z.string().min(1, "Selecciona un paciente"),
  planMonth: z.string().regex(/^\d{4}-\d{2}$/, "Selecciona el mes del plan"),
  title: z.string().min(3, "El título es obligatorio"),
  objective: z.string().min(3, "Describe el objetivo"),
  active: z.boolean(),
  meals: z.array(z.object({
    id: z.string(),
    time: z.string().min(1),
    title: z.string().min(2),
    description: z.string().min(3),
    portion: z.string().min(2, "Indica la porción"),
    comments: z.string().optional(),
    calories: z.number().positive().optional(),
  })).min(1, "Agrega al menos una comida"),
  clinicalGuidance: z.object({
    clinicalNotes: z.array(z.string().min(2)),
    recommendations: z.array(z.string().min(2)),
    supplements: z.array(z.string().min(2)),
    medicalExams: z.array(z.string().min(2)),
    exerciseRecommendations: z.array(z.string().min(2)).optional(),
  }).optional(),
  attachment: z.object({
    name: z.string().min(1),
    mimeType: z.string().min(1),
    sizeBytes: z.number().positive().max(5 * 1024 * 1024),
    dataUrl: z.string().min(1),
  }).optional(),
});

export type PlanFormValues = z.infer<typeof planSchema>;
