export interface Measurement {
  id: string;
  patientId: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  measurementMode: "office" | "remote";
  waistCm?: number;
  abdomenCm?: number;
  armCm?: number;
  hipCm?: number;
  bodyFatPercentage?: number;
  muscleMassPercentage?: number;
  metabolicAge?: number;
  additionalMeasurements?: Array<{
    name: string;
    value: number;
    unit: "cm" | "kg" | "%" | "mm";
  }>;
  photoUrl?: string;
}

export type MeasurementInput = Omit<Measurement, "id" | "bmi">;
