"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck, Check, ChevronRight, Droplets, Minus, Plus, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";

const meals = [
  { time: "7:00", name: "Desayuno", detail: "Avena, yogur y frutos rojos", done: true },
  { time: "10:30", name: "Merienda", detail: "Manzana y almendras", done: true },
  { time: "13:00", name: "Almuerzo", detail: "Pollo, arroz integral y ensalada", done: false },
  { time: "16:30", name: "Merienda", detail: "Batido de frutas", done: false },
  { time: "19:30", name: "Cena", detail: "Crema de verduras y pan integral", done: false },
];

export function PatientDashboard() {
  const [completedMeals, setCompletedMeals] = useState(() => meals.map((meal) => meal.done));
  const [waterGlasses, setWaterGlasses] = useState(5);
  const waterGoal = 8;

  function toggleMeal(index: number) {
    setCompletedMeals((current) => current.map((done, mealIndex) => mealIndex === index ? !done : done));
  }

  function changeWater(amount: number) {
    setWaterGlasses((current) => Math.min(waterGoal, Math.max(0, current + amount)));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-stretch">
        <Card className="h-full">
          <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Tu plan de hoy</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Domingo, 14 de septiembre</p></div><Link href="/planes" className="text-sm font-bold text-[var(--primary)]">Plan completo</Link></div>
          <div className="mt-5 divide-y divide-[var(--border)]">
            {meals.map((meal, index) => (
              <div key={`${meal.time}-${meal.name}`} className="flex gap-3 py-4">
                <button type="button" aria-label={`${completedMeals[index] ? "Marcar como pendiente" : "Marcar como completada"}: ${meal.name}`} aria-pressed={completedMeals[index]} onClick={() => toggleMeal(index)} className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full transition ${completedMeals[index] ? "bg-[var(--primary)] text-white" : "border-2 border-[var(--border)] text-transparent hover:border-[var(--primary)]"}`}><Check className="size-4" /></button>
                <div className="flex-1"><div className="flex items-center gap-2"><p className="font-bold">{meal.name}</p><span className="text-xs text-[var(--ink-muted)]">{meal.time}</span></div><p className="mt-1 text-sm text-[var(--ink-muted)]">{meal.detail}</p></div>
                <ChevronRight className="size-5 text-slate-300" />
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card className="bg-[var(--primary-dark)] text-white">
            <p className="text-sm font-semibold text-emerald-100">Progreso semanal</p>
            <div className="mt-3 flex items-center justify-between gap-4"><div><p className="text-3xl font-extrabold">5 de 7</p><p className="mt-1 text-sm text-emerald-100">días siguiendo tu plan</p></div><div className="grid size-20 shrink-0 place-items-center rounded-full p-2" style={{ background: "conic-gradient(var(--lime) 0 71%, rgba(255,255,255,0.2) 71% 100%)" }} role="img" aria-label="Progreso semanal: 71 por ciento"><span className="grid size-full place-items-center rounded-full bg-[var(--primary-dark)] text-lg font-bold">71%</span></div></div>
          </Card>
          <Card>
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><Target /></span><div><p className="text-sm text-[var(--ink-muted)]">Meta de peso</p><p className="mt-1 text-2xl font-extrabold">65 kg</p><p className="mt-1 text-xs font-bold text-[var(--primary)]">Faltan 3.4 kg</p></div></div>
          </Card>
          <Card>
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Droplets /></span><div className="flex-1"><p className="text-sm text-[var(--ink-muted)]">Agua</p><p className="text-xl font-bold">{waterGlasses} de {waterGoal} vasos</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => changeWater(-1)} disabled={waterGlasses === 0} aria-label="Quitar un vaso de agua" className="grid size-9 place-items-center rounded-full border border-blue-200 text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"><Minus className="size-4" /></button><button type="button" onClick={() => changeWater(1)} disabled={waterGlasses === waterGoal} aria-label="Agregar un vaso de agua" className="grid size-9 place-items-center rounded-full bg-blue-500 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="size-4" /></button></div></div>
            <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-400 transition-[width]" style={{ width: `${(waterGlasses / waterGoal) * 100}%` }} /></div>
          </Card>
          <Card><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><CalendarCheck /></span><div><p className="text-sm text-[var(--ink-muted)]">Próxima consulta</p><p className="text-base font-bold">Miércoles · 3:00 p. m.</p></div></div></Card>
        </div>
    </div>
  );
}
