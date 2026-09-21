export type MealPhotoReviewStatus = "pending" | "approved";

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
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(photo);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getStoredPhoto(id: string): Promise<StoredMealPhoto | undefined> {
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result ? normalizePhoto(request.result as StoredMealPhoto) : undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteStoredPhoto(id: string): Promise<void> {
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
  const existing = await getStoredPhotos();
  if (existing.length > 0) return;
  const demoPhotos: StoredMealPhoto[] = [
    { id: "demo-photo-gerardo", patientId: "gerardo-pena", mealId: "lunch", comment: "Cambié arroz por papa cocida.", createdAt: "2026-09-19T12:45:00.000Z", name: "almuerzo-gerardo.svg", file: mealIllustration("Almuerzo de Gerardo", "#dcfce7", "#16a34a"), reviewStatus: "pending", nutritionistComment: "" },
    { id: "demo-photo-carlos", patientId: "carlos-ramirez", mealId: "breakfast", comment: "Agregué una porción extra de fruta.", createdAt: "2026-09-19T08:10:00.000Z", name: "desayuno-carlos.svg", file: mealIllustration("Desayuno de Carlos", "#fef3c7", "#f59e0b"), reviewStatus: "pending", nutritionistComment: "" },
    { id: "demo-photo-lucia", patientId: "lucia-sanchez", mealId: "dinner", comment: "Cena preparada según el plan.", createdAt: "2026-09-18T19:40:00.000Z", name: "cena-lucia.svg", file: mealIllustration("Cena de Lucía", "#dbeafe", "#2563eb"), reviewStatus: "approved", nutritionistComment: "Muy buena distribución de vegetales.", reviewedAt: "2026-09-18T20:05:00.000Z" },
  ];
  await Promise.all(demoPhotos.map(storePhoto));
}
