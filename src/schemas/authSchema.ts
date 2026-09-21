import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, "Ingresa tu nombre completo"),
    email: z.string().email("Ingresa un correo válido"),
    password: z.string().min(8, "Usa al menos 8 caracteres"),
    confirmPassword: z.string(),
    role: z.enum(["nutritionist", "patient"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

