import { z } from "zod";

const optionalCentimeters = z.number().positive().max(250).optional();

export const measurementSchema = z.object({
  patientId: z.string().min(1, "Selecciona un paciente"),
  date: z.string().min(1, "Selecciona una fecha"),
  measurementMode: z.enum(["office", "remote"]),
  weightKg: z.number().positive("El peso debe ser mayor que cero").max(400),
  heightCm: z.number().positive("La estatura debe ser mayor que cero").max(250),
  waistCm: optionalCentimeters,
  abdomenCm: optionalCentimeters,
  armCm: optionalCentimeters,
  hipCm: optionalCentimeters,
  bodyFatPercentage: z.number().min(1).max(80).optional(),
  muscleMassPercentage: z.number().min(1).max(80).optional(),
  metabolicAge: z.number().int().min(18).max(120).optional(),
  additionalMeasurements: z.array(z.object({
    name: z.string().trim().min(1, "Escribe el nombre de la medida"),
    value: z.number().positive("El valor debe ser mayor que cero"),
    unit: z.enum(["cm", "kg", "%", "mm"]),
  })).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
}).superRefine((data, context) => {
  const required = data.measurementMode === "office"
    ? (["bodyFatPercentage", "muscleMassPercentage", "metabolicAge"] as const)
    : (["waistCm", "abdomenCm", "armCm", "hipCm"] as const);
  required.forEach((field) => {
    if (data[field] === undefined) context.addIssue({ code: "custom", path: [field], message: "Este dato es obligatorio para esta modalidad" });
  });
});

export type MeasurementFormValues = z.infer<typeof measurementSchema>;
