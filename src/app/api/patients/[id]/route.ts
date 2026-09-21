import { getDatabase } from "@/data/mockDatabase";
import { notFound, ok, validationError } from "@/lib/api/responses";
import { patientSchema } from "@/schemas/patientSchema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = getDatabase().patients.find((item) => item.id === id);
  return patient ? ok(patient) : notFound("Paciente");
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = getDatabase();
  const index = database.patients.findIndex((item) => item.id === id);
  if (index < 0) return notFound("Paciente");
  const result = patientSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) return validationError(result.error);
  const patient = { ...database.patients[index], ...result.data };
  database.patients[index] = patient;
  return ok(patient, "Paciente actualizado correctamente.");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = getDatabase();
  const index = database.patients.findIndex((item) => item.id === id);
  if (index < 0) return notFound("Paciente");
  const [patient] = database.patients.splice(index, 1);
  database.consultations = database.consultations.filter((item) => item.patientId !== id);
  database.measurements = database.measurements.filter((item) => item.patientId !== id);
  database.plans = database.plans.filter((item) => item.patientId !== id);
  return ok(patient, "Paciente y registros asociados eliminados.");
}
