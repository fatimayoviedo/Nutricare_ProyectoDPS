"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Dumbbell, FileDown, FileHeart, Flame, Lightbulb, Pill, Scale, TestTubeDiagonal, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/hooks/useAuth";
import type { NutritionPlan } from "@/types";

interface MealOption {
  title: string;
  time: string;
  description: string;
  portion: string;
  calories: number;
}

interface DayPlan {
  day: number;
  weekday: string;
  meals: MealOption[];
}

interface MonthPlan {
  id: string;
  label: string;
  days: DayPlan[];
}

const breakfasts: Omit<MealOption, "title" | "time">[] = [
  { description: "Overnight oats con yogur y frutos rojos", portion: "⅓ taza de avena, ½ taza de leche, ¼ taza de yogur y ½ taza de fruta", calories: 380 },
  { description: "Huevos con frijoles y tortilla", portion: "2 huevos, ½ taza de frijoles, 1 tortilla y ¼ de aguacate", calories: 390 },
  { description: "Tostadas integrales con queso y fruta", portion: "2 tostadas, 2 oz de queso fresco y 1 porción de fruta", calories: 370 },
  { description: "Yogur con granola, semillas y fresas", portion: "¾ taza de yogur, 2 cdas. de granola, 2 cdas. de semillas y ½ taza de fresas", calories: 360 },
  { description: "Quesadillas de desayuno", portion: "2 tortillas, ½ taza de frijoles, 1½ oz de mozzarella y ¼ de aguacate", calories: 400 },
];

const morningSnacks: Omit<MealOption, "title" | "time">[] = [
  { description: "Manzana con almendras", portion: "1 manzana mediana y 6 almendras", calories: 170 },
  { description: "Papaya con semillas", portion: "¾ taza de papaya y 2 cdas. de semillas", calories: 160 },
  { description: "Yogur griego con fruta", portion: "1 yogur griego y ½ taza de fruta", calories: 180 },
  { description: "Pera con maní", portion: "1 pera mediana y 10 maníes naturales", calories: 175 },
];

const lunches: Omit<MealOption, "title" | "time">[] = [
  { description: "Pollo a la plancha, arroz integral y ensalada", portion: "5 oz de pollo, ⅓ taza de arroz y 1½ taza de ensalada", calories: 560 },
  { description: "Tacos de camarones con guacamole", portion: "3 tortillas, 5 oz de camarones, ¼ de aguacate y 1 taza de chirmol", calories: 550 },
  { description: "Bowl mexicano de pollo", portion: "5 oz de pollo, ⅓ taza de arroz, ½ taza de frijoles y vegetales", calories: 570 },
  { description: "Pasta integral con atún y vegetales", portion: "⅔ taza de pasta, 1 lata de atún en agua y 1 taza de vegetales", calories: 540 },
  { description: "Carne magra con puré y ensalada", portion: "5 oz de carne, ½ taza de puré y 1½ taza de ensalada", calories: 580 },
  { description: "Salmón con quinoa y vegetales", portion: "5 oz de salmón, ⅓ taza de quinoa y 1 taza de vegetales", calories: 575 },
];

const afternoonSnacks: Omit<MealOption, "title" | "time">[] = [
  { description: "Batido de fruta con bebida de almendra", portion: "1½ taza de bebida de almendra, ½ taza de fruta y 1 cda. de mantequilla de maní", calories: 220 },
  { description: "Yogur con chía y fruta", portion: "1 yogur griego, 2 cdas. de chía y ½ taza de fruta", calories: 210 },
  { description: "Tostada con mantequilla de maní", portion: "1 tostada integral, 1 cda. de mantequilla de maní y ½ taza de fruta", calories: 215 },
  { description: "Pudín de chía y cocoa", portion: "1 yogur natural, 2 cdas. de chía y cocoa sin azúcar", calories: 200 },
];

const dinners: Omit<MealOption, "title" | "time">[] = [
  { description: "Crema de verduras con tostada integral", portion: "1½ taza de crema, 1 tostada integral y 2 oz de queso fresco", calories: 410 },
  { description: "Wraps de pollo con vegetales", portion: "3 tortillas pequeñas, 4 oz de pollo, vegetales y ¼ de aguacate", calories: 430 },
  { description: "Ensalada mexicana con pollo", portion: "2 tazas de vegetales, 4 oz de pollo, ½ taza de frijoles y ¼ de aguacate", calories: 420 },
  { description: "Sándwich integral de pollo", portion: "2 rebanadas de pan, 4 oz de pollo, vegetales y 1 cda. de aderezo ligero", calories: 425 },
  { description: "Quesadillas con frijoles y chirmol", portion: "3 tortillas, 3 oz de mozzarella, ½ taza de frijoles y 1 taza de chirmol", calories: 440 },
];

const weekdayFormatter = new Intl.DateTimeFormat("es-SV", { weekday: "long" });
const monthFormatter = new Intl.DateTimeFormat("es-SV", { month: "long", year: "numeric" });

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildMonth(year: number, monthIndex: number): MonthPlan {
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, monthIndex, day, 12);
    const offset = day + monthIndex;
    const makeMeal = (title: string, time: string, options: Omit<MealOption, "title" | "time">[], extra: number): MealOption => ({ title, time, ...options[(offset + extra) % options.length] });
    return {
      day,
      weekday: capitalize(weekdayFormatter.format(date)),
      meals: [
        makeMeal("Desayuno", "07:00", breakfasts, 0),
        makeMeal("Merienda", "10:30", morningSnacks, 1),
        makeMeal("Almuerzo", "13:00", lunches, 2),
        makeMeal("Merienda", "16:30", afternoonSnacks, 3),
        makeMeal("Cena", "19:30", dinners, 4),
      ],
    };
  });
  const date = new Date(year, monthIndex, 1, 12);
  return { id: `${year}-${String(monthIndex + 1).padStart(2, "0")}`, label: capitalize(monthFormatter.format(date)), days };
}

const months = Array.from({ length: 13 }, (_, index) => buildMonth(2026, 7 + index));
const currentPlanMonthId = "2026-09";

function DayMenu({ day, monthLabel }: { day: DayPlan; monthLabel: string }) {
  const totalCalories = day.meals.reduce((sum, meal) => sum + meal.calories, 0);
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4">
        <div><p className="text-xs font-bold uppercase tracking-wide text-[var(--primary)]">{monthLabel}</p><h3 className="mt-1 text-lg font-bold">{day.weekday} {day.day}</h3></div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[var(--primary-dark)]"><Flame className="size-4 text-orange-500" /> {totalCalories} kcal</span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {day.meals.map((meal, index) => <div key={`${day.day}-${meal.time}-${index}`} className="grid gap-4 px-5 py-5 md:grid-cols-[9rem_1fr_1fr_auto] md:items-center">
          <div><p className="font-bold">{meal.title}</p><p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--ink-muted)]"><Clock3 className="size-3.5" /> {meal.time}</p></div>
          <div><p className="text-sm font-semibold text-[var(--ink)]">{meal.description}</p></div>
          <div className="rounded-xl bg-[var(--soft-green)] px-3 py-2.5"><p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--primary)]"><Scale className="size-3.5" /> Porción</p><p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">{meal.portion}</p></div>
          <span className="text-xs font-bold text-[var(--ink-muted)]">{meal.calories} kcal</span>
        </div>)}
      </div>
    </Card>
  );
}

export function MonthlyPlanView({ plan }: { plan: NutritionPlan }) {
  const { user } = useAuth();
  const [monthId, setMonthId] = useState(plan.planMonth);
  const [week, setWeek] = useState(2);
  const [dayFilter, setDayFilter] = useState("14");
  const month = months.find((item) => item.id === monthId) ?? months[1];
  const visibleMonths = user?.role === "nutritionist" ? months : months.filter((item) => item.id <= currentPlanMonthId);
  const monthStatus = month.id < currentPlanMonthId ? "Plan mensual inactivo" : month.id > currentPlanMonthId ? "Plan mensual no habilitado" : "Plan mensual activo";
  const calorieTarget = Number(plan.title.match(/([\d,]+)\s*kcal/i)?.[1].replace(",", "")) || 1750;
  const adjustedDays = useMemo(() => month.days.map((day) => {
    const baseTotal = day.meals.reduce((sum, meal) => sum + meal.calories, 0);
    const adjustedMeals = day.meals.map((meal) => ({ ...meal, calories: Math.round((meal.calories * calorieTarget / baseTotal) / 5) * 5 }));
    const adjustedTotal = adjustedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    adjustedMeals[adjustedMeals.length - 1] = { ...adjustedMeals.at(-1)!, calories: adjustedMeals.at(-1)!.calories + calorieTarget - adjustedTotal };
    return { ...day, meals: adjustedMeals };
  }), [calorieTarget, month]);
  const weeks = Math.ceil(month.days.length / 7);
  const weekDays = useMemo(() => adjustedDays.slice((week - 1) * 7, week * 7), [adjustedDays, week]);
  const visibleDays = dayFilter === "all" ? weekDays : weekDays.filter((day) => String(day.day) === dayFilter);
  const guidanceSections = [
    { title: "Notas clínicas", icon: FileHeart, items: plan.clinicalGuidance?.clinicalNotes ?? [] },
    { title: "Recomendaciones", icon: Lightbulb, items: plan.clinicalGuidance?.recommendations ?? [] },
    { title: "Vitaminas y suplementos", icon: Pill, items: plan.clinicalGuidance?.supplements ?? [] },
    { title: "Exámenes sugeridos", icon: TestTubeDiagonal, items: plan.clinicalGuidance?.medicalExams ?? [] },
    { title: "Ejercicio sugerido", icon: Dumbbell, items: plan.clinicalGuidance?.exerciseRecommendations ?? [] },
  ];
  const hasClinicalGuidance = guidanceSections.some((section) => section.items.length > 0);

  function changeMonth(id: string) {
    setMonthId(id);
    setWeek(1);
    setDayFilter("1");
  }

  function changeWeek(nextWeek: number) {
    const safeWeek = Math.min(Math.max(nextWeek, 1), weeks);
    setWeek(safeWeek);
    const firstDay = month.days[(safeWeek - 1) * 7];
    setDayFilter(firstDay ? String(firstDay.day) : "all");
  }

  return (
    <div className="grid gap-5">
      <Card className="overflow-hidden bg-gradient-to-br from-white to-[var(--soft-green)]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div><span className="inline-flex rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-bold text-white">{monthStatus}</span><h2 className="mt-3 text-2xl font-extrabold">{plan.title}</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">{plan.objective}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-white px-3 py-1.5">{month.days.length} días</span><span className="rounded-full bg-white px-3 py-1.5">5 tiempos diarios</span><span className="rounded-full bg-white px-3 py-1.5">Porciones detalladas</span></div></div>
          <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="flex items-center gap-2 text-sm font-bold"><CalendarDays className="size-5 text-[var(--primary)]" /> Vigencia</p><p className="mt-2 text-sm text-[var(--ink-muted)]">1 al {month.days.length} de {month.label}</p><p className="mt-1 text-xs text-[var(--primary)]">Revisión al finalizar el mes</p></div>
        </div>
      </Card>

      {plan.attachment ? <Card className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><FileDown className="size-5" /></span><div><h2 className="font-bold">Archivo completo del plan</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">{plan.attachment.name} · {(plan.attachment.sizeBytes / 1024 / 1024).toFixed(2)} MB</p></div></div><a href={plan.attachment.dataUrl} download={plan.attachment.name} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-dark)]"><FileDown className="size-4" /> Descargar archivo</a></Card> : null}

      <section aria-labelledby="clinical-guidance-title">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="clinical-guidance-title" className="text-xl font-bold">Indicaciones clínicas de tu nutricionista</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Notas y sugerencias vinculadas a este plan mensual.</p></div><span className="rounded-full bg-[var(--soft-green)] px-3 py-1 text-xs font-bold text-[var(--primary)]">Seguimiento profesional</span></div>
        {hasClinicalGuidance ? <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{guidanceSections.map(({ title, icon: SectionIcon, items }) => <Card key={title} className="h-full"><span className="grid size-10 place-items-center rounded-xl bg-[var(--soft-green)] text-[var(--primary)]"><SectionIcon className="size-5" /></span><h3 className="mt-4 font-bold">{title}</h3>{items.length ? <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ink-muted)]">{items.map((item, index) => <li key={`${title}-${index}`} className="flex gap-2"><span className="text-[var(--primary)]">•</span><span>{item}</span></li>)}</ul> : <p className="mt-3 text-sm text-[var(--ink-muted)]">Sin indicaciones por el momento.</p>}</Card>)}</div> : <Card className="mt-4 flex items-start gap-3"><Lightbulb className="mt-0.5 text-[var(--primary)]" /><div><p className="font-bold">Sin indicaciones adicionales</p><p className="mt-1 text-sm text-[var(--ink-muted)]">La nutricionista podrá agregarlas cuando sea necesario.</p></div></Card>}
        <p className="mt-3 text-xs leading-5 text-[var(--ink-muted)]">Los suplementos y exámenes deben confirmarse con el profesional de salud correspondiente antes de realizarlos o iniciarlos.</p>
      </section>

      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.25fr_1fr] lg:items-end">
          <Select label="Mes del plan" value={monthId} onChange={(event) => changeMonth(event.target.value)}>{visibleMonths.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</Select>
          <div><p className="mb-2 text-sm font-medium">Semana</p><div className="flex items-center gap-2"><button type="button" onClick={() => changeWeek(week - 1)} disabled={week === 1} className="grid size-12 place-items-center rounded-xl border border-[var(--border)] disabled:opacity-40" aria-label="Semana anterior"><ChevronLeft className="size-5" /></button><div className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[var(--surface-muted)] px-4 text-sm font-bold">Semana {week} de {weeks}</div><button type="button" onClick={() => changeWeek(week + 1)} disabled={week === weeks} className="grid size-12 place-items-center rounded-xl border border-[var(--border)] disabled:opacity-40" aria-label="Semana siguiente"><ChevronRight className="size-5" /></button></div></div>
          <Select label="Día" value={dayFilter} onChange={(event) => setDayFilter(event.target.value)}><option value="all">Toda la semana</option>{weekDays.map((day) => <option key={day.day} value={day.day}>{day.weekday} {day.day}</option>)}</Select>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold">Menú y porciones</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">{dayFilter === "all" ? `Semana ${week} completa` : `${visibleDays[0]?.weekday ?? "Día"} ${visibleDays[0]?.day ?? ""} de ${month.label}`}</p></div><span className="hidden items-center gap-2 text-xs font-bold text-[var(--primary)] sm:inline-flex"><Utensils className="size-4" /> Plan completo</span></div>
      <div className="grid gap-5">{visibleDays.map((day) => <DayMenu key={day.day} day={day} monthLabel={month.label} />)}</div>
    </div>
  );
}
