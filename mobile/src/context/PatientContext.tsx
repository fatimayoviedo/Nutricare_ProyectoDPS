import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { initialPatients } from '@/data/demo';
import type { NewPatientPayload, PatientRecord } from '@/types/patient';
import { decode, listMobileRecords, saveMobileRecord, cloudReady } from '@/lib/cloudRecords';
import { useAuth } from '@/context/AuthContext';

const PATIENTS_KEY = 'nutricare.mobile.patients';

interface PatientContextValue {
  patients: PatientRecord[];
  isReady: boolean;
  addPatient: (payload: NewPatientPayload) => Promise<void>;
  setPatientHeight: (patientId: string, heightCm: number) => Promise<void>;
}

const PatientContext = createContext<PatientContextValue | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (cloudReady() && user) {
      listMobileRecords('patients', user.role === 'patient' ? user.email : undefined)
        .then((records) => setPatients(records.map((record) => decode<PatientRecord>(record))))
        .catch(() => setPatients([])).finally(() => setIsReady(true));
      return;
    }
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
  }, [user]);

  const addPatient = useCallback(async (payload: NewPatientPayload) => {
    if (cloudReady()) { const record = await saveMobileRecord('patients', payload as unknown as Record<string, unknown>); setPatients((current) => [...current, decode<PatientRecord>(record)]); return; }
    if (patients.some((patient) => patient.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new Error('Ya existe un paciente con este correo electrónico.');
    }
    const next = [...patients, { ...payload, email: payload.email.trim().toLowerCase(), id: `patient-${Date.now()}`, status: 'Nuevo expediente' }];
    await AsyncStorage.setItem(PATIENTS_KEY, JSON.stringify(next));
    setPatients(next);
  }, [patients]);

  const setPatientHeight = useCallback(async (patientId: string, heightCm: number) => {
    if (cloudReady()) { const current = patients.find((patient) => patient.id === patientId); if (current) await saveMobileRecord('patients', { ...current, heightCm }, patientId); setPatients((current) => current.map((patient) => patient.id === patientId ? { ...patient, heightCm } : patient)); return; }
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
