import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ConsultationsLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={["nutritionist"]}>{children}</ProtectedRoute>;
}
