import type { NutritionPlan, NutritionPlanInput } from "@/types";
import { apiRequest } from "./apiClient";

export const planService = {
  list: () => apiRequest<NutritionPlan[]>("/api/plans"),
  get: (id: string) => apiRequest<NutritionPlan>(`/api/plans/${id}`),
  create: (input: NutritionPlanInput) => apiRequest<NutritionPlan>("/api/plans", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: NutritionPlanInput) => apiRequest<NutritionPlan>(`/api/plans/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: string) => apiRequest<NutritionPlan>(`/api/plans/${id}`, { method: "DELETE" }),
};
