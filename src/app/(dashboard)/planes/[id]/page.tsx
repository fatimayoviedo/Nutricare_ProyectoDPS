import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlanDetail } from "@/components/plans/PlanDetail";

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <><PageHeader title="Detalle del plan" description={`Plan nutricional · ${id}`} /><PlanDetail id={id} /></>;
}
