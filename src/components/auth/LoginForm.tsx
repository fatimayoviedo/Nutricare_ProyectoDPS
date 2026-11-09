"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/schemas/authSchema";
import { getErrorMessage } from "@/utils/errorHandler";

export function LoginForm() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await login(values.email, values.password);
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  const onGoogle = async () => {
    setSubmitError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-bold text-[var(--primary)]">Bienvenida de nuevo</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Inicia sesión</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Accede a tus consultas, planes y seguimiento nutricional.</p>
      <form method="post" onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
        {submitError ? <Alert tone="error">{submitError}</Alert> : null}
        <Input label="Correo electrónico" type="email" autoComplete="email" placeholder="nombre@correo.com" error={errors.email?.message} {...register("email")} />
        <div>
          <Input label="Contraseña" type="password" autoComplete="current-password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
          <div className="mt-2 text-right"><Link href="/recuperar-acceso" className="text-xs font-semibold text-[var(--primary)]">¿Olvidaste tu contraseña?</Link></div>
        </div>
        <Button type="submit" fullWidth disabled={isSubmitting}>{isSubmitting ? "Ingresando..." : "Ingresar"}</Button>
      </form>
      <div className="mt-4"><Button type="button" variant="secondary" fullWidth disabled={googleLoading || isSubmitting} onClick={() => void onGoogle()}>{googleLoading ? "Conectando con Google..." : "Continuar con Google"}</Button></div>
      <p className="mt-7 text-center text-sm text-[var(--ink-muted)]">¿Aún no tienes cuenta? <Link className="font-bold text-[var(--primary)]" href="/registro">Crear cuenta</Link></p>
    </div>
  );
}
