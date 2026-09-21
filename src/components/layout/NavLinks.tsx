"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardList,
  Home,
  Images,
  Ruler,
  UserRound,
  UsersRound,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { DASHBOARD_LINKS } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";

const icons: Record<(typeof DASHBOARD_LINKS)[number]["icon"], LucideIcon> = {
  home: Home,
  users: UsersRound,
  calendar: CalendarDays,
  clipboard: ClipboardList,
  images: Images,
  ruler: Ruler,
  chart: ChartNoAxesCombined,
  utensils: Utensils,
  user: UserRound,
};

export function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const roleLinks = DASHBOARD_LINKS.filter(({ roles }) => user && roles.some((role) => role === user.role));
  const preferredMobile = user?.role === "nutritionist"
    ? ["/dashboard", "/pacientes", "/planes", "/perfil"]
    : ["/dashboard", "/planes", "/progreso", "/perfil"];
  const links = mobile ? roleLinks.filter(({ href }) => preferredMobile.includes(href)) : roleLinks;

  return (
    <nav className={mobile ? "grid grid-cols-4" : "grid gap-1"} aria-label="Navegación principal">
      {links.map(({ href, label, icon }) => {
        const Icon = icons[icon];
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={
              mobile
                ? `flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl text-[11px] ${active ? "bg-[var(--soft-green)] font-bold text-[var(--primary)]" : "text-[var(--ink-muted)]"}`
                : `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-[var(--soft-green)] text-[var(--primary)]" : "text-[var(--ink-muted)] hover:bg-slate-50 hover:text-[var(--ink)]"}`
            }
          >
            <Icon className={mobile ? "size-5" : "size-[18px]"} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
