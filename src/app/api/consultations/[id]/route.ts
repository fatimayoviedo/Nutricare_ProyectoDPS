import { getDatabase } from "@/data/mockDatabase";
import { notFound, ok, validationError } from "@/lib/api/responses";
import { consultationSchema } from "@/schemas/consultationSchema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const consultation = getDatabase().consultations.find((item) => item.id === id);
  return consultation ? ok(consultation) : notFound("Consulta");
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = getDatabase();
  const index = database.consultations.findIndex((item) => item.id === id);
  if (index < 0) return notFound("Consulta");
  const result = consultationSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) return validationError(result.error);
  const patient = database.patients.find((item) => item.id === result.data.patientId);
  if (!patient) return notFound("Paciente");
  const consultation = { ...database.consultations[index], ...result.data, patientName: patient.name };
  database.consultations[index] = consultation;
  return ok(consultation, "Consulta actualizada.");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = getDatabase();
  const index = database.consultations.findIndex((item) => item.id === id);
  if (index < 0) return notFound("Consulta");
  const [consultation] = database.consultations.splice(index, 1);
  return ok(consultation, "Consulta eliminada.");
}
