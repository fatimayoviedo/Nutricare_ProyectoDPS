import { isFirebaseConfigured } from '@/lib/firebase/firebase';
import { archiveCloudRecord, currentCloudUser, decodeRecord, getCloudRecord, listCloudRecords, reviewCloudPhoto, saveCloudRecord, type CloudRecord } from './cloudRecords';

export type MealPhotoReviewStatus = "pending" | "approved";

async function photoFromCloud(record: CloudRecord): Promise<StoredMealPhoto> {
  const data = decodeRecord<Omit<StoredMealPhoto, 'file'> & { image: string }>(record);
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(data.image)) throw new Error('Esta fotografía no contiene una imagen válida. Vuelve a subirla.');
  return { ...data, file: await (await fetch(data.image)).blob(), nutritionistComment: record.feedback, reviewStatus: record.approved ? 'approved' : 'pending' };
}

async function optimizePhoto(file: Blob): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Selecciona una fotografía JPG, PNG o WebP.');
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/jpeg', 0.65);
    if (image.length > 650000) throw new Error('La imagen sigue siendo demasiado grande. Elige una fotografía más pequeña.');
    return image;
  } finally { bitmap.close(); }
}

export interface StoredMealPhoto {
  id: string;
  patientId: string;
  mealId: string;
  comment: string;
  createdAt: string;
  name: string;
  file: Blob;
  reviewStatus: MealPhotoReviewStatus;
  nutritionistComment: string;
  reviewedAt?: string;
}

const DB_NAME = "nutricare-meals";
const STORE_NAME = "meal-photos";

function openPhotoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function normalizePhoto(photo: Partial<StoredMealPhoto> & Pick<StoredMealPhoto, "id" | "mealId" | "createdAt" | "name" | "file">): StoredMealPhoto {
  return {
    id: photo.id,
    patientId: photo.patientId ?? "gerardo-pena",
    mealId: photo.mealId,
    comment: photo.comment ?? "",
    createdAt: photo.createdAt,
    name: photo.name,
    file: photo.file,
    reviewStatus: photo.reviewStatus ?? "pending",
    nutritionistComment: photo.nutritionistComment ?? "",
    reviewedAt: photo.reviewedAt,
  };
}

export async function getStoredPhotos(patientId?: string): Promise<StoredMealPhoto[]> {
  if (isFirebaseConfigured) {
    const records = (await listCloudRecords('photos')).filter(item => !patientId || item.patientId === patientId);
    return Promise.all(records.map(photoFromCloud));
  }
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const photos = (request.result as StoredMealPhoto[]).map(normalizePhoto);
      resolve(patientId ? photos.filter((photo) => photo.patientId === patientId) : photos);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function storePhoto(photo: StoredMealPhoto): Promise<void> {
  if (photo.comment.length > 4000 || photo.nutritionistComment.length > 4000) throw new Error('El comentario no puede superar 4,000 caracteres.');
  if (isFirebaseConfigured) {
    const user = currentCloudUser();
    const all = await listCloudRecords('photos');
    const existing = all.find(item => item.id === photo.id);
    if (existing && existing.ownerId === user.uid && existing.authorId !== user.uid) {
      await reviewCloudPhoto(existing.id, photo.nutritionistComment, photo.reviewStatus === 'approved');
      return;
    }
    const patient = (await listCloudRecords('patients')).find(item => item.id === photo.patientId);
    if (!patient) throw new Error('Tu nutricionista debe crear tu expediente con tu correo verificado antes de subir fotografías.');
    const { file, ...data } = photo;
    await saveCloudRecord('photos', { ...data, image: await optimizePhoto(file) }, existing?.id);
    return;
  }
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(photo);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getStoredPhoto(id: string): Promise<StoredMealPhoto | undefined> {
  if (isFirebaseConfigured) return photoFromCloud(await getCloudRecord(id));
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result ? normalizePhoto(request.result as StoredMealPhoto) : undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteStoredPhoto(id: string): Promise<void> {
  if (isFirebaseConfigured) return archiveCloudRecord(id);
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function mealIllustration(title: string, background: string, accent: string): Blob {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="#f8faf7"/></linearGradient></defs><rect width="900" height="560" fill="url(#bg)"/><circle cx="450" cy="265" r="190" fill="#fff" stroke="#dce7e3" stroke-width="18"/><ellipse cx="450" cy="280" rx="145" ry="95" fill="${accent}" opacity=".18"/><circle cx="390" cy="235" r="55" fill="#f59e0b"/><circle cx="500" cy="220" r="62" fill="#65a30d"/><circle cx="530" cy="320" r="48" fill="#ef4444"/><path d="M330 330c80-70 160-55 240 10-95 55-175 45-240-10Z" fill="#0f9f82"/><text x="450" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#17352e">${title}</text></svg>`;
  return new Blob([svg], { type: "image/svg+xml" });
}

export async function ensureDemoMealPhotos(): Promise<void> {
  if (isFirebaseConfigured) return;
  const existing = await getStoredPhotos();
  if (existing.length > 0) return;
  const demoPhotos: StoredMealPhoto[] = [
    { id: "demo-photo-gerardo", patientId: "gerardo-pena", mealId: "lunch", comment: "Cambié arroz por papa cocida.", createdAt: "2026-09-19T12:45:00.000Z", name: "almuerzo-gerardo.svg", file: mealIllustration("Almuerzo de Gerardo", "#dcfce7", "#16a34a"), reviewStatus: "pending", nutritionistComment: "" },
    { id: "demo-photo-carlos", patientId: "carlos-ramirez", mealId: "breakfast", comment: "Agregué una porción extra de fruta.", createdAt: "2026-09-19T08:10:00.000Z", name: "desayuno-carlos.svg", file: mealIllustration("Desayuno de Carlos", "#fef3c7", "#f59e0b"), reviewStatus: "pending", nutritionistComment: "" },
    { id: "demo-photo-lucia", patientId: "lucia-sanchez", mealId: "dinner", comment: "Cena preparada según el plan.", createdAt: "2026-09-18T19:40:00.000Z", name: "cena-lucia.svg", file: mealIllustration("Cena de Lucía", "#dbeafe", "#2563eb"), reviewStatus: "approved", nutritionistComment: "Muy buena distribución de vegetales.", reviewedAt: "2026-09-18T20:05:00.000Z" },
  ];
  await Promise.all(demoPhotos.map(storePhoto));
}
