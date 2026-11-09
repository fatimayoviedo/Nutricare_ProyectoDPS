import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ service: "NutriCare Web", status: "ok", dataMode: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "firestore" : "demo" });
}
