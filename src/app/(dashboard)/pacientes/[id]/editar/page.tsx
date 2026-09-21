import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PatientForm } from "@/components/patients/PatientForm";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <><PageHeader title="Editar paciente" description="Actualiza la información del expediente." /><Card className="max-w-3xl"><PatientForm patientId={id} /></Card></>;
}
