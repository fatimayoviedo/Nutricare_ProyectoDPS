import { getDatabase } from "@/data/mockDatabase";
import { notFound, ok } from "@/lib/api/responses";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const database = getDatabase();
  const index = database.measurements.findIndex((item) => item.id === id);
  if (index < 0) return notFound("Medición");
  const [measurement] = database.measurements.splice(index, 1);
  return ok(measurement, "Medición eliminada.");
}
