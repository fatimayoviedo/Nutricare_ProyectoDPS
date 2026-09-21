"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProgressOverview } from "@/components/progress/ProgressOverview";
import { useAuth } from "@/hooks/useAuth";

export default function ProgressPage() {
  const { user } = useAuth();
  const isNutritionist = user?.role === "nutritionist";
  return (
    <>
      <PageHeader title={isNutritionist ? "Progreso de pacientes" : "Mi progreso"} description={isNutritionist ? "Supervisa tendencias, metas y composición corporal de todos tus pacientes." : "Revisa tu tendencia, la meta y la evolución de tu proceso."} />
      <ProgressOverview />
    </>
  );
}
