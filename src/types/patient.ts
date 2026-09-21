export type PatientStatus = "active" | "inactive";
export type PatientSex = "female" | "male";

export interface Patient {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  sex: PatientSex;
  heightCm: number;
  objective: string;
  status: PatientStatus;
  nextConsultation?: string;
  createdAt: string;
}

export type PatientInput = Omit<Patient, "id" | "createdAt">;
