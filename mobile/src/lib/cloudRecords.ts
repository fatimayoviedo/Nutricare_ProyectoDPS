import { collection, doc, getDoc, getDocs, query, runTransaction, where, type DocumentData } from 'firebase/firestore';
import { firebaseAuth, firestore, firebaseConfigured } from '@/lib/firebase';

export type MobileRecordKind = 'patients' | 'measurements' | 'consultations' | 'plans' | 'photos' | 'habits';
export interface MobileCloudRecord { id: string; kind: MobileRecordKind; ownerId: string; patientId: string; patientEmail: string; authorId: string; payload: string; createdAt: string; updatedAt: string; archived: boolean; feedback: string; approved: boolean; }

export function cloudReady() { return Boolean(firebaseConfigured && firebaseAuth?.currentUser && firestore); }
function requireCloud() { if (!cloudReady()) throw new Error('Inicia sesión para acceder a tus datos.'); return { user: firebaseAuth!.currentUser!, db: firestore! }; }
export function decode<T>(record: MobileCloudRecord): T { return { ...JSON.parse(record.payload), id: record.id } as T; }

export async function listMobileRecords(kind: MobileRecordKind, patientEmail?: string) {
  const { user, db } = requireCloud();
  const owned = await getDocs(query(collection(db, 'records'), where('ownerId', '==', user.uid), where('kind', '==', kind)));
  const received = patientEmail && user.emailVerified && user.email
    ? await getDocs(query(collection(db, 'records'), where('patientEmail', '==', patientEmail.toLowerCase()), where('kind', '==', kind)))
    : null;
  const unique = new Map<string, MobileCloudRecord>();
  [...owned.docs, ...(received?.docs ?? [])].forEach((item) => unique.set(item.id, { ...item.data(), id: item.id } as MobileCloudRecord));
  return [...unique.values()].filter((record) => !record.archived).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveMobileRecord(kind: MobileRecordKind, data: Record<string, unknown>, id?: string) {
  const { user, db } = requireCloud();
  let parent: MobileCloudRecord | undefined;
  if (kind !== 'patients' && kind !== 'habits') {
    let patientId = String(data.patientId ?? '');
    if (!patientId && kind === 'consultations') {
      const candidates = await getDocs(query(collection(db, 'records'), where('ownerId', '==', user.uid), where('kind', '==', 'patients')));
      const match = candidates.docs.find((item) => String(JSON.parse(String(item.data().payload)).name ?? '').toLowerCase() === String(data.name ?? '').toLowerCase());
      if (match) { patientId = match.id; data.patientId = patientId; }
    }
    let parentSnapshot = await getDoc(doc(db, 'records', patientId));
    if (!parentSnapshot.exists() && user.email) {
      const byEmail = await getDocs(query(collection(db, 'records'), where('kind', '==', 'patients'), where('patientEmail', '==', user.email.toLowerCase())));
      parentSnapshot = byEmail.docs[0] ? await getDoc(byEmail.docs[0].ref) : parentSnapshot;
      if (parentSnapshot.exists()) data.patientId = parentSnapshot.id;
    }
    parent = parentSnapshot.exists() ? { ...parentSnapshot.data(), id: parentSnapshot.id } as MobileCloudRecord : undefined;
    if (!parent) throw new Error('No se encontró el expediente del paciente.');
  }
  const recordRef = doc(collection(db, 'records'), id ?? (kind === 'plans' ? `plan_${user.uid}_${data.patientId}_${data.planMonth}` : kind === 'habits' ? `habit_${user.uid}_${data.date}` : crypto.randomUUID()));
  const now = new Date().toISOString();
  const payload = JSON.stringify({ ...data, id: recordRef.id });
  const record: MobileCloudRecord = { id: recordRef.id, kind, ownerId: parent?.ownerId ?? user.uid, patientId: kind === 'patients' ? recordRef.id : String(data.patientId ?? user.uid), patientEmail: parent?.patientEmail ?? (kind === 'patients' ? String(data.email).toLowerCase() : user.email?.toLowerCase() ?? ''), authorId: user.uid, payload, createdAt: now, updatedAt: now, archived: false, feedback: '', approved: false };
  await runTransaction(db, async (tx) => {
    const prior = await tx.get(recordRef);
    if (prior.exists() && kind === 'habits') tx.update(recordRef, { payload, updatedAt: now });
    else tx.set(recordRef, record);
  });
  return record;
}

export async function updateMobilePhotoReview(id: string, feedback: string, approved: boolean) {
  const { db } = requireCloud(); const ref = doc(db, 'records', id);
  await runTransaction(db, async (tx) => { tx.update(ref, { feedback: feedback.trim(), approved, updatedAt: new Date().toISOString() }); });
}

export function recordPayload(data: DocumentData): MobileCloudRecord { return data as MobileCloudRecord; }
