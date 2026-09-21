"use client";

import { Bell, Check, ChevronDown, LockKeyhole, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types";
import { calculateAge } from "@/utils/calculateAge";
import { ROLE_LABELS } from "@/utils/constants";
import { getErrorMessage } from "@/utils/errorHandler";

type Section = "personal" | "notifications" | "security" | null;
type NotificationPreferences = { meals: boolean; water: boolean; appointments: boolean; consultations: boolean; mealPhotos: boolean; planReviews: boolean };

const PREFERENCES_KEY = "nutricare_notification_preferences";
const defaultPreferences: NotificationPreferences = { meals: true, water: true, appointments: true, consultations: true, mealPhotos: true, planReviews: true };

const sections = [
  { id: "personal" as const, icon: UserRound, title: "Datos personales", copy: "Nombre y correo" },
  { id: "notifications" as const, icon: Bell, title: "Notificaciones", copy: "Recordatorios y novedades" },
  { id: "security" as const, icon: LockKeyhole, title: "Seguridad", copy: "Contraseña y sesiones" },
];

function PreferenceToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] p-4">
      <div><p className="text-sm font-bold">{label}</p><p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">{description}</p></div>
      <button type="button" role="switch" aria-label={label} aria-checked={checked} onClick={onChange} className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-[var(--primary)]" : "bg-slate-300"}`}>
        <span className={`absolute top-1 grid size-5 place-items-center rounded-full bg-white text-[var(--primary)] shadow-sm transition ${checked ? "left-6" : "left-1"}`}>{checked ? <Check className="size-3" /> : null}</span>
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const isNutritionist = user?.role === "nutritionist";
  const preferencesStorageKey = isNutritionist ? `${PREFERENCES_KEY}_nutritionist` : PREFERENCES_KEY;
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [name, setName] = useState(user?.name ?? "Gerardo Peña");
  const [email, setEmail] = useState(user?.email ?? "paciente@nutricare.com");
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clinicalProfile, setClinicalProfile] = useState<Patient | null>(null);

  const displayName = user?.name ?? name;
  const initials = displayName.split(" ").filter((part) => part && !/^(dra|dr|licda|lic)\.?$/i.test(part)).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    const stored = window.localStorage.getItem(preferencesStorageKey);
    window.queueMicrotask(() => {
      if (!stored) { setPreferences(defaultPreferences); return; }
      try { setPreferences({ ...defaultPreferences, ...JSON.parse(stored) as NotificationPreferences }); }
      catch { setPreferences(defaultPreferences); }
    });
  }, [preferencesStorageKey]);

  useEffect(() => {
    if (user?.role !== "patient") return;
    patientService.get(user.id).then(setClinicalProfile).catch(() => setClinicalProfile(null));
  }, [user]);

  function openSection(section: Section) {
    setMessage(null);
    setError(null);
    if (section === "personal" && user) { setName(user.name); setEmail(user.email); }
    setActiveSection((current) => current === section ? null : section);
  }

  async function savePersonalData(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setMessage(null); setError(null);
    try {
      await updateProfile(name, email);
      setMessage("Tus datos personales se actualizaron correctamente.");
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { setSaving(false); }
  }

  function savePreferences(event: FormEvent) {
    event.preventDefault();
    window.localStorage.setItem(preferencesStorageKey, JSON.stringify(preferences));
    window.dispatchEvent(new Event("nutricare-notification-preferences-change"));
    setError(null);
    setMessage("Tus preferencias de notificaciones quedaron guardadas.");
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setMessage(null); setError(null);
    if (newPassword !== confirmPassword) { setError("Las contraseñas nuevas no coinciden."); return; }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setMessage("Tu contraseña se actualizó correctamente.");
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { setSaving(false); }
  }

  return (
    <>
      <PageHeader title="Mi perfil" description="Información de cuenta, rol y preferencias." />
      <div className="grid gap-6 xl:grid-cols-[0.45fr_1fr]">
        <Card className="h-fit text-center"><span className="mx-auto grid size-24 place-items-center rounded-full bg-[var(--lime)] text-2xl font-extrabold">{initials}</span><h2 className="mt-5 text-xl font-bold">{displayName}</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">{user ? ROLE_LABELS[user.role] : "Paciente"}</p><span className="mt-4 inline-flex rounded-full bg-[var(--soft-green)] px-3 py-1 text-xs font-bold text-[var(--primary)]">Cuenta activa</span>{clinicalProfile ? <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-5 text-left"><div><p className="text-xs text-[var(--ink-muted)]">Edad calculada</p><p className="mt-1 font-bold">{calculateAge(clinicalProfile.dateOfBirth)} años</p></div><div><p className="text-xs text-[var(--ink-muted)]">Sexo</p><p className="mt-1 font-bold">{clinicalProfile.sex === "female" ? "Mujer" : "Hombre"}</p></div></div> : null}</Card>
        <Card>
          <h2 className="text-xl font-bold">Configuración</h2>
          <div className="mt-5 divide-y divide-[var(--border)]">
            {sections.map(({ id, icon: ItemIcon, title, copy }) => (
              <div key={id}>
                <button type="button" onClick={() => openSection(id)} className="flex w-full items-center gap-4 py-5 text-left" aria-expanded={activeSection === id}>
                  <span className="grid size-11 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--primary)]"><ItemIcon /></span>
                  <div className="flex-1"><p className="font-bold">{title}</p><p className="mt-1 text-sm text-[var(--ink-muted)]">{copy}</p></div>
                  <ChevronDown className={`size-5 text-[var(--ink-muted)] transition ${activeSection === id ? "rotate-180" : ""}`} />
                </button>

                {activeSection === id ? <div className="pb-6 sm:pl-15">
                  {message ? <div className="mb-4"><Alert>{message}</Alert></div> : null}
                  {error ? <div className="mb-4"><Alert tone="error">{error}</Alert></div> : null}

                  {id === "personal" ? <form onSubmit={savePersonalData} className="grid gap-4 sm:grid-cols-2"><Input label="Nombre completo" value={name} onChange={(event) => setName(event.target.value)} required /><Input label="Correo electrónico" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><div className="sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button></div></form> : null}

                  {id === "notifications" ? <form onSubmit={savePreferences} className="grid gap-3">{isNutritionist ? <><PreferenceToggle label="Próximas consultas" description="Avisos de citas próximas y seguimientos programados con pacientes." checked={preferences.consultations} onChange={() => setPreferences((value) => ({ ...value, consultations: !value.consultations }))} /><PreferenceToggle label="Fotografías nuevas de comidas" description="Alertas cuando un paciente registre evidencia de sus comidas." checked={preferences.mealPhotos} onChange={() => setPreferences((value) => ({ ...value, mealPhotos: !value.mealPhotos }))} /><PreferenceToggle label="Planes próximos a revisión" description="Recordatorios de planes mensuales que requieren actualización." checked={preferences.planReviews} onChange={() => setPreferences((value) => ({ ...value, planReviews: !value.planReviews }))} /></> : <><PreferenceToggle label="Recordatorios de comidas" description="Avisos sobre comidas pendientes del plan." checked={preferences.meals} onChange={() => setPreferences((value) => ({ ...value, meals: !value.meals }))} /><PreferenceToggle label="Registro de agua" description="Recordatorios para mantener tu hidratación al día." checked={preferences.water} onChange={() => setPreferences((value) => ({ ...value, water: !value.water }))} /><PreferenceToggle label="Próximas consultas" description="Avisos antes de tus citas con nutrición." checked={preferences.appointments} onChange={() => setPreferences((value) => ({ ...value, appointments: !value.appointments }))} /></>}<div className="mt-1"><Button type="submit">Guardar preferencias</Button></div></form> : null}

                  {id === "security" ? <form onSubmit={savePassword} className="grid gap-4"><Input label="Contraseña actual" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /><div className="grid gap-4 sm:grid-cols-2"><Input label="Nueva contraseña" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /><Input label="Confirmar contraseña" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div><p className="text-xs text-[var(--ink-muted)]">Utiliza al menos 8 caracteres.</p><div><Button type="submit" disabled={saving}>{saving ? "Actualizando..." : "Cambiar contraseña"}</Button></div></form> : null}
                </div> : null}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
