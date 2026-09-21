"use client";

import { Bell, CheckCheck, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/utils/constants";
import { Brand } from "./Brand";

const patientNotifications = [
  { id: "plan-today", category: "meals", title: "Plan de hoy", detail: "Tienes comidas pendientes por completar.", expanded: "Revisa el almuerzo, la merienda y la cena de tu plan de hoy.", time: "Ahora", href: "/dashboard", action: "Ver plan de hoy" },
  { id: "water-today", category: "water", title: "Registro de agua", detail: "Actualiza los vasos que has tomado hoy.", expanded: "Llevas 5 de 8 vasos. Puedes actualizar tu registro desde el Inicio.", time: "Hoy", href: "/dashboard", action: "Registrar agua" },
  { id: "next-appointment", category: "appointments", title: "Próxima consulta", detail: "Miércoles a las 3:00 p. m.", expanded: "Tu próxima consulta nutricional está programada para el miércoles a las 3:00 p. m.", time: "Recordatorio" },
];

const nutritionistNotifications = [
  { id: "nutritionist-consultation", category: "consultations", title: "Próxima consulta", detail: "Gerardo Peña · Hoy, 10:30 a. m.", expanded: "Consulta de seguimiento mensual por videollamada. Revisa las mediciones y el plan antes de iniciar.", time: "En 30 min", href: "/consultas", action: "Abrir consultas" },
  { id: "nutritionist-meal-photo", category: "mealPhotos", title: "Nueva fotografía de comida", detail: "Gerardo Peña registró su almuerzo.", expanded: "El paciente agregó una fotografía y un comentario a su registro de comidas de hoy.", time: "Hoy", href: "/fotografias?estado=pendiente", action: "Revisar fotografía" },
  { id: "nutritionist-plan-review", category: "planReviews", title: "Plan próximo a revisión", detail: "El plan de Carlos Ramírez finaliza esta semana.", expanded: "Prepara la actualización mensual de porciones y objetivos para mantener la continuidad del seguimiento.", time: "Recordatorio", href: "/planes", action: "Revisar planes" },
];

const READ_NOTIFICATIONS_KEY = "nutricare_read_notifications";
const PREFERENCES_KEY = "nutricare_notification_preferences";
const defaultNotificationPreferences = { meals: true, water: true, appointments: true, consultations: true, mealPhotos: true, planReviews: true };

function getInitials(name: string) {
  return name.split(" ").filter((part) => part && !/^(dra|dr|licda|lic)\.?$/i.test(part)).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState(defaultNotificationPreferences);
  const isPatient = user?.role === "patient";
  const notificationStorageKey = `${READ_NOTIFICATIONS_KEY}_${user?.role ?? "guest"}`;
  const preferencesStorageKey = isPatient ? PREFERENCES_KEY : `${PREFERENCES_KEY}_nutritionist`;

  useEffect(() => {
    function loadNotificationState() {
      const storedRead = window.localStorage.getItem(notificationStorageKey);
      const storedPreferences = window.localStorage.getItem(preferencesStorageKey);
      try { if (storedRead) setReadNotifications(JSON.parse(storedRead) as string[]); } catch { setReadNotifications([]); }
      try { if (storedPreferences) setNotificationPreferences((current) => ({ ...current, ...JSON.parse(storedPreferences) })); } catch {}
    }
    loadNotificationState();
    window.addEventListener("storage", loadNotificationState);
    window.addEventListener("nutricare-notification-preferences-change", loadNotificationState);
    return () => {
      window.removeEventListener("storage", loadNotificationState);
      window.removeEventListener("nutricare-notification-preferences-change", loadNotificationState);
    };
  }, [notificationStorageKey, preferencesStorageKey]);

  const visibleNotifications = useMemo(() => {
    const notifications = isPatient ? patientNotifications : nutritionistNotifications;
    return notifications.filter((notification) => notificationPreferences[notification.category as keyof typeof notificationPreferences]);
  }, [isPatient, notificationPreferences]);
  const unreadCount = visibleNotifications.filter((notification) => !readNotifications.includes(notification.id)).length;

  function saveReadNotifications(ids: string[]) {
    setReadNotifications(ids);
    window.localStorage.setItem(notificationStorageKey, JSON.stringify(ids));
  }

  function openNotification(id: string) {
    if (!readNotifications.includes(id)) saveReadNotifications([...readNotifications, id]);
    setExpandedNotification((current) => current === id ? null : id);
  }

  function markAllAsRead() {
    saveReadNotifications(Array.from(new Set([...readNotifications, ...visibleNotifications.map((notification) => notification.id)])));
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }
  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur md:px-8">
      <div className="lg:hidden"><Brand /></div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <div className="relative">
          <button type="button" onClick={() => setNotificationsOpen((open) => !open)} className="relative rounded-full border border-[var(--border)] p-2.5 text-[var(--ink-muted)] transition hover:border-[var(--primary)] hover:bg-[var(--soft-green)] hover:text-[var(--primary)]" aria-label="Notificaciones" aria-expanded={notificationsOpen}>
            <Bell className="size-5" />
            {unreadCount > 0 ? <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-orange-400" aria-label={`${unreadCount} notificaciones sin leer`} /> : null}
          </button>
          {notificationsOpen ? <div className="absolute right-0 top-14 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[0_18px_50px_rgba(23,53,46,0.18)]">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4"><div><h2 className="font-bold">Notificaciones</h2><p className="mt-1 text-xs text-[var(--ink-muted)]">{unreadCount > 0 ? `${unreadCount} sin leer` : "Estás al día"}</p></div>{unreadCount > 0 ? <button type="button" onClick={markAllAsRead} className="flex items-center gap-1 text-xs font-bold text-[var(--primary)]"><CheckCheck className="size-4" /> Marcar todas</button> : null}</div>
            <div className="max-h-[28rem] divide-y divide-[var(--border)] overflow-y-auto">{visibleNotifications.length > 0 ? visibleNotifications.map((notification) => {
              const isRead = readNotifications.includes(notification.id);
              const isExpanded = expandedNotification === notification.id;
              return <div key={notification.id} className={isRead ? "bg-white" : "bg-[var(--soft-green)]/45"}><button type="button" onClick={() => openNotification(notification.id)} className="w-full px-5 py-4 text-left"><div className="flex items-start gap-3"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${isRead ? "bg-transparent" : "bg-orange-400"}`} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm font-bold">{notification.title}</p><span className="text-[10px] font-semibold text-[var(--primary)]">{isRead ? "Leída" : notification.time}</span></div><p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">{notification.detail}</p></div><ChevronDown className={`mt-1 size-4 shrink-0 text-[var(--ink-muted)] transition ${isExpanded ? "rotate-180" : ""}`} /></div></button>{isExpanded ? <div className="px-10 pb-4"><p className="text-xs leading-5 text-[var(--ink-muted)]">{notification.expanded}</p>{notification.href && notification.action ? <Link href={notification.href} onClick={() => setNotificationsOpen(false)} className="mt-2 inline-flex text-xs font-bold text-[var(--primary)]">{notification.action} →</Link> : null}</div> : null}</div>;
            }) : <p className="px-5 py-8 text-center text-sm text-[var(--ink-muted)]">No tienes notificaciones activas.</p>}</div>
          </div> : null}
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold">{user?.name ?? "Vista de demostración"}</p>
          <p className="text-xs text-[var(--ink-muted)]">{user ? ROLE_LABELS[user.role] : "Nutricionista"}</p>
        </div>
        <Link href="/perfil" onClick={() => setNotificationsOpen(false)} className="grid size-10 place-items-center rounded-full bg-[var(--lime)] font-bold text-[var(--primary-dark)] transition hover:ring-4 hover:ring-[var(--primary-ring)]" aria-label={`Abrir perfil de ${user?.name ?? "usuario"}`}>{getInitials(user?.name ?? (isPatient ? "Gerardo Peña" : "Fátima Oviedo"))}</Link>
        <button type="button" onClick={handleLogout} className="rounded-full border border-[var(--border)] p-2.5 text-[var(--ink-muted)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600" aria-label="Cerrar sesión">
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}
