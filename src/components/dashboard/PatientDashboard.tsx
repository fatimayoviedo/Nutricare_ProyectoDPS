"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarCheck, Check, Droplets, Minus, Plus, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { planService } from '@/services/planService';
import { consultationService } from '@/services/consultationService';
import { habitService, type DailyHabit } from '@/services/habitService';
import type { NutritionPlan, Consultation } from '@/types';
import { getErrorMessage } from '@/utils/errorHandler';
import { localDate } from '@/utils/localDate';

export function PatientDashboard() {
  const [now] = useState(() => Date.now());
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [planId, setPlanId] = useState('');
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [habits, setHabits] = useState<DailyHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const today = localDate();
  useEffect(() => {
    Promise.all([planService.list(), consultationService.list(), habitService.list()])
      .then(([p,c,h]) => { setPlans(p); setConsultations(c); setHabits(h); })
      .catch(cause => setError(getErrorMessage(cause))).finally(() => setLoading(false));
  }, []);
  const currentPlans = plans.filter(item => item.active && item.planMonth === today.slice(0,7));
  const plan = currentPlans.find(item => item.id === planId) ?? currentPlans[0];
  const stored = habits.find(item => item.date === today);
  const daily: DailyHabit = stored ?? {date:today, planId:plan?.id ?? '', completed:[], mealCount:plan?.meals.length ?? 0, water:0};
  const completed = daily.planId === plan?.id ? daily.completed : [];
  const dates = Array.from({length:7}, (_, index) => { const date = new Date(); date.setDate(date.getDate()-index); return localDate(date); });
  const daysDone = habits.filter(item => dates.includes(item.date) && item.mealCount > 0 && item.completed.length >= item.mealCount).length;
  const next = consultations.filter(item => item.status === 'scheduled' && new Date(item.date).getTime() >= now).sort((a,b) => a.date.localeCompare(b.date))[0];
  async function save(nextDaily: DailyHabit) {
    setSaving(true); setError('');
    try { const result = await habitService.save(nextDaily); setHabits(items => [...items.filter(item => item.date !== today), result]); }
    catch(cause) { setError(getErrorMessage(cause)); } finally { setSaving(false); }
  }
  if (loading) return <Spinner label="Cargando tu seguimiento" />;
  return <div className="grid gap-6">
    {error && <Alert tone="error">{error}</Alert>}
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <Card><div className="flex justify-between gap-3"><div><h2 className="text-xl font-bold">Tu plan de hoy</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">{new Date().toLocaleDateString('es-SV', {weekday:'long',day:'numeric',month:'long'})}</p></div><Link href="/planes" className="text-sm font-bold text-[var(--primary)]">Plan completo</Link></div>
        {currentPlans.length > 1 && <select aria-label="Plan de hoy" value={plan?.id} onChange={event => setPlanId(event.target.value)} className="mt-4 w-full rounded-xl border p-3">{currentPlans.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select>}
        {!plan && <p className="py-10 text-[var(--ink-muted)]">Aún no tienes un plan activo para este mes. Tu nutricionista podrá asignarlo a tu expediente.</p>}
        <div className="mt-5 divide-y divide-[var(--border)]">{plan?.meals.map((meal,index) => <div key={meal.id} className="flex gap-3 py-4"><button type="button" disabled={saving} role="checkbox" aria-checked={completed.includes(meal.id)} aria-label={meal.title} onClick={() => void save({...daily, planId:plan.id,mealCount:plan.meals.length,completed:completed.includes(meal.id) ? completed.filter(id => id !== meal.id) : [...completed,meal.id]})} style={{backgroundColor:['#f7bd40','#4c83f3','#0faa91','#9870ed','#f87168'][index%5]}} className="grid size-9 shrink-0 place-items-center rounded-full text-white disabled:opacity-50">{completed.includes(meal.id) && <Check className="size-5" />}</button><div><p className="font-bold">{meal.title} <span className="text-xs font-normal text-[var(--ink-muted)]">{meal.time}</span></p><p className="mt-1 text-sm text-[var(--ink-muted)]">{meal.description}</p></div></div>)}</div>
        <Link href="/comidas" className="mt-5 block rounded-xl bg-[var(--soft-green)] p-3 text-center font-bold text-[var(--primary)]">Registrar fotografías de comidas</Link>
      </Card>
      <div className="grid gap-4">
        <Card className="bg-[var(--primary-dark)] text-white"><p className="font-bold">Meta semanal</p><p className="mt-3 text-3xl font-extrabold">{daysDone} de 7 días</p><p className="mt-2 text-sm">Días con todas las comidas marcadas durante los últimos 7 días.</p><div className="mt-4 h-2 rounded-full bg-white/20"><div className="h-full rounded-full bg-[var(--lime)]" style={{width:`${daysDone/7*100}%`}} /></div></Card>
        <Card><Target className="text-[var(--primary)]" /><p className="mt-3 font-bold">Objetivo del plan</p><p className="mt-2 text-sm">{plan?.objective ?? 'Sin objetivo asignado'}</p></Card>
        <Card><div className="flex items-center gap-3"><Droplets className="text-blue-500" /><div className="flex-1"><p className="font-bold">Agua registrada</p><p>{daily.water} vasos hoy</p></div><button disabled={saving || daily.water <= 0} aria-label="Quitar vaso" onClick={() => void save({...daily, water:daily.water-1})} className="rounded-full border p-2 disabled:opacity-40"><Minus className="size-4" /></button><button disabled={saving || daily.water >= 50} aria-label="Agregar vaso" onClick={() => void save({...daily, water:daily.water+1})} className="rounded-full bg-blue-500 p-2 text-white disabled:opacity-40"><Plus className="size-4" /></button></div></Card>
        <Card><CalendarCheck className="text-[var(--primary)]" /><p className="mt-3 font-bold">Próxima consulta</p><p className="mt-2 text-sm">{next ? new Date(next.date).toLocaleString('es-SV',{dateStyle:'medium',timeStyle:'short'}) : 'Sin consultas programadas'}</p>{next && <p className="mt-1 text-sm">{next.type} · {next.mode}</p>}</Card>
      </div>
    </div>
    <Link href="/historial" className="font-bold text-[var(--primary)]">Ver historial de registros →</Link>
  </div>;
}
