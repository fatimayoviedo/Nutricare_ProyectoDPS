import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PlanForm } from "@/components/plans/PlanForm";

export default function NewPlanPage() {
  return <><PageHeader title="Nuevo plan" description="Define el menú, adjunta el plan e incluye sus indicaciones clínicas." /><Card className="max-w-6xl"><PlanForm /></Card></>;
}
