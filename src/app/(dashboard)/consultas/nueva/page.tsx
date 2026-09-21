import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ConsultationForm } from "@/components/consultations/ConsultationForm";

export default function NewConsultationPage() {
  return <><PageHeader title="Nueva consulta" description="Programa una sesión para un paciente." /><Card className="max-w-3xl"><ConsultationForm /></Card></>;
}
