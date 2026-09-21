import { PageHeader } from "@/components/dashboard/PageHeader";
import { PatientDetail } from "@/components/patients/PatientDetail";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <PageHeader title="Expediente del paciente" description={`Información clínica y seguimiento · ${id}`} />
      <PatientDetail id={id} />
    </>
  );
}
