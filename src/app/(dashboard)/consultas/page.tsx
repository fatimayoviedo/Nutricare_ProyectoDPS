import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ConsultationList } from "@/components/consultations/ConsultationList";

export default function ConsultationsPage() {
  return (
    <>
      <PageHeader title="Consultas" description="Organiza la agenda y abre el seguimiento de cada paciente." action={<Link href="/consultas/nueva" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white"><Plus className="size-4" /> Nueva consulta</Link>} />
      <ConsultationList />
    </>
  );
}
