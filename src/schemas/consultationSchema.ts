import { z } from "zod";

export const consultationSchema = z.object({
  patientId: z.string().min(1, "Selecciona un paciente"),
  date: z.string().min(1, "Selecciona fecha y hora"),
  notes: z.string().max(2000),
  type: z.string().min(3, "Describe el tipo de consulta"),
  mode: z.enum(["Videollamada", "Presencial"]),
  status: z.enum(["scheduled", "completed", "cancelled"]),
});

export type ConsultationFormValues = z.input<typeof consultationSchema>;
