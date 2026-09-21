"use client";

import { useAuth } from "@/hooks/useAuth";
import { NutritionistDashboard } from "./NutritionistDashboard";
import { PatientDashboard } from "./PatientDashboard";
import { PageHeader } from "./PageHeader";

export function RoleDashboard() {
  const { user } = useAuth();
  const role = user?.role ?? "patient";
  const patientFirstName = user?.name.split(" ")[0] ?? "Gerardo";
  return (
    <>
      <PageHeader
        title={role === "nutritionist" ? "Buenos días, Licda. Fátima" : `Hola, ${patientFirstName}`}
        description={role === "nutritionist" ? "Aquí tienes el panorama de tus pacientes y consultas." : "Este es tu resumen nutricional y tu plan para hoy."}
      />
      {role === "nutritionist" ? <NutritionistDashboard /> : <PatientDashboard />}
    </>
  );
}
