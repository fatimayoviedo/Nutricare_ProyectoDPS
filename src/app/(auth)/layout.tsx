import type { ReactNode } from "react";
import { Brand } from "@/components/layout/Brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-grid grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden flex-col justify-between p-12 lg:flex">
        <Brand />
        <div className="max-w-xl">
          <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-[var(--primary-dark)]">Nutrición balanceada</span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] tracking-[-0.05em]">Convierte cada hábito en un avance visible.</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[var(--ink-muted)]">Planes, consultas y progreso en un mismo lugar que conecta con pacientes y nutricionistas.</p>
        </div>
        <p className="text-sm text-[var(--ink-muted)]">© 2026 NutriCare</p>
      </section>
      <section className="grid min-h-screen place-items-center p-4 sm:p-8">
        <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_25px_80px_rgba(22,74,61,0.14)] sm:p-10">
          <div className="mb-8 lg:hidden"><Brand /></div>
          {children}
        </div>
      </section>
    </main>
  );
}
