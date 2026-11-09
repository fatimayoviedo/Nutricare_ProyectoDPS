import { isFirebaseConfigured } from '@/lib/firebase/firebase';
import { currentCloudUser, decodeRecord, listCloudRecords, saveCloudRecord } from './cloudRecords';

export interface DailyHabit { id?: string; date: string; planId: string; completed: string[]; mealCount: number; water: number }
export const habitService = {
  async list(): Promise<DailyHabit[]> {
    if (!isFirebaseConfigured) return JSON.parse(localStorage.getItem('nutricare_demo_habits') ?? '[]');
    const user = currentCloudUser();
    return (await listCloudRecords('habits')).filter(item => item.ownerId === user.uid).map(item => decodeRecord<DailyHabit>(item));
  },
  async save(habit: DailyHabit): Promise<DailyHabit> {
    if (!isFirebaseConfigured) {
      const all = await this.list();
      const result = { ...habit, id: habit.id ?? habit.date };
      localStorage.setItem('nutricare_demo_habits', JSON.stringify([...all.filter(item => item.date !== habit.date), result]));
      return result;
    }
    const existing = (await this.list()).find(item => item.date === habit.date);
    return decodeRecord<DailyHabit>(await saveCloudRecord('habits', { ...habit }, existing?.id));
  },
};
