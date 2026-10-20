export type PatientSex = 'female' | 'male' | 'other';

export interface PatientRecord {
  id: string;
  name: string;
  email: string;
  birthDate: string;
  heightCm?: number;
  sex: PatientSex;
  goal: string;
  status: string;
}

export type NewPatientPayload = Omit<PatientRecord, 'id' | 'status' | 'heightCm'> & { heightCm: number };
