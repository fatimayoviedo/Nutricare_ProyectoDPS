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

export const loginSchema = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(3, 'Escribe tu nombre completo.'),
  email: z.string().trim().email('Ingresa un correo electrónico válido.'),
  role: z.enum(['patient', 'nutritionist']),
  password: z.string().min(8, 'Usa al menos 8 caracteres.'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((accepted) => accepted, { message: 'Debes aceptar el tratamiento de datos.' }),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Las contraseñas no coinciden.', path: ['confirmPassword'],
});

export const recoverySchema = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido.'),
});

export const profileSchema = z.object({
  name: z.string().trim().min(3, 'Escribe tu nombre completo.'),
  birthDate: z.string().optional()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), 'Usa el formato AAAA-MM-DD.')
    .refine((value) => !value || isAdult(value), 'El perfil debe corresponder a una persona mayor de edad.'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type RecoveryValues = z.infer<typeof recoverySchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
