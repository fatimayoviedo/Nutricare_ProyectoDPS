import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function ok<T>(data: T, message?: string, status = 200) {
  const total = Array.isArray(data) ? data.length : 1;
  return NextResponse.json({ data, message, meta: { total } }, { status });
}

export function notFound(entity: string) {
  return NextResponse.json({ message: `${entity} no encontrado.` }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ message }, { status: 409 });
}

export function validationError(error: ZodError) {
  return NextResponse.json(
    { message: "Revisa los datos ingresados.", issues: error.flatten().fieldErrors },
    { status: 400 },
  );
}
