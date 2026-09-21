import type { Measurement, MeasurementInput } from "@/types";
import { apiRequest } from "./apiClient";

export const measurementService = {
  list: (patientId?: string) => apiRequest<Measurement[]>(`/api/measurements${patientId ? `?patientId=${encodeURIComponent(patientId)}` : ""}`),
  create: (input: MeasurementInput) => apiRequest<Measurement>("/api/measurements", { method: "POST", body: JSON.stringify(input) }),
  remove: (id: string) => apiRequest<Measurement>(`/api/measurements/${id}`, { method: "DELETE" }),
};
