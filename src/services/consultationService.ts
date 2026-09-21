import type { Consultation, ConsultationInput } from "@/types";
import { apiRequest } from "./apiClient";

export const consultationService = {
  list: () => apiRequest<Consultation[]>("/api/consultations"),
  get: (id: string) => apiRequest<Consultation>(`/api/consultations/${id}`),
  create: (input: ConsultationInput) => apiRequest<Consultation>("/api/consultations", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: ConsultationInput) => apiRequest<Consultation>(`/api/consultations/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: string) => apiRequest<Consultation>(`/api/consultations/${id}`, { method: "DELETE" }),
};
