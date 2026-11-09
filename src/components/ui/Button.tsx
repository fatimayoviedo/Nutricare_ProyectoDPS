"use client";
import type { ButtonHTMLAttributes } from "react";
import { useHydrated } from '@/hooks/useHydrated';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const hydrated = useHydrated();
  const variants = {
    primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]",
    secondary: "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--soft-green)]",
    ghost: "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)]",
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-center text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
      disabled={!hydrated || props.disabled}
    />
  );
}

