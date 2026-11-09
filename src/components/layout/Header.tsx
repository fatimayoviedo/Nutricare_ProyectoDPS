"use client";

import { Bell, CheckCheck, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/utils/constants";
import { listNotifications, type AppNotification } from '@/services/notificationService';
import { preferenceService } from '@/services/preferenceService';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getErrorMessage } from '@/utils/errorHandler';
import { Brand } from "./Brand";

const defaultNotificationPreferences = { meals: true, water: true, appointments: true, consultations: true, mealPhotos: true, planReviews: true };

function getInitials(name: string) {
  return name.split(" ").filter((part) => part && !/^(dra|dr|licda|lic)\.?$/i.test(part)).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationError, setNotificationError] = useState('');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState(defaultNotificationPreferences);
  const isPatient = user?.role === "patient";

  useEffect(() => {
    let active=true;
    async function load() {
      try { const [items, settings] = await Promise.all([listNotifications(isPatient), preferenceService.get()]);
        if(active) {setNotifications(items);setReadNotifications(settings.readNotifications);setNotificationPreferences(settings.preferences);setNotificationError('');}
      } catch(error) {if(active) setNotificationError(getErrorMessage(error));}
    }
    void load(); window.addEventListener('nutricare-notification-preferences-change', load);
    return () => {active=false;window.removeEventListener('nutricare-notification-preferences-change', load);};
  }, [isPatient, pathname, notificationsOpen]);
  const visibleNotifications = useMemo(() => notifications.filter(item => notificationPreferences[item.category as keyof typeof notificationPreferences]), [notifications, notificationPreferences]);
  const unreadCount = visibleNotifications.filter((notification) => !readNotifications.includes(notification.id)).length;

  function saveReadNotifications(ids: string[]) {
    setReadNotifications(ids);
    void preferenceService.save({readNotifications:ids}).catch(error => setNotificationError(getErrorMessage(error)));
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
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4"><div><h2 className="font-bold">Notificaciones</h2>{notificationError && <p role="alert" className="mt-2 text-xs text-red-600">{notificationError}</p>}<p className="mt-1 text-xs text-[var(--ink-muted)]">{unreadCount > 0 ? `${unreadCount} sin leer` : "Estás al día"}</p></div>{unreadCount > 0 ? <button type="button" onClick={markAllAsRead} className="flex items-center gap-1 text-xs font-bold text-[var(--primary)]"><CheckCheck className="size-4" /> Marcar todas</button> : null}</div>
            <div className="max-h-[28rem] divide-y divide-[var(--border)] overflow-y-auto">{visibleNotifications.length > 0 ? visibleNotifications.map((notification) => {
              const isRead = readNotifications.includes(notification.id);
              const isExpanded = expandedNotification === notification.id;
              return <div key={notification.id} className={isRead ? "bg-white" : "bg-[var(--soft-green)]/45"}><button type="button" onClick={() => openNotification(notification.id)} className="w-full px-5 py-4 text-left"><div className="flex items-start gap-3"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${isRead ? "bg-transparent" : "bg-orange-400"}`} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm font-bold">{notification.title}</p><span className="text-[10px] font-semibold text-[var(--primary)]">{isRead ? "Leída" : notification.time}</span></div><p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">{notification.detail}</p></div><ChevronDown className={`mt-1 size-4 shrink-0 text-[var(--ink-muted)] transition ${isExpanded ? "rotate-180" : ""}`} /></div></button>{isExpanded ? <div className="px-10 pb-4"><p className="text-xs leading-5 text-[var(--ink-muted)]">{notification.expanded}</p>{notification.href && notification.action ? <Link href={notification.href} onClick={() => setNotificationsOpen(false)} className="mt-2 inline-flex text-xs font-bold text-[var(--primary)]">{notification.action} →</Link> : null}</div> : null}</div>;
            }) : <p className="px-5 py-8 text-center text-sm text-[var(--ink-muted)]">No tienes notificaciones activas.</p>}</div>
          </div> : null}
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold">{user?.name ?? "Usuario"}</p>
          <p className="text-xs text-[var(--ink-muted)]">{user ? ROLE_LABELS[user.role] : "Nutricionista"}</p>
        </div>
        <Link href="/perfil" onClick={() => setNotificationsOpen(false)} className="grid size-10 place-items-center rounded-full bg-[var(--lime)] font-bold text-[var(--primary-dark)] transition hover:ring-4 hover:ring-[var(--primary-ring)]" aria-label={`Abrir perfil de ${user?.name ?? "usuario"}`}>{getInitials(user?.name ?? "Usuario")}</Link>
        <button type="button" onClick={() => setLogoutOpen(true)} className="rounded-full border border-[var(--border)] p-2.5 text-[var(--ink-muted)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600" aria-label="Cerrar sesión">
          <LogOut className="size-5" />
        </button>
      </div>
      <ConfirmDialog open={logoutOpen} title="¿Cerrar sesión?" description="Podrás volver a ingresar con tu cuenta de NutriCare." confirmLabel="Sí, cerrar sesión" onCancel={() => setLogoutOpen(false)} onConfirm={() => void handleLogout().catch(error => setNotificationError(getErrorMessage(error)))} />
    </header>
  );
}
