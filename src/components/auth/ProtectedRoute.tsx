"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";
import type { UserRole } from "@/types";

export function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: UserRole[] }) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const authorized = Boolean(user && (!allowedRoles || allowedRoles.includes(user.role)));

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    else if (!authorized) router.replace("/dashboard");
  }, [authorized, loading, pathname, router, user]);

  if (loading || !authorized) return <div className="grid min-h-screen place-items-center"><Spinner label="Verificando acceso" /></div>;
  return <>{children}</>;
}
