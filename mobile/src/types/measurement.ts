export interface AdditionalMeasurement {
  name: string;
  value: number;
  unit: 'cm' | 'kg' | '%' | 'mm';
}

export interface OfficeMeasurement {
  id: string;
  patientId: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  bodyFatPercentage: number;
  muscleMassPercentage: number;
  metabolicAge: number;
  additionalMeasurements: AdditionalMeasurement[];
}

export type NewOfficeMeasurement = Omit<OfficeMeasurement, 'id' | 'bmi'>;
