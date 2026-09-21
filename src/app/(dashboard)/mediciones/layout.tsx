import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MeasurementsLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={["nutritionist"]}>{children}</ProtectedRoute>;
}
