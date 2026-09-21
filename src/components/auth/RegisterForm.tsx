"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/schemas/authSchema";
import { getErrorMessage } from "@/utils/errorHandler";

export function RegisterForm() {
  const router = useRouter();
  const { register: createAccount } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "patient" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await createAccount({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  });

  return (
    <div>
      <p className="text-sm font-bold text-[var(--primary)]">Comienza tu experiencia</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em]">Crear cuenta</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">Selecciona el perfil que usarás dentro de NutriCare.</p>
      <form onSubmit={onSubmit} className="mt-7 grid gap-4" noValidate>
        {submitError ? <Alert tone="error">{submitError}</Alert> : null}
        <Input label="Nombre completo" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Input label="Correo electrónico" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Select label="Tipo de cuenta" error={errors.role?.message} {...register("role")}>
          <option value="patient">Paciente</option>
          <option value="nutritionist">Nutricionista</option>
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Contraseña" type="password" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          <Input label="Confirmar" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        </div>
        <Button type="submit" fullWidth disabled={isSubmitting}>{isSubmitting ? "Creando cuenta..." : "Crear cuenta"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">¿Ya tienes cuenta? <Link className="font-bold text-[var(--primary)]" href="/login">Inicia sesión</Link></p>
    </div>
  );
}
