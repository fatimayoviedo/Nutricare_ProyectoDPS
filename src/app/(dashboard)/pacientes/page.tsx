import Link from "next/link";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PatientList } from "@/components/patients/PatientList";

export default function PatientsPage() {
  return (
    <>
      <PageHeader title="Pacientes" description="Administra expedientes, objetivos y seguimiento." action={<Link href="/pacientes/nuevo" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white"><Plus className="size-4" /> Nuevo paciente</Link>} />
      <Card><PatientList /></Card>
    </>
  );
}
