export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  nutritionistId: string;
  date: string;
  notes: string;
  type: string;
  mode: "Videollamada" | "Presencial";
  status: "scheduled" | "completed" | "cancelled";
}

export type ConsultationInput = Omit<Consultation, "id" | "patientName" | "nutritionistId">;
