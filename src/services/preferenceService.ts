import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/firestore';
import { isFirebaseConfigured } from '@/lib/firebase/firebase';
import { cloudWait, currentCloudUser } from './cloudRecords';

export const defaultPreferences = { meals:true, water:true, appointments:true, consultations:true, mealPhotos:true, planReviews:true };
export type NotificationPreferences = typeof defaultPreferences;
export interface Settings { preferences: NotificationPreferences; readNotifications: string[] }
export const preferenceService = {
  async get(): Promise<Settings> {
    if (!isFirebaseConfigured) return {preferences:defaultPreferences, readNotifications:[]};
    const snap = await cloudWait(getDoc(doc(firestore!, 'settings', currentCloudUser().uid)));
    const data = snap.data();
    return {preferences:{...defaultPreferences, ...data?.preferences}, readNotifications:JSON.parse(data?.readNotifications ?? '[]')};
  },
  async save(value: Partial<Settings>) {
    if (!isFirebaseConfigured) return;
    const data: Record<string,unknown> = {};
    if (value.preferences) data.preferences = value.preferences;
    if (value.readNotifications) data.readNotifications = JSON.stringify(value.readNotifications.slice(-100));
    await cloudWait(setDoc(doc(firestore!, 'settings', currentCloudUser().uid), data, {merge:true}));
  },
};
