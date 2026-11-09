import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase/firebase';
import { firestore } from '@/lib/firebase/firestore';
import { patientSchema } from '@/schemas/patientSchema';
import { measurementSchema } from '@/schemas/measurementSchema';
import { consultationSchema } from '@/schemas/consultationSchema';
import { planSchema } from '@/schemas/planSchema';
import { calculateBMI } from '@/utils/calculateBMI';

export type RecordKind = 'patients' | 'measurements' | 'consultations' | 'plans' | 'photos' | 'habits';
export interface CloudRecord {
  id: string; kind: RecordKind; ownerId: string; patientId: string; patientEmail: string;
  authorId: string; payload: string; createdAt: string; updatedAt: string; archived: boolean;
  feedback: string; approved: boolean;
}
export function currentCloudUser() {
  const user = firebaseApp ? getAuth(firebaseApp).currentUser : null;
  if (!user || !firestore) throw new Error('Inicia sesión para acceder a tus registros.');
  return user;
}
function records() { currentCloudUser(); return collection(firestore!, 'records'); }
export async function cloudWait<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { return await Promise.race([promise, new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('No se confirmó la operación. Revisa tu conexión y actualiza la lista antes de volver a guardar.')), 15000);
  })]); } finally { if (timer) clearTimeout(timer); }
}
export async function listCloudRecords(kind?: RecordKind, includeArchived = false): Promise<CloudRecord[]> {
  const user = currentCloudUser();
  const kindFilter = kind ? [where('kind', '==', kind)] : [];
  const [owned, received] = await Promise.all([
    cloudWait(getDocs(query(records(), where('ownerId', '==', user.uid), ...kindFilter))),
    user.emailVerified && user.email ? cloudWait(getDocs(query(records(), where('patientEmail', '==', user.email.toLowerCase()), ...kindFilter))) : Promise.resolve(null),
  ]);
  const unique = new Map<string, CloudRecord>();
  [...owned.docs, ...(received?.docs ?? [])].forEach(item => unique.set(item.id, { ...item.data(), id: item.id } as CloudRecord));
  const parents = kind && kind !== 'patients' && kind !== 'habits' && !includeArchived ? await listCloudRecords('patients',true) : [...unique.values()];
  const archivedPatients = new Set(parents.filter(item => item.kind === 'patients' && item.archived).map(item => item.id));
  return [...unique.values()].filter(item => (!kind || item.kind === kind) && (includeArchived || (!item.archived && !archivedPatients.has(item.patientId))))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function getCloudRecord(id: string): Promise<CloudRecord> {
  const snapshot = await cloudWait(getDoc(doc(records(), id)));
  if (!snapshot.exists()) throw new Error('No se encontró el registro.');
  return { ...snapshot.data(), id: snapshot.id } as CloudRecord;
}
export function decodeRecord<T>(record: CloudRecord): T { return { ...JSON.parse(record.payload), id: record.id } as T; }
export async function saveCloudRecord(kind: RecordKind, data: Record<string, unknown>, id?: string): Promise<CloudRecord> {
  const user = currentCloudUser();
  const existing = id ? await getCloudRecord(id) : null;
  if (existing && (existing.kind !== kind || existing.archived)) throw new Error('El registro no está disponible.');
  if (existing && kind === 'patients' && data.email !== existing.patientEmail) throw new Error('El correo vincula el expediente con la cuenta del paciente. Para cambiarlo, crea un nuevo expediente con el correo correcto.');
  if (existing && kind === 'plans') {
    const previous = decodeRecord<{ planMonth: string; patientId: string }>(existing);
    if (previous.planMonth !== data.planMonth || previous.patientId !== data.patientId) throw new Error('Crea un nuevo plan para cambiar el paciente o el mes.');
  }
  const patient = kind !== 'patients' && kind !== 'habits' ? await getCloudRecord(String(data.patientId)) : null;
  if (patient && (patient.kind !== 'patients' || patient.archived)) throw new Error('Selecciona un expediente activo.');
  const ownerId = existing?.ownerId ?? patient?.ownerId ?? user.uid;
  if (kind !== 'photos' && kind !== 'habits' && ownerId !== user.uid) throw new Error('Solo la persona que administra el expediente puede modificarlo.');
  const now = new Date().toISOString();
  const ref = doc(records(), id ?? (kind === 'plans' ? `plan_${ownerId}_${data.patientId}_${data.planMonth}` : kind === 'habits' ? `habit_${user.uid}_${data.date}` : kind === 'photos' && typeof data.id === 'string' ? data.id : crypto.randomUUID()));
  const payload = JSON.stringify({ ...data, id: ref.id });
  if (new TextEncoder().encode(payload).length > 750000) throw new Error('El archivo es demasiado grande. Usa una imagen o documento menor de 500 KB.');
  const record: CloudRecord = {
    id: ref.id, kind, ownerId, patientId: kind === 'patients' ? ref.id : String(data.patientId ?? user.uid),
    patientEmail: existing?.patientEmail ?? patient?.patientEmail ?? (kind === 'patients' ? String(data.email).toLowerCase() : user.email?.toLowerCase() ?? ''),
    authorId: existing?.authorId ?? user.uid, payload, createdAt: existing?.createdAt ?? now, updatedAt: now,
    archived: false, feedback: existing?.feedback ?? '', approved: existing?.approved ?? false,
  };
  await cloudWait(runTransaction(firestore!, async transaction => {
    const prior = await transaction.get(ref);
    if (!id && prior.exists()) throw new Error('Ya existe un registro para ese paciente y mes. Consulta el historial.');
    transaction.set(ref, record);
  }));
  return record;
}
export async function archiveCloudRecord(id: string) {
  const ref = doc(records(), id);
  await cloudWait(runTransaction(firestore!, async tx => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists()) throw new Error('Registro no encontrado.');
    tx.update(ref, { archived: true, updatedAt: new Date().toISOString() });
  }));
}
export async function reviewCloudPhoto(id: string, feedback: string, approved: boolean) {
  const ref = doc(records(), id);
  await cloudWait(runTransaction(firestore!, async tx => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists() || snapshot.data().kind !== 'photos') throw new Error('Fotografía no encontrada.');
    tx.update(ref, { feedback: feedback.trim(), approved, updatedAt: new Date().toISOString() });
  }));
}
export async function cloudApiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = new URL(path, 'http://localhost');
  const [, , kind, id] = url.pathname.split('/') as [string, string, RecordKind, string?];
  const schemas = { patients: patientSchema, measurements: measurementSchema, consultations: consultationSchema, plans: planSchema };
  if (!(kind in schemas)) throw new Error('Módulo no disponible.');
  const method = options?.method ?? 'GET';
  if (method === 'GET') {
    if (id && kind !== 'patients') { const item = await getCloudRecord(id); if (item.kind !== kind || item.archived) throw new Error('Registro no encontrado.'); return decodeRecord<T>(item); }
    let result = (await listCloudRecords(kind)).map(item => decodeRecord<Record<string, unknown>>(item));
    const patientId = url.searchParams.get('patientId');
    const search = url.searchParams.get('search')?.toLowerCase();
    if (patientId) result = result.filter(item => item.patientId === patientId);
    if (search) result = result.filter(item => `${item.name} ${item.email} ${item.objective}`.toLowerCase().includes(search));
    if (kind === 'patients') {
      const appointments = (await listCloudRecords('consultations')).map(item => decodeRecord<{patientId:string;status:string;date:string}>(item)).filter(item => item.status === 'scheduled' && new Date(item.date).getTime() >= Date.now()).sort((a,b) => a.date.localeCompare(b.date));
      result = result.map(patient => ({...patient, nextConsultation:appointments.find(item => item.patientId === patient.id)?.date}));
      if (id) { const patient = result.find(item => item.id === id); if (!patient) throw new Error('Registro no encontrado.'); return patient as T; }
    }
    if (kind === 'measurements') result.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (kind === 'consultations') result.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return result as T;
  }
  if (method === 'DELETE' && id) { const old = await getCloudRecord(id); if (old.kind !== kind) throw new Error('Registro no encontrado.'); await archiveCloudRecord(id); return decodeRecord<T>(old); }
  const schema = schemas[kind as keyof typeof schemas];
  const parsed = schema.safeParse(JSON.parse(String(options?.body ?? '{}')));
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  const data: Record<string, unknown> = { ...parsed.data };
  if (kind === 'patients') data.email = String(data.email).trim().toLowerCase();
  if (kind === 'patients' || kind === 'plans') data.createdAt = id ? decodeRecord<Record<string, unknown>>(await getCloudRecord(id)).createdAt : new Date().toISOString();
  if (kind === 'measurements' || kind === 'consultations') {
    const parent = await getCloudRecord(String(data.patientId));
    const patient = decodeRecord<{ heightCm: number; name: string }>(parent);
    if (kind === 'measurements') { data.heightCm = patient.heightCm; data.bmi = calculateBMI(Number(data.weightKg), patient.heightCm); }
    else { data.patientName = patient.name; data.nutritionistId = parent.ownerId; }
  }
  return decodeRecord<T>(await saveCloudRecord(kind, data, id));
}
