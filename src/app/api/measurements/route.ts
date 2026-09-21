import { createId, getDatabase } from "@/data/mockDatabase";
import { ok, validationError } from "@/lib/api/responses";
import { measurementSchema } from "@/schemas/measurementSchema";
import { calculateBMI } from "@/utils/calculateBMI";

export function GET(request: Request) {
  const patientId = new URL(request.url).searchParams.get("patientId");
  const measurements = getDatabase().measurements
    .filter((item) => (patientId ? item.patientId === patientId : true))
    .toSorted((a, b) => b.date.localeCompare(a.date));
  return ok(measurements);
}

export async function POST(request: Request) {
  const result = measurementSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) return validationError(result.error);
  const patient = getDatabase().patients.find((item) => item.id === result.data.patientId);
  const heightCm = patient?.heightCm ?? result.data.heightCm;
  const measurement = {
    ...result.data,
    heightCm,
    photoUrl: result.data.photoUrl || undefined,
    id: createId("medicion"),
    bmi: calculateBMI(result.data.weightKg, heightCm),
  };
  getDatabase().measurements.push(measurement);
  return ok(measurement, "Medición registrada y procesada correctamente.", 201);
}
