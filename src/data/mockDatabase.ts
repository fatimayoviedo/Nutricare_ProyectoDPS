import type { Consultation, Measurement, NutritionPlan, Patient } from "@/types";

interface MockDatabase {
  patients: Patient[];
  consultations: Consultation[];
  measurements: Measurement[];
  plans: NutritionPlan[];
}

const seed: MockDatabase = {
  patients: [
    { id: "gerardo-pena", name: "Gerardo Peña", email: "gerardo@ejemplo.com", dateOfBirth: "1994-03-12", sex: "male", heightCm: 168, objective: "Control de peso", status: "active", nextConsultation: "2026-09-18T10:30", createdAt: "2026-07-10T15:00:00.000Z" },
    { id: "carlos-ramirez", name: "Carlos Ramírez", email: "carlos@ejemplo.com", dateOfBirth: "1998-06-20", sex: "male", heightCm: 176, objective: "Ganancia muscular", status: "active", nextConsultation: "2026-09-19T09:00", createdAt: "2026-07-18T15:00:00.000Z" },
    { id: "lucia-sanchez", name: "Lucía Sánchez", email: "lucia@ejemplo.com", dateOfBirth: "1985-02-10", sex: "female", heightCm: 160, objective: "Hábitos saludables", status: "active", nextConsultation: "2026-09-21T14:00", createdAt: "2026-08-02T15:00:00.000Z" },
  ],
  consultations: [
    { id: "consulta-1", patientId: "gerardo-pena", patientName: "Gerardo Peña", nutritionistId: "demo-nutritionist", date: "2026-09-15T10:30", notes: "Seguimiento mensual", type: "Seguimiento mensual", mode: "Videollamada", status: "scheduled" },
    { id: "consulta-2", patientId: "carlos-ramirez", patientName: "Carlos Ramírez", nutritionistId: "demo-nutritionist", date: "2026-09-15T15:30", notes: "Control quincenal", type: "Control quincenal", mode: "Presencial", status: "scheduled" },
  ],
  measurements: [
    { id: "medicion-1", patientId: "gerardo-pena", date: "2026-04-14", measurementMode: "office", weightKg: 73, heightCm: 168, bmi: 25.9, bodyFatPercentage: 27.1, muscleMassPercentage: 34.8, metabolicAge: 36 },
    { id: "medicion-2", patientId: "gerardo-pena", date: "2026-05-14", measurementMode: "office", weightKg: 71.8, heightCm: 168, bmi: 25.4, bodyFatPercentage: 26.4, muscleMassPercentage: 35.3, metabolicAge: 35 },
    { id: "medicion-3", patientId: "gerardo-pena", date: "2026-06-14", measurementMode: "office", weightKg: 70.7, heightCm: 168, bmi: 25, bodyFatPercentage: 25.8, muscleMassPercentage: 35.9, metabolicAge: 34 },
    { id: "medicion-4", patientId: "gerardo-pena", date: "2026-07-14", measurementMode: "office", weightKg: 70, heightCm: 168, bmi: 24.8, bodyFatPercentage: 25.1, muscleMassPercentage: 36.4, metabolicAge: 33 },
    { id: "medicion-5", patientId: "gerardo-pena", date: "2026-08-14", measurementMode: "remote", weightKg: 69.1, heightCm: 168, bmi: 24.5, waistCm: 79, abdomenCm: 84, armCm: 31, hipCm: 96 },
    { id: "medicion-6", patientId: "gerardo-pena", date: "2026-09-14", measurementMode: "office", weightKg: 68.4, heightCm: 168, bmi: 24.2, bodyFatPercentage: 23.8, muscleMassPercentage: 37.2, metabolicAge: 30 },
    { id: "medicion-7", patientId: "carlos-ramirez", date: "2026-05-19", measurementMode: "office", weightKg: 70.2, heightCm: 176, bmi: 22.7, bodyFatPercentage: 18.9, muscleMassPercentage: 41.2, metabolicAge: 29 },
    { id: "medicion-8", patientId: "carlos-ramirez", date: "2026-07-19", measurementMode: "remote", weightKg: 71.6, heightCm: 176, bmi: 23.1, waistCm: 81, abdomenCm: 84, armCm: 34, hipCm: 99 },
    { id: "medicion-9", patientId: "carlos-ramirez", date: "2026-09-19", measurementMode: "office", weightKg: 73.1, heightCm: 176, bmi: 23.6, bodyFatPercentage: 17.8, muscleMassPercentage: 43.4, metabolicAge: 27 },
    { id: "medicion-10", patientId: "lucia-sanchez", date: "2026-05-21", measurementMode: "office", weightKg: 64.8, heightCm: 160, bmi: 25.3, bodyFatPercentage: 31.6, muscleMassPercentage: 31.2, metabolicAge: 44 },
    { id: "medicion-11", patientId: "lucia-sanchez", date: "2026-07-21", measurementMode: "remote", weightKg: 63.9, heightCm: 160, bmi: 25, waistCm: 81, abdomenCm: 86, armCm: 29, hipCm: 98 },
    { id: "medicion-12", patientId: "lucia-sanchez", date: "2026-09-21", measurementMode: "office", weightKg: 62.7, heightCm: 160, bmi: 24.5, bodyFatPercentage: 29.9, muscleMassPercentage: 32.6, metabolicAge: 40 },
  ],
  plans: [
    {
      id: "plan-equilibrado",
      patientId: "gerardo-pena",
      planMonth: "2026-09",
      title: "Plan equilibrado · 1,750 kcal",
      objective: "Pérdida de peso gradual y sostenible",
      active: true,
      createdAt: "2026-09-01T15:00:00.000Z",
      clinicalGuidance: {
        clinicalNotes: ["Mantener seguimiento mensual del peso y la composición corporal.", "Registrar cualquier molestia digestiva durante el plan."],
        recommendations: ["Priorizar vegetales en almuerzo y cena.", "Mantener horarios regulares y aumentar la hidratación."],
        supplements: ["Vitamina D únicamente según resultados de laboratorio e indicación profesional."],
        medicalExams: ["Perfil lipídico y glucosa en ayunas, coordinados con el médico tratante."],
        exerciseRecommendations: ["Caminata moderada durante 30 minutos, 4 veces por semana, si no existe contraindicación médica."],
      },
      meals: [
        { id: "meal-1", time: "07:00", title: "Desayuno", description: "Avena con yogur natural, frutos rojos y semillas", portion: "⅓ taza de avena, ½ taza de yogur y ½ taza de fruta", calories: 380 },
        { id: "meal-2", time: "10:30", title: "Merienda", description: "Manzana verde con almendras", portion: "1 manzana verde y 10 almendras", calories: 180 },
        { id: "meal-3", time: "13:00", title: "Almuerzo", description: "Pechuga de pollo, arroz integral y ensalada fresca", portion: "5 oz de pollo, ⅓ taza de arroz y 1½ taza de ensalada", calories: 560 },
        { id: "meal-4", time: "16:30", title: "Merienda", description: "Batido de banano con leche descremada", portion: "1 taza de leche y ½ banano", calories: 220 },
        { id: "meal-5", time: "19:30", title: "Cena", description: "Crema de vegetales y tostada integral", portion: "1½ taza de crema y 1 tostada integral", calories: 410 },
      ],
    },
    {
      id: "plan-muscular",
      patientId: "carlos-ramirez",
      planMonth: "2026-09",
      title: "Plan de ganancia muscular · 2,300 kcal",
      objective: "Aumentar masa muscular de forma progresiva",
      active: true,
      createdAt: "2026-09-01T15:00:00.000Z",
      clinicalGuidance: {
        clinicalNotes: ["Revisar tolerancia al aumento calórico en la próxima consulta."],
        recommendations: ["Distribuir la proteína en los cinco tiempos de comida.", "Mantener hidratación antes y después del entrenamiento."],
        supplements: ["No iniciar suplementos sin revisar primero la alimentación y el entrenamiento."],
        medicalExams: ["Hemograma completo según criterio del médico tratante."],
        exerciseRecommendations: ["Entrenamiento de fuerza progresivo 3 veces por semana, con supervisión profesional."],
      },
      meals: [
        { id: "meal-c1", time: "07:00", title: "Desayuno", description: "Huevos, frijoles, tortilla y aguacate", portion: "3 huevos, ½ taza de frijoles, 2 tortillas y ¼ de aguacate", calories: 520 },
        { id: "meal-c2", time: "10:30", title: "Merienda", description: "Yogur griego con fruta y semillas", portion: "1 yogur, 1 taza de fruta y 2 cucharadas de semillas", calories: 260 },
        { id: "meal-c3", time: "13:00", title: "Almuerzo", description: "Pollo, arroz integral y vegetales", portion: "7 oz de pollo, 1 taza de arroz y 1½ taza de vegetales", calories: 720 },
        { id: "meal-c4", time: "16:30", title: "Merienda", description: "Batido de banano y mantequilla de maní", portion: "1 banano y 1 cucharada de mantequilla de maní", calories: 310 },
        { id: "meal-c5", time: "19:30", title: "Cena", description: "Pasta integral con atún y ensalada", portion: "1 taza de pasta, 1 lata de atún y 1 taza de ensalada", calories: 490 },
      ],
    },
    {
      id: "plan-habitos",
      patientId: "lucia-sanchez",
      planMonth: "2026-09",
      title: "Plan de hábitos saludables · 1,650 kcal",
      objective: "Mejorar hábitos y composición corporal",
      active: true,
      createdAt: "2026-09-01T15:00:00.000Z",
      clinicalGuidance: {
        clinicalNotes: ["Dar seguimiento a energía, sueño y digestión."],
        recommendations: ["Crear el hábito de caminar diariamente.", "Aumentar gradualmente la ingesta de agua."],
        supplements: ["Valorar vitamina B12 únicamente si los hábitos y exámenes lo justifican."],
        medicalExams: ["Glucosa en ayunas y perfil tiroideo, si el médico tratante lo considera necesario."],
        exerciseRecommendations: ["Caminata suave y ejercicios de movilidad al menos 4 veces por semana."],
      },
      meals: [
        { id: "meal-l1", time: "07:00", title: "Desayuno", description: "Avena con yogur y fruta", portion: "⅓ taza de avena, ½ taza de yogur y ½ taza de fruta", calories: 350 },
        { id: "meal-l2", time: "10:30", title: "Merienda", description: "Manzana con almendras", portion: "1 manzana y 6 almendras", calories: 160 },
        { id: "meal-l3", time: "13:00", title: "Almuerzo", description: "Pescado, quinoa y vegetales", portion: "5 oz de pescado, ⅓ taza de quinoa y 1½ taza de vegetales", calories: 530 },
        { id: "meal-l4", time: "16:30", title: "Merienda", description: "Yogur con chía", portion: "1 yogur y 2 cucharadas de chía", calories: 190 },
        { id: "meal-l5", time: "19:30", title: "Cena", description: "Crema de vegetales y queso fresco", portion: "1½ taza de crema y 2 oz de queso fresco", calories: 420 },
      ],
    },
  ],
};

declare global {
  var nutricareMockDatabase: MockDatabase | undefined;
}

export function getDatabase(): MockDatabase {
  if (!globalThis.nutricareMockDatabase) {
    globalThis.nutricareMockDatabase = structuredClone(seed);
  }
  return globalThis.nutricareMockDatabase;
}

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
