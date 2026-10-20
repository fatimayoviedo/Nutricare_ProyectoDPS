import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { initialPatients } from '@/data/demo';
import type { NewPatientPayload, PatientRecord } from '@/types/patient';

const PATIENTS_KEY = 'nutricare.mobile.patients';

interface PatientContextValue {
  patients: PatientRecord[];
  isReady: boolean;
  addPatient: (payload: NewPatientPayload) => Promise<void>;
  setPatientHeight: (patientId: string, heightCm: number) => Promise<void>;
}

const PatientContext = createContext<PatientContextValue | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PATIENTS_KEY)
      .then((raw) => {
        if (!raw) { setPatients(initialPatients); return; }
        const stored = JSON.parse(raw) as PatientRecord[];
        setPatients(stored.map((patient) => ({
          ...patient,
          heightCm: patient.heightCm ?? initialPatients.find((item) => item.email === patient.email)?.heightCm,
        })));
      })
      .catch(() => setPatients(initialPatients))
      .finally(() => setIsReady(true));
  }, []);

  const addPatient = useCallback(async (payload: NewPatientPayload) => {
    if (patients.some((patient) => patient.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new Error('Ya existe un paciente con este correo electrónico.');
    }
    const next = [...patients, { ...payload, email: payload.email.trim().toLowerCase(), id: `patient-${Date.now()}`, status: 'Nuevo expediente' }];
    await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(next));
    setPatients(next);
  }, [patients]);

  const setPatientHeight = useCallback(async (patientId: string, heightCm: number) => {
    const next = patients.map((patient) => patient.id === patientId ? { ...patient, heightCm } : patient);
    await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(next));
    setPatients(next);
  }, [patients]);

  const value = useMemo(() => ({ patients, isReady, addPatient, setPatientHeight }), [addPatient, isReady, patients, setPatientHeight]);
  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (!context) throw new Error('usePatients debe utilizarse dentro de PatientProvider.');
  return context;
}
