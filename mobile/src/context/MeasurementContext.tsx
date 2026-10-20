import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { NewOfficeMeasurement, OfficeMeasurement } from '@/types/measurement';

const STORAGE_KEY = 'nutricare.mobile.office-measurements';

interface MeasurementContextValue {
  measurements: OfficeMeasurement[];
  isReady: boolean;
  addMeasurement: (measurement: NewOfficeMeasurement) => Promise<OfficeMeasurement>;
}

const MeasurementContext = createContext<MeasurementContextValue | undefined>(undefined);

export function MeasurementProvider({ children }: { children: ReactNode }) {
  const [measurements, setMeasurements] = useState<OfficeMeasurement[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setMeasurements(raw ? JSON.parse(raw) as OfficeMeasurement[] : []))
      .catch(() => setMeasurements([]))
      .finally(() => setIsReady(true));
  }, []);

  const addMeasurement = useCallback(async (input: NewOfficeMeasurement) => {
    const heightMeters = input.heightCm / 100;
    const measurement: OfficeMeasurement = {
      ...input,
      id: `measurement-${Date.now()}`,
      bmi: Math.round((input.weightKg / (heightMeters * heightMeters)) * 10) / 10,
    };
    const next = [...measurements, measurement];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMeasurements(next);
    return measurement;
  }, [measurements]);

  const value = useMemo(() => ({ measurements, isReady, addMeasurement }), [measurements, isReady, addMeasurement]);
  return <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>;
}

export function useMeasurements() {
  const context = useContext(MeasurementContext);
  if (!context) throw new Error('useMeasurements debe utilizarse dentro de MeasurementProvider.');
  return context;
}
