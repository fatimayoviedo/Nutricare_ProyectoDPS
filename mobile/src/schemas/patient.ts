import { z } from 'zod';

function isAdult(birthDate: string) {
  const date = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const beforeBirthday = today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 18;
}

export const patientSchema = z.object({
  name: z.string().trim().min(3, 'Escribe el nombre completo.'),
  email: z.string().trim().email('Ingresa un correo electrónico válido.'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD.').refine(isAdult, 'El paciente debe ser mayor de edad.'),
  heightCm: z.string().trim().min(1, 'Ingresa la estatura.').transform((value) => Number(value.replace(',', '.'))).pipe(z.number().min(120, 'Revisa la estatura ingresada.').max(230, 'Revisa la estatura ingresada.')),
  sex: z.enum(['female', 'male', 'other']),
  goal: z.string().trim().min(5, 'Describe brevemente el objetivo nutricional.'),
});

export type PatientInputValues = z.input<typeof patientSchema>;
export type PatientValues = z.output<typeof patientSchema>;
