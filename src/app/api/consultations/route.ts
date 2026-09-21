import { createId, getDatabase } from "@/data/mockDatabase";
import { notFound, ok, validationError } from "@/lib/api/responses";
import { consultationSchema } from "@/schemas/consultationSchema";

export function GET() {
  return ok(getDatabase().consultations.toSorted((a, b) => a.date.localeCompare(b.date)));
}

export async function POST(request: Request) {
  const result = consultationSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) return validationError(result.error);
  const database = getDatabase();
  const patient = database.patients.find((item) => item.id === result.data.patientId);
  if (!patient) return notFound("Paciente");
  const consultation = {
    ...result.data,
    id: createId("consulta"),
    patientName: patient.name,
    nutritionistId: "demo-nutritionist",
  };
  database.consultations.push(consultation);
  patient.nextConsultation = consultation.date;
  return ok(consultation, "Consulta programada correctamente.", 201);
}
