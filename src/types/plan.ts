export interface MealItem {
  id: string;
  time: string;
  title: string;
  description: string;
  portion: string;
  comments?: string;
  calories?: number;
}

export interface ClinicalGuidance {
  clinicalNotes: string[];
  recommendations: string[];
  supplements: string[];
  medicalExams: string[];
  exerciseRecommendations?: string[];
}

export interface PlanAttachment {
  name: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
}

export interface NutritionPlan {
  id: string;
  patientId: string;
  planMonth: string;
  title: string;
  objective: string;
  meals: MealItem[];
  clinicalGuidance?: ClinicalGuidance;
  attachment?: PlanAttachment;
  active: boolean;
  createdAt: string;
}

export type NutritionPlanInput = Omit<NutritionPlan, "id" | "createdAt">;
