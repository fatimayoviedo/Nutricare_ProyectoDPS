import type { ApiFailure, ApiSuccess } from "@/types";

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      cache: "no-store",
      signal: options?.signal ?? AbortSignal.timeout(10_000),
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "TimeoutError") throw new Error("La solicitud tardó demasiado. Inténtalo nuevamente.");
    throw new Error("No fue posible conectar con el servicio.");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiFailure | null;
    throw new Error(body?.message ?? "No fue posible completar la solicitud");
  }
  const body = (await response.json()) as ApiSuccess<T> | null;
  if (!body || !("data" in body)) throw new Error("La respuesta del servicio no tiene el formato esperado.");
  return body.data;
}
