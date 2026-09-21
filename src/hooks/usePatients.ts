"use client";

import { useCallback, useState } from "react";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types";
import { getErrorMessage } from "@/utils/errorHandler";

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      setPatients(await patientService.list(search));
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  const removePatient = useCallback(async (id: string) => {
    setError(null);
    try {
      await patientService.remove(id);
      setPatients((current) => current.filter((patient) => patient.id !== id));
    } catch (cause) {
      setError(getErrorMessage(cause));
      throw cause;
    }
  }, []);

  return { patients, loading, error, loadPatients, removePatient };
}
