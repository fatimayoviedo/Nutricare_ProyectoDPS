import { getDatabase } from "@/data/mockDatabase";
import { conflict, notFound, ok, validationError } from "@/lib/api/responses";
import { planSchema } from "@/schemas/planSchema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = getDatabase().plans.find((item) => item.id === id);
  return plan ? ok(plan) : notFound("Plan");
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = getDatabase();
  const index = database.plans.findIndex((item) => item.id === id);
  if (index < 0) return notFound("Plan");
  const result = planSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) return validationError(result.error);
  const alreadyAssigned = database.plans.some((item) => item.id !== id && item.patientId === result.data.patientId && item.planMonth === result.data.planMonth);
  if (alreadyAssigned) return conflict("Este paciente ya tiene un plan asignado para el mes seleccionado.");
  const plan = { ...database.plans[index], ...result.data };
  database.plans[index] = plan;
  return ok(plan, "Plan actualizado.");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = getDatabase();
  const index = database.plans.findIndex((item) => item.id === id);
  if (index < 0) return notFound("Plan");
  const [plan] = database.plans.splice(index, 1);
  return ok(plan, "Plan eliminado.");
}
