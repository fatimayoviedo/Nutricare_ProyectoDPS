import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ service: "NutriCare API", status: "ok", phase: 2, dataMode: "mock-rest" });
}
