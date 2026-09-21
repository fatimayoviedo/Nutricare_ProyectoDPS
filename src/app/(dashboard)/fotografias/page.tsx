"use client";

import { Check, ImageIcon, MessageSquareText, UserRoundCheck } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { ensureDemoMealPhotos, getStoredPhotos, storePhoto, type StoredMealPhoto } from "@/services/mealPhotoService";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types";

interface ReviewPhoto extends StoredMealPhoto { url: string }

const mealLabels: Record<string, string> = {
  breakfast: "Desayuno",
  "morning-snack": "Merienda de la mañana",
  lunch: "Almuerzo",
  "afternoon-snack": "Merienda de la tarde",
  dinner: "Cena",
};

function MealPhotoReviewContent() {
  const searchParams = useSearchParams();
  const requestedStatus = searchParams.get("estado");
  const [photos, setPhotos] = useState<ReviewPhoto[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientFilter, setPatientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState(() => requestedStatus === "pendiente" ? "pending" : "all");
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [nutritionistComment, setNutritionistComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentConfirmationOpen, setCommentConfirmationOpen] = useState(false);
  const [commentSavedOpen, setCommentSavedOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const urls: string[] = [];
    Promise.all([ensureDemoMealPhotos().then(() => getStoredPhotos()), patientService.list()])
      .then(([records, patientData]) => {
        if (!active) return;
        setPatients(patientData);
        setPhotos(records.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)).map((record) => {
          const url = URL.createObjectURL(record.file);
          urls.push(url);
          return { ...record, url };
        }));
      })
      .catch(() => setError("No fue posible cargar las fotografías de seguimiento."))
      .finally(() => setLoading(false));
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  const filteredPhotos = useMemo(() => photos.filter((photo) => {
    const matchesPatient = patientFilter === "all" || photo.patientId === patientFilter;
    const matchesStatus = statusFilter === "all" || (statusFilter === "commented" ? Boolean(photo.nutritionistComment) : photo.reviewStatus === statusFilter);
    return matchesPatient && matchesStatus;
  }), [patientFilter, photos, statusFilter]);
  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId);
  const pendingCount = photos.filter((photo) => photo.reviewStatus === "pending").length;
  const approvedCount = photos.filter((photo) => photo.reviewStatus === "approved").length;
  const commentedCount = photos.filter((photo) => photo.nutritionistComment).length;

  function openPhoto(photo: ReviewPhoto) {
    setSelectedPhotoId(photo.id);
    setNutritionistComment(photo.nutritionistComment);
    setMessage(null);
    setError(null);
  }

  async function updatePhoto(photo: ReviewPhoto, changes: Partial<StoredMealPhoto>, successMessage: string) {
    const updated: StoredMealPhoto = { ...photo, ...changes };
    try {
      await storePhoto(updated);
      setPhotos((current) => current.map((item) => item.id === photo.id ? { ...item, ...changes } : item));
      setMessage(successMessage);
      return true;
    } catch { setError("No fue posible actualizar la revisión. Inténtalo nuevamente."); return false; }
  }

  async function approvePhoto(photo: ReviewPhoto) {
    await updatePhoto(photo, { reviewStatus: "approved", reviewedAt: new Date().toISOString() }, "Fotografía aprobada correctamente.");
  }

  async function saveComment(event: FormEvent) {
    event.preventDefault();
    if (!selectedPhoto) return;
    const comment = nutritionistComment.trim();
    if (!comment) {
      setError("Escribe un comentario antes de guardar la retroalimentación.");
      return;
    }
    setCommentConfirmationOpen(true);
  }

  async function confirmSaveComment() {
    if (!selectedPhoto) return;
    const wasApproved = selectedPhoto.reviewStatus === "approved";
    const saved = await updatePhoto(selectedPhoto, { nutritionistComment: nutritionistComment.trim(), reviewedAt: new Date().toISOString() }, wasApproved ? "Comentario guardado y visible para el paciente." : "Retroalimentación guardada. La fotografía continúa pendiente de aprobación.");
    setCommentConfirmationOpen(false);
    if (saved) setCommentSavedOpen(true);
  }

  if (loading) return <div className="grid min-h-80 place-items-center"><Spinner label="Cargando fotografías" /></div>;

  return (
    <>
      <PageHeader title="Fotografías de comidas" description="Revisa las evidencias enviadas por tus pacientes, apruébalas o deja observaciones." />
      {message ? <div className="mb-5"><Alert>{message}</Alert></div> : null}
      {error ? <div className="mb-5"><Alert tone="error">{error}</Alert></div> : null}

      <div className="grid gap-4 sm:grid-cols-3"><Card><ImageIcon className="text-[var(--primary)]" /><p className="mt-4 text-sm text-[var(--ink-muted)]">Pendientes de revisión</p><p className="mt-1 text-3xl font-extrabold">{pendingCount}</p></Card><Card><UserRoundCheck className="text-[var(--primary)]" /><p className="mt-4 text-sm text-[var(--ink-muted)]">Fotografías aprobadas</p><p className="mt-1 text-3xl font-extrabold">{approvedCount}</p></Card><Card><MessageSquareText className="text-[var(--primary)]" /><p className="mt-4 text-sm text-[var(--ink-muted)]">Con comentarios</p><p className="mt-1 text-3xl font-extrabold">{commentedCount}</p></Card></div>

      <Card className="mt-6 grid gap-4 md:grid-cols-2"><Select label="Filtrar por paciente" value={patientFilter} onChange={(event) => setPatientFilter(event.target.value)}><option value="all">Todos los pacientes</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</Select><Select label="Estado de revisión" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Todos los estados</option><option value="pending">Pendientes</option><option value="approved">Aprobadas</option><option value="commented">Con comentarios</option></Select></Card>

      {filteredPhotos.length > 0 ? <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredPhotos.map((photo) => { const patient = patients.find((item) => item.id === photo.patientId); return <Card key={photo.id} className="overflow-hidden p-0"><button type="button" onClick={() => openPhoto(photo)} className="block w-full"><Image src={photo.url} alt={`Fotografía de ${mealLabels[photo.mealId] ?? "comida"} de ${patient?.name ?? "paciente"}`} width={900} height={560} unoptimized className="h-52 w-full object-cover" /></button><div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[var(--primary)]">{mealLabels[photo.mealId] ?? "Comida"}</p><h2 className="mt-1 font-bold">{patient?.name ?? "Paciente"}</h2></div><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${photo.reviewStatus === "approved" ? "bg-[var(--soft-green)] text-[var(--primary)]" : "bg-orange-50 text-orange-700"}`}>{photo.reviewStatus === "approved" ? "Aprobada" : "Pendiente"}</span></div><p className="mt-3 text-sm text-[var(--ink-muted)]">{photo.comment || "Sin comentario del paciente."}</p>{photo.nutritionistComment ? <p className="mt-3 rounded-xl bg-[var(--surface-muted)] p-3 text-xs text-[var(--ink-muted)]"><strong className="text-[var(--ink)]">Tu comentario:</strong> {photo.nutritionistComment}</p> : null}<div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => openPhoto(photo)} className="min-h-10 rounded-xl border border-[var(--primary)] px-3 text-sm font-bold text-[var(--primary)]">Ver y comentar</button><button type="button" disabled={photo.reviewStatus === "approved"} onClick={() => void approvePhoto(photo)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-3 text-sm font-bold text-white disabled:bg-slate-300"><Check className="size-4" /> {photo.reviewStatus === "approved" ? "Aprobada" : "Aprobar"}</button></div></div></Card>; })}</div> : <Card className="mt-6 grid min-h-56 place-items-center text-center"><div><ImageIcon className="mx-auto size-10 text-slate-300" /><p className="mt-3 font-bold">No hay fotografías con estos filtros</p><p className="mt-1 text-sm text-[var(--ink-muted)]">Prueba seleccionando otro paciente o estado.</p></div></Card>}

      <Modal open={Boolean(selectedPhoto)} title="Revisión de fotografía" onClose={() => setSelectedPhotoId(null)} size="xl">
        {selectedPhoto ? <form onSubmit={saveComment} className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start"><div className="grid gap-4"><Image src={selectedPhoto.url} alt="Evidencia de comida" width={900} height={560} unoptimized className="max-h-[52vh] min-h-56 w-full rounded-2xl bg-[var(--surface-muted)] object-contain" /><div className="grid gap-1"><p className="text-sm font-bold">{patients.find((patient) => patient.id === selectedPhoto.patientId)?.name}</p><p className="text-sm text-[var(--ink-muted)]">{mealLabels[selectedPhoto.mealId] ?? "Comida"} · {new Date(selectedPhoto.createdAt).toLocaleDateString("es-SV")}</p>{selectedPhoto.comment ? <p className="mt-2 rounded-xl bg-[var(--surface-muted)] p-3 text-sm text-[var(--ink-muted)]">Comentario del paciente: {selectedPhoto.comment}</p> : null}</div></div><div className="grid gap-4"><label className="grid gap-2 text-sm font-medium">Comentario para el paciente<textarea value={nutritionistComment} onChange={(event) => { setNutritionistComment(event.target.value); setError(null); }} placeholder="Ej. Muy buena elección; procura mantener esta porción." rows={7} className="min-h-40 resize-y rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-ring)]" /></label>{selectedPhoto.reviewStatus === "pending" ? <p className="rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-800">Puedes guardar la retroalimentación sin aprobar la fotografía. Permanecerá pendiente para una revisión posterior.</p> : null}<div className="grid gap-2"><Button type="submit" fullWidth>Guardar comentario</Button><Button type="button" fullWidth onClick={() => void approvePhoto(selectedPhoto)} disabled={selectedPhoto.reviewStatus === "approved"}>{selectedPhoto.reviewStatus === "approved" ? "Fotografía aprobada" : "Aprobar fotografía"}</Button></div></div></form> : null}
      </Modal>
      <ConfirmDialog open={commentConfirmationOpen} title={selectedPhoto?.reviewStatus === "approved" ? "Guardar comentario" : "Guardar retroalimentación"} description={selectedPhoto?.reviewStatus === "approved" ? "El comentario quedará visible para el paciente." : "La retroalimentación quedará visible para el paciente y la fotografía continuará pendiente de aprobación."} confirmLabel="Sí, guardar" onCancel={() => setCommentConfirmationOpen(false)} onConfirm={() => void confirmSaveComment()} />
      <ConfirmDialog open={commentSavedOpen} title="Comentario guardado" description={selectedPhoto?.reviewStatus === "approved" ? "El comentario ya está disponible para el paciente." : "La retroalimentación se guardó correctamente sin aprobar la fotografía."} confirmLabel="Entendido" tone="success" onConfirm={() => setCommentSavedOpen(false)} />
    </>
  );
}

export default function MealPhotoReviewPage() {
  return <Suspense fallback={<div className="grid min-h-80 place-items-center"><Spinner label="Cargando fotografías" /></div>}><MealPhotoReviewContent /></Suspense>;
}
