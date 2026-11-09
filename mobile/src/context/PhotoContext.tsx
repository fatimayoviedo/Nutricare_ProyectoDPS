import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { SavedPhoto } from '@/types/photo';
import { decode, listMobileRecords, saveMobileRecord, updateMobilePhotoReview, cloudReady } from '@/lib/cloudRecords';
import { useAuth } from '@/context/AuthContext';

const STORAGE_KEY = 'nutricare.mobile.saved-photos';
interface PhotoContextValue {
  photos: SavedPhoto[];
  isReady: boolean;
  addPhoto: (photo: Omit<SavedPhoto, 'id' | 'createdAt'>) => Promise<SavedPhoto>;
  deletePhoto: (id: string) => Promise<void>;
  saveNutritionistComment: (id: string, comment: string) => Promise<void>;
}
const PhotoContext = createContext<PhotoContextValue | undefined>(undefined);

export function PhotoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<SavedPhoto[]>([]); const [isReady, setIsReady] = useState(false);
  useEffect(() => { if (cloudReady() && user) { listMobileRecords('photos', user.role === 'patient' ? user.email : undefined).then((records) => setPhotos(records.map((record) => ({ ...decode<SavedPhoto>(record), nutritionistComment: record.feedback || undefined })))).catch(() => setPhotos([])).finally(() => setIsReady(true)); return; } AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
    const stored = raw ? JSON.parse(raw) as SavedPhoto[] : [];
    setPhotos(stored.map((photo) => photo.nutritionistComment === 'Pendiente de revisión por tu nutricionista.' ? { ...photo, nutritionistComment: undefined } : photo));
  }).catch(() => setPhotos([])).finally(() => setIsReady(true)); }, [user]);
  const addPhoto = useCallback(async (input: Omit<SavedPhoto, 'id' | 'createdAt'>) => {
    const photo: SavedPhoto = { ...input, id: `photo-${Date.now()}`, createdAt: new Date().toISOString() };
    if (cloudReady()) { const record = await saveMobileRecord('photos', photo as unknown as Record<string, unknown>, photo.id); const saved = decode<SavedPhoto>(record); setPhotos((current) => [saved, ...current]); return saved; }
    const next = [photo, ...photos]; await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setPhotos(next); return photo;
  }, [photos]);
  const deletePhoto = useCallback(async (id: string) => { const next = photos.filter((photo) => photo.id !== id); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setPhotos(next); }, [photos]);
  const saveNutritionistComment = useCallback(async (id: string, comment: string) => {
    if (cloudReady()) { await updateMobilePhotoReview(id, comment, Boolean(comment.trim())); setPhotos((current) => current.map((photo) => photo.id === id ? { ...photo, nutritionistComment: comment.trim() } : photo)); return; }
    const next = photos.map((photo) => photo.id === id ? { ...photo, nutritionistComment: comment.trim() } : photo);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setPhotos(next);
  }, [photos]);
  const value = useMemo(() => ({ photos, isReady, addPhoto, deletePhoto, saveNutritionistComment }), [photos, isReady, addPhoto, deletePhoto, saveNutritionistComment]);
  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>;
}
export function usePhotos() { const context = useContext(PhotoContext); if (!context) throw new Error('usePhotos debe utilizarse dentro de PhotoProvider.'); return context; }
