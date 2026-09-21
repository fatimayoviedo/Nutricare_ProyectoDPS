import Link from "next/link";
import { CalendarCheck, ChartNoAxesCombined, ClipboardCheck } from "lucide-react";
import { Brand } from "@/components/layout/Brand";

const features = [
  { icon: ClipboardCheck, title: "Tu plan más amigable que nunca", copy: "Consulta tus comidas, indicaciones y objetivos de forma simple y ordenada." },
  { icon: CalendarCheck, title: "Todo en un solo lugar", copy: "Accede fácilmente a consultas, notas y próximos controles dentro de una misma plataforma." },
  { icon: ChartNoAxesCombined, title: "Evolución a la vista", copy: "Observa tus avances, registra cambios, fotografías y recibe asesoramiento personalizado de acuerdo a tus propias metas en torno a la nutrición." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 shadow-[0_10px_30px_rgba(23,53,46,0.08)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-4 sm:px-5 md:px-8">
          <Brand prominent />
          <nav aria-label="Acceso a NutriCare" className="flex items-center gap-2">
            <Link href="/login" className="whitespace-nowrap rounded-xl border border-[var(--primary)] bg-white px-3 py-2.5 text-xs font-bold text-[var(--primary)] transition-colors hover:bg-[var(--soft-green)] sm:px-5 sm:py-3 sm:text-base">Ingresar</Link>
            <Link href="/registro" className="whitespace-nowrap rounded-xl bg-[var(--primary)] px-3 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(7,134,111,0.22)] transition-colors hover:bg-[var(--primary-dark)] sm:px-5 sm:py-3 sm:text-base">Crear cuenta</Link>
          </nav>
        </div>
      </header>
      <section className="auth-grid px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--primary)] shadow-sm">Nutrición balanceada</span>
          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-[-0.055em] md:text-7xl">Nutricionista y paciente, conectados en cada avance.</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--ink-muted)]">Planes, consultas y progreso en un mismo lugar, ideal para nutricionistas y pacientes.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-16 md:grid-cols-3 md:px-8">
        {features.map(({ icon: Icon, title, copy }) => (
          <article key={title} className="rounded-3xl border border-[var(--border)] p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><Icon /></span>
            <h2 className="mt-5 text-xl font-bold">{title}</h2>
            <p className="mt-2 leading-7 text-[var(--ink-muted)]">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
