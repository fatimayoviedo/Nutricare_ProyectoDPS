import { z } from "zod";
import { calculateAge } from "@/utils/calculateAge";

export const patientSchema = z.object({
  name: z.string().min(3, "El nombre es obligatorio"),
  email: z.string().email("Ingresa un correo válido"),
  dateOfBirth: z.string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine((value) => calculateAge(value) >= 18, "El paciente debe ser mayor de edad")
    .refine((value) => calculateAge(value) <= 120, "Revisa la fecha de nacimiento"),
  sex: z.enum(["female", "male"]),
  heightCm: z.number().min(120, "Revisa la estatura").max(230, "Revisa la estatura"),
  objective: z.string().min(3, "Describe el objetivo"),
  status: z.enum(["active", "inactive"]),
  nextConsultation: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
