import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { PlanForm } from '@/components/plans/PlanForm';

export default async function EditPlanPage({params}: {params:Promise<{id:string}>}) {
  const {id} = await params;
  return <><PageHeader title="Editar plan" description="Actualiza el menú, el documento y las indicaciones del mes asignado." /><Card><PlanForm planId={id} /></Card></>;
}
