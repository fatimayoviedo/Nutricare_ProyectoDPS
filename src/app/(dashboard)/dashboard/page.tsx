import type { Metadata } from "next";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";

export const metadata: Metadata = { title: "Panel principal" };

export default function DashboardPage() {
  return <RoleDashboard />;
}
