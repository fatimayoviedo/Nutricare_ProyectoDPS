import type { StoredAccount } from '@/types/auth';

export const demoAccounts: StoredAccount[] = [
  { id: 'nutritionist-demo', name: 'Licda. Fátima Oviedo', email: 'nutricionista@nutricare.com', password: 'nutricare2026', role: 'nutritionist' },
  { id: 'patient-demo', name: 'Gerardo Peña', email: 'paciente@nutricare.com', password: 'nutricare2026', role: 'patient', birthDate: '1994-04-12' },
];

export const patientMeals = [
  { id: 'breakfast', time: '7:00 a. m.', title: 'Desayuno', detail: 'Avena con yogur natural, frutos rojos y semillas', portion: '⅓ taza de avena, ½ taza de yogur y ½ taza de fruta', color: '#F4B946', complete: true },
  { id: 'morning-snack', time: '10:30 a. m.', title: 'Merienda', detail: 'Manzana verde con almendras', portion: '1 manzana verde y 10 almendras', color: '#4F86EC', complete: true },
  { id: 'lunch', time: '1:00 p. m.', title: 'Almuerzo', detail: 'Pechuga de pollo, arroz integral y ensalada fresca', portion: '5 oz de pollo, ⅓ taza de arroz y 1½ taza de ensalada', color: '#13A88C', complete: false },
  { id: 'afternoon-snack', time: '4:30 p. m.', title: 'Merienda', detail: 'Batido de banano con leche descremada', portion: '1 taza de leche y ½ banano', color: '#9C73E8', complete: false },
  { id: 'dinner', time: '7:30 p. m.', title: 'Cena', detail: 'Crema de vegetales y tostada integral', portion: '1½ taza de crema y 1 tostada integral', color: '#F27668', complete: false },
];

export const patientClinicalGuidance = [
  { title: 'Notas clínicas', items: ['Mantener seguimiento mensual del peso y la composición corporal.', 'Registrar cualquier molestia digestiva durante el plan.'] },
  { title: 'Sugerencias y recomendaciones', items: ['Priorizar vegetales en almuerzo y cena.', 'Mantener horarios regulares y aumentar la hidratación.'] },
  { title: 'Vitaminas o suplementos', items: ['Vitamina D únicamente según resultados de laboratorio e indicación profesional.'] },
  { title: 'Exámenes médicos sugeridos', items: ['Perfil lipídico y glucosa en ayunas, coordinados con el médico tratante.'] },
  { title: 'Ejercicio sugerido', items: ['Caminata moderada durante 30 minutos, 4 veces por semana, si no existe contraindicación médica.'] },
];

export const appointments = [
  { id: '1', time: '09:00', name: 'Ana Martínez' }, { id: '2', time: '10:30', name: 'Carlos López' },
  { id: '3', time: '13:00', name: 'María Rivera' }, { id: '4', time: '15:30', name: 'José Hernández' },
];

export const weightHistory = [
  { date: '2025-08-14', weightKg: 76.4 },
  { date: '2025-10-14', weightKg: 75.9 },
  { date: '2025-12-14', weightKg: 75 },
  { date: '2026-02-14', weightKg: 74.1 },
  { date: '2026-04-14', weightKg: 73 },
  { date: '2026-05-14', weightKg: 72.1 },
  { date: '2026-06-14', weightKg: 71.2 },
  { date: '2026-07-14', weightKg: 70 },
  { date: '2026-08-14', weightKg: 69.1 },
  { date: '2026-09-14', weightKg: 68.4 },
];

export const initialPatients = [
  { id: 'gerardo', name: 'Gerardo Peña', email: 'paciente@nutricare.com', birthDate: '1994-04-12', heightCm: 168, sex: 'male' as const, goal: 'Control de peso', status: 'Plan activo · octubre' },
  { id: 'ana', name: 'Ana Martínez', email: 'ana@ejemplo.com', birthDate: '1991-08-22', heightCm: 162, sex: 'female' as const, goal: 'Mejorar hábitos', status: 'Revisión en 3 días' },
  { id: 'carlos', name: 'Carlos López', email: 'carlos@ejemplo.com', birthDate: '1988-02-10', heightCm: 176, sex: 'male' as const, goal: 'Composición corporal', status: 'Plan por renovar' },
];
