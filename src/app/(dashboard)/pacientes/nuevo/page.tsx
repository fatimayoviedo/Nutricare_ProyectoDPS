import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PatientForm } from "@/components/patients/PatientForm";

export default function NewPatientPage() {
  return (
    <>
      <PageHeader title="Nuevo paciente" description="Completa los datos iniciales del expediente." />
      <Card className="max-w-3xl"><PatientForm /></Card>
    </>
  );
}
