"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/utils/errorHandler";

const schema = z.object({ email: z.string().email("Ingresa un correo válido") });
type Values = z.infer<typeof schema>;

export function PasswordResetForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });
  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null);
    try { await authService.resetPassword(email); setMessage("Si el correo está registrado, recibirás instrucciones para restablecer tu acceso."); }
    catch (cause) { setError(getErrorMessage(cause)); }
  });
  return <div><p className="text-sm font-bold text-[var(--primary)]">Recuperar acceso</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Restablece tu contraseña</h1><p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Ingresa el correo asociado a tu cuenta.</p><form onSubmit={onSubmit} className="mt-7 grid gap-5" noValidate>{message ? <Alert>{message}</Alert> : null}{error ? <Alert tone="error">{error}</Alert> : null}<Input label="Correo electrónico" type="email" error={errors.email?.message} {...register("email")} /><Button type="submit" fullWidth disabled={isSubmitting}>{isSubmitting ? "Enviando..." : "Enviar instrucciones"}</Button></form><p className="mt-6 text-center text-sm"><Link href="/login" className="font-bold text-[var(--primary)]">Volver al inicio de sesión</Link></p></div>;
}
