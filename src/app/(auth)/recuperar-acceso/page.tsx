import type { Metadata } from "next";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";

export const metadata: Metadata = { title: "Recuperar acceso" };

export default function PasswordResetPage() {
  return <PasswordResetForm />;
}
