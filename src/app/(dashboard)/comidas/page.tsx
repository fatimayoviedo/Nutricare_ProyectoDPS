"use client";

import { Apple, Camera, Coffee, CupSoda, ImagePlus, Moon, Pencil, Soup, Trash2, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { deleteStoredPhoto, getStoredPhoto, getStoredPhotos, storePhoto, type StoredMealPhoto } from "@/services/mealPhotoService";

const meals = [
  { id: "breakfast", icon: Coffee, time: "07:00", title: "Desayuno", detail: "Avena, yogur y frutos rojos", preparation: "Deja reposar desde la noche anterior ⅓ de taza de avena con ½ taza de leche. Agrega ¼ de taza de yogur, ½ taza de frutos rojos y canela al gusto." },
  { id: "morning-snack", icon: Apple, time: "10:30", title: "Merienda", detail: "Manzana y almendras", preparation: "Lava y corta una manzana en porciones. Acompaña con 6 almendras naturales, sin azúcar ni sal añadida." },
  { id: "lunch", icon: Soup, time: "13:00", title: "Almuerzo", detail: "Pollo, arroz integral y ensalada", preparation: "Sazona el pollo con ajo, hierbas y pimienta; cocina a la plancha. Prepara el arroz integral sin aceite y acompaña con ensalada fresca y limón." },
  { id: "afternoon-snack", icon: CupSoda, time: "16:30", title: "Merienda", detail: "Batido de frutas", preparation: "Licúa 1½ taza de bebida de almendra sin azúcar con cocoa, 1 cucharada de mantequilla de maní y ½ taza de fruta. Agrega hielo al gusto." },
  { id: "dinner", icon: Moon, time: "19:30", title: "Cena", detail: "Crema de verduras y pan integral", preparation: "Cocina las verduras con agua, ajo y hierbas, sin consomé ni cubitos. Licúa hasta obtener una crema suave y sirve con una tostada de pan integral." },
];

interface MealPhoto extends Omit<StoredMealPhoto, "file"> {
  url: string;
}

export default function MealsPage() {
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
    getStoredPhotos("gerardo-pena").then((records) => {
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
    if (editingPhotoId) {
      try {
        const stored = await getStoredPhoto(editingPhotoId);
        if (!stored) throw new Error("Fotografía no encontrada");
        await storePhoto({ ...stored, mealId: selectedMeal, comment: comment.trim() });
        setPhotos((current) => current.map((photo) => photo.id === editingPhotoId ? { ...photo, mealId: selectedMeal, comment: comment.trim() } : photo));
        closePhotoForm();
        setSavedMessage("Los datos de la fotografía se actualizaron correctamente.");
      } catch { setError("No fue posible actualizar la fotografía. Inténtalo nuevamente."); }
      return;
    }
    if (!selectedFile) { setError("Primero toma o elige una fotografía."); return; }
    const record: StoredMealPhoto = { id: crypto.randomUUID(), patientId: "gerardo-pena", mealId: selectedMeal, comment: comment.trim(), createdAt: new Date().toISOString(), name: selectedFile.name, file: selectedFile, reviewStatus: "pending", nutritionistComment: "" };
    try {
      await storePhoto(record);
      const url = URL.createObjectURL(selectedFile);
      setPhotos((current) => [{ ...record, url }, ...current]);
      closePhotoForm();
      setSavedMessage("Fotografía guardada. Solo estará disponible dentro de NutriCare para el seguimiento nutricional.");
    } catch { setError("No fue posible guardar la fotografía. Inténtalo nuevamente."); }
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
      {savedMessage ? <div className="mb-5"><Alert>{savedMessage}</Alert></div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {meals.map(({ id, icon: Icon, time, title, detail, preparation }) => <Card key={id} className="flex h-full flex-col">
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
          <Button type="submit" fullWidth>{editingPhotoId ? "Guardar cambios" : "Guardar fotografía"}</Button>
        </form>
      </Modal>
      <ConfirmDialog open={Boolean(photoToDelete)} title="Eliminar fotografía" description="La fotografía se eliminará definitivamente de tu seguimiento nutricional." confirmLabel="Sí, eliminar" tone="danger" onCancel={() => setPhotoToDelete(null)} onConfirm={() => void deletePhoto()} />
    </>
  );
}
