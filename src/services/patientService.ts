import type { Patient, PatientInput } from "@/types";
import { apiRequest } from "./apiClient";

export const patientService = {
  list: (search = "") => apiRequest<Patient[]>(`/api/patients?search=${encodeURIComponent(search)}`),
  get: (id: string) => apiRequest<Patient>(`/api/patients/${id}`),
  create: (input: PatientInput) => apiRequest<Patient>("/api/patients", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: PatientInput) => apiRequest<Patient>(`/api/patients/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: string) => apiRequest<Patient>(`/api/patients/${id}`, { method: "DELETE" }),
};
