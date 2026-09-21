import { createId, getDatabase } from "@/data/mockDatabase";
import { ok, validationError } from "@/lib/api/responses";
import { patientSchema } from "@/schemas/patientSchema";

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("search")?.trim().toLowerCase();
  const patients = getDatabase().patients.filter((patient) =>
    query ? `${patient.name} ${patient.email} ${patient.objective}`.toLowerCase().includes(query) : true,
  );
  return ok(patients);
}

export async function POST(request: Request) {
  const result = patientSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) return validationError(result.error);
  const patient = { ...result.data, id: createId("paciente"), createdAt: new Date().toISOString() };
  getDatabase().patients.unshift(patient);
  return ok(patient, "Paciente creado correctamente.", 201);
}
