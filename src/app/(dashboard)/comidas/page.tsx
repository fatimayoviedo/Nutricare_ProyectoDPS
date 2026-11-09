"use client";

import { Apple, Camera, Coffee, ImagePlus, Moon, Pencil, Soup, Trash2, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { patientService } from '@/services/patientService';
import { planService } from '@/services/planService';
import type { Patient, NutritionPlan } from '@/types';
import { getErrorMessage } from '@/utils/errorHandler';
import { localDate } from '@/utils/localDate';
import { deleteStoredPhoto, getStoredPhoto, getStoredPhotos, storePhoto, type StoredMealPhoto } from "@/services/mealPhotoService";

interface MealPhoto extends Omit<StoredMealPhoto, "file"> {
  url: string;
}

export default function MealsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState('');
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [saving, setSaving] = useState(false);
  const plan = plans.find(item => item.patientId === patientId && item.active && item.planMonth === localDate().slice(0,7));
  const meals = plan?.meals.map(item => ({...item, icon:UtensilsCrossed, detail:item.description, preparation:item.comments || item.portion})) ?? [
    {id:'breakfast',title:'Desayuno',time:'',icon:Coffee,detail:'',preparation:''},
    {id:'lunch',title:'Almuerzo',time:'',icon:Soup,detail:'',preparation:''},
    {id:'dinner',title:'Cena',time:'',icon:Moon,detail:'',preparation:''},
    {id:'snack',title:'Merienda',time:'',icon:Apple,detail:'',preparation:''},
  ];
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState("lunch");
  const [comment, setComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photos, setPhotos] = useState<MealPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<MealPhoto | null>(null);

  useEffect(() => {
    let active = true;
    const urls: string[] = [];
    Promise.all([getStoredPhotos(), patientService.list(), planService.list()]).then(([records, people, plans]) => {
      setPatients(people); setPatientId(people[0]?.id ?? ''); setPlans(plans);
      if (!active) return;
      const loaded = records.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)).map(({ file, ...record }) => {
        const url = URL.createObjectURL(file);
        urls.push(url);
        return { ...record, url };
      });
      setPhotos(loaded);
    }).catch(() => setError("No fue posible cargar las fotografías guardadas."));
    return () => { active = false; urls.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  function openUploader(mealId = "lunch") {
    setEditingPhotoId(null);
    setSelectedMeal(mealId);
    setComment("");
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setSavedMessage(null);
    setUploadOpen(true);
  }

  function openEditor(photo: MealPhoto) {
    setEditingPhotoId(photo.id);
    setPatientId(photo.patientId);
    setSelectedMeal(photo.mealId);
    setComment(photo.comment);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setSavedMessage(null);
    setUploadOpen(true);
  }

  function closePhotoForm() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadOpen(false);
    setEditingPhotoId(null);
  }

  function choosePhoto(file?: File) {
    setError(null);
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) { setError("Selecciona una fotografía JPG o PNG."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("La fotografía no debe superar los 10 MB."); return; }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function savePhoto(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!patientId) { setError("Tu nutricionista debe crear un expediente con tu correo verificado antes de subir fotografías."); return; }
    setSaving(true);
    if (editingPhotoId) {
      try {
        const stored = await getStoredPhoto(editingPhotoId);
        if (!stored) throw new Error("Fotografía no encontrada");
        await storePhoto({ ...stored, mealId: selectedMeal, comment: comment.trim() });
        setPhotos((current) => current.map((photo) => photo.id === editingPhotoId ? { ...photo, mealId: selectedMeal, comment: comment.trim() } : photo));
        closePhotoForm();
        setSavedMessage("Los datos de la fotografía se actualizaron correctamente.");
      } catch (cause) { setError(getErrorMessage(cause)); } finally { setSaving(false); }
      return;
    }
    if (!selectedFile) { setError("Primero toma o elige una fotografía."); setSaving(false); return; }
    const record: StoredMealPhoto = { id: crypto.randomUUID(), patientId, mealId: selectedMeal, comment: comment.trim(), createdAt: new Date().toISOString(), name: selectedFile.name, file: selectedFile, reviewStatus: "pending", nutritionistComment: "" };
    try {
      await storePhoto(record);
      const url = URL.createObjectURL(selectedFile);
      setPhotos((current) => [{ ...record, url }, ...current]);
      closePhotoForm();
      setSavedMessage("Fotografía guardada. Solo estará disponible dentro de NutriCare para el seguimiento nutricional.");
    } catch (cause) { setError(getErrorMessage(cause)); } finally { setSaving(false); }
  }

  async function deletePhoto() {
    if (!photoToDelete) return;
    try {
      await deleteStoredPhoto(photoToDelete.id);
      URL.revokeObjectURL(photoToDelete.url);
      setPhotos((current) => current.filter((item) => item.id !== photoToDelete.id));
      setPhotoToDelete(null);
      setSavedMessage("La fotografía fue eliminada.");
    } catch { setError("No fue posible eliminar la fotografía. Inténtalo nuevamente."); }
  }

  return (
    <>
      <PageHeader title="Comidas de hoy" description="Vista previa de tu plan diario, con porciones y una guía breve de preparación." action={<Button type="button" onClick={() => openUploader()}><Camera className="size-4" /> Agregar fotografía</Button>} />
      {error && !uploadOpen ? <Alert tone="error">{error}</Alert> : null}
      {!plan ? <Card>No hay un menú asignado para este mes. Puedes registrar tus comidas para revisarlas con tu nutricionista.</Card> : null}
      {patients.length > 1 ? <Select label="Expediente para enviar fotografías" value={patientId} onChange={event => setPatientId(event.target.value)}>{patients.map(patient => <option key={patient.id} value={patient.id}>{patient.name} · {patient.id.slice(0,8)}</option>)}</Select> : null}
      {savedMessage ? <div className="mb-5"><Alert>{savedMessage}</Alert></div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(plan ? meals : []).map(({ id, icon: Icon, time, title, detail, preparation }) => <Card key={id} className="flex h-full flex-col">
          <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--soft-green)] text-[var(--primary)]"><Icon /></span><div><p className="text-xs font-bold text-[var(--primary)]">{time}</p><h2 className="mt-1 text-lg font-bold">{title}</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">{detail}</p></div></div>
          <div className="mt-5 flex-1 rounded-2xl bg-[var(--surface-muted)] p-4"><div className="flex items-center gap-2 text-sm font-bold"><UtensilsCrossed className="size-4 text-[var(--primary)]" /> Preparación</div><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{preparation}</p></div>
          <button type="button" onClick={() => openUploader(id)} className="mt-4 inline-flex items-center gap-2 self-start text-sm font-bold text-[var(--primary)]"><ImagePlus className="size-4" /> Subir foto de esta comida</button>
        </Card>)}
      </div>

      {photos.length > 0 ? <section className="mt-8"><div className="mb-4"><h2 className="text-xl font-bold">Fotografías registradas</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">Evidencias privadas para tu seguimiento nutricional.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{photos.map((photo) => { const meal = meals.find((item) => item.id === photo.mealId); return <Card key={photo.id} className="overflow-hidden p-0"><Image src={photo.url} alt={`Fotografía de ${meal?.title ?? "comida"}`} width={640} height={400} unoptimized className="h-44 w-full object-cover" /><div className="p-4"><div className="flex items-center justify-between gap-3"><p className="font-bold">{meal?.title ?? "Comida"}</p><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${photo.reviewStatus === "approved" ? "bg-[var(--soft-green)] text-[var(--primary)]" : "bg-orange-50 text-orange-700"}`}>{photo.reviewStatus === "approved" ? "Aprobada" : "En revisión"}</span></div>{photo.comment ? <p className="mt-2 text-sm text-[var(--ink-muted)]">{photo.comment}</p> : null}{photo.nutritionistComment ? <div className="mt-3 rounded-xl bg-[var(--surface-muted)] p-3"><p className="text-xs font-bold text-[var(--primary)]">Comentario de tu nutricionista</p><p className="mt-1 text-sm text-[var(--ink-muted)]">{photo.nutritionistComment}</p></div> : null}<div className="mt-4 flex gap-2"><button type="button" onClick={() => openEditor(photo)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--primary)] px-3 text-sm font-bold text-[var(--primary)] transition hover:bg-[var(--soft-green)]"><Pencil className="size-4" /> Editar</button><button type="button" onClick={() => setPhotoToDelete(photo)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-bold text-red-600 transition hover:bg-red-50"><Trash2 className="size-4" /> Borrar</button></div></div></Card>; })}</div></section> : null}

      <Modal open={uploadOpen} title={editingPhotoId ? "Editar fotografía" : "Sube tu comida"} onClose={closePhotoForm}>
        <form onSubmit={savePhoto} className="grid gap-5">
          <div><p className="text-sm text-[var(--ink-muted)]">La fotografía se guarda de forma privada para el seguimiento con nutrición.</p></div>
          {editingPhotoId ? <Image src={photos.find((photo) => photo.id === editingPhotoId)?.url ?? ""} alt="Fotografía registrada" width={640} height={420} unoptimized className="h-48 w-full rounded-2xl object-cover" /> : <button type="button" onClick={() => inputRef.current?.click()} className="grid min-h-52 place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-emerald-200 bg-[var(--soft-green)] p-5 text-center">
            {previewUrl ? <Image src={previewUrl} alt="Vista previa de la comida" width={640} height={420} unoptimized className="h-48 w-full rounded-2xl object-cover" /> : <span><span className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--primary)] text-white"><ImagePlus className="size-7" /></span><strong className="mt-4 block">Tomar o elegir fotografía</strong><span className="mt-2 block text-xs text-[var(--ink-muted)]">JPG o PNG · máximo 10 MB</span></span>}
          </button>}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png" capture="environment" className="hidden" onChange={(event) => choosePhoto(event.target.files?.[0])} />
          <Select label="Tipo de comida" value={selectedMeal} onChange={(event) => setSelectedMeal(event.target.value)}>{meals.map((meal) => <option key={meal.id} value={meal.id}>{meal.title} · {meal.time}</option>)}</Select>
          <label className="grid gap-2 text-sm font-medium">Comentario opcional<textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Ej. Cambié arroz por papa" rows={3} className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary-ring)]" /></label>
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Button type="submit" disabled={saving} fullWidth>{saving ? "Guardando..." : editingPhotoId ? "Guardar cambios" : "Guardar fotografía"}</Button>
        </form>
      </Modal>
      <ConfirmDialog open={Boolean(photoToDelete)} title="Eliminar fotografía" description="La fotografía se retirará de la lista y quedará archivada en el historial." confirmLabel="Sí, eliminar" tone="danger" onCancel={() => setPhotoToDelete(null)} onConfirm={() => void deletePhoto()} />
    </>
  );
}
