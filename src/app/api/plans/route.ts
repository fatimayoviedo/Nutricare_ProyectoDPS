import { createId, getDatabase } from "@/data/mockDatabase";
import { conflict, ok, validationError } from "@/lib/api/responses";
import { planSchema } from "@/schemas/planSchema";

export function GET() {
  return ok(getDatabase().plans);
}

export async function POST(request: Request) {
  const result = planSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) return validationError(result.error);
  const alreadyAssigned = getDatabase().plans.some((plan) => plan.patientId === result.data.patientId && plan.planMonth === result.data.planMonth);
  if (alreadyAssigned) return conflict("Este paciente ya tiene un plan asignado para el mes seleccionado.");
  const plan = { ...result.data, id: createId("plan"), createdAt: new Date().toISOString() };
  getDatabase().plans.unshift(plan);
  return ok(plan, "Plan creado correctamente.", 201);
}
