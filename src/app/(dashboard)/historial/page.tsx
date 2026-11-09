"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Clock3, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import { listCloudRecords, decodeRecord, type CloudRecord, type RecordKind } from '@/services/cloudRecords';
import { isFirebaseConfigured } from '@/lib/firebase/firebase';
import { getErrorMessage } from '@/utils/errorHandler';

const labels: Record<RecordKind,string> = {patients:'Pacientes',measurements:'Mediciones',consultations:'Consultas',plans:'Planes',photos:'Fotografías',habits:'Hábitos diarios'};
const destinations: Record<RecordKind,string> = {patients:'/pacientes',measurements:'/progreso',consultations:'/consultas',plans:'/planes',photos:'/comidas',habits:'/dashboard'};
export default function HistoryPage() {
  const {user} = useAuth();
  const [records, setRecords] = useState<CloudRecord[]>([]);
  const [kind, setKind] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function refresh() {
    setLoading(true); setError('');
    try { if (isFirebaseConfigured) setRecords(await listCloudRecords(undefined,true)); }
    catch(cause) { setError(getErrorMessage(cause)); } finally { setLoading(false); }
  }
  useEffect(() => {
    const operation = isFirebaseConfigured ? listCloudRecords(undefined,true) : Promise.resolve([]);
    operation.then(setRecords).catch(cause => setError(getErrorMessage(cause))).finally(() => setLoading(false));
  }, []);
  const patients = new Map(records.filter(item => item.kind === 'patients').map(item => [item.id, decodeRecord<{name:string}>(item).name]));
  const filtered = records.filter(item => (kind === 'all' || item.kind === kind) && (status === 'all' || item.archived === (status === 'archived')) && `${patients.get(item.patientId) ?? ''} ${item.patientEmail} ${item.createdAt} ${item.payload.slice(0,500)}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
  return <>
    <PageHeader title="Historial de registros" description="Consulta tus registros guardados y archivados, ordenados por su última actualización." action={<button className="inline-flex items-center gap-2 rounded-xl border p-3 font-bold" disabled={loading} onClick={() => void refresh()}><RefreshCw className="size-4" /> Actualizar</button>} />
    {error && <Alert tone="error">{error}</Alert>}
    {!isFirebaseConfigured && <Alert>El historial remoto requiere la configuración de Firebase.</Alert>}
    <Card className="mb-5 grid gap-4 md:grid-cols-3"><Select label="Módulo" value={kind} onChange={event => setKind(event.target.value)}><option value="all">Todos</option>{Object.entries(labels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</Select><Select label="Estado" value={status} onChange={event => setStatus(event.target.value)}><option value="all">Todos</option><option value="active">Disponibles</option><option value="archived">Archivados</option></Select><label className="grid gap-2 text-sm font-medium">Buscar<input className="rounded-xl border border-[var(--border)] p-3" value={search} onChange={event => setSearch(event.target.value)} placeholder="Nombre, correo o fecha" /></label></Card>
    {loading ? <Spinner label="Cargando historial" /> : <div className="grid gap-4">{filtered.length === 0 && <Card><Clock3 className="mb-3 text-[var(--primary)]" />No hay registros con estos filtros.</Card>}{filtered.map(record => {
      const data = decodeRecord<Record<string,unknown>>(record);
      const detail = record.kind === 'measurements' ? `${data.date} · ${data.weightKg} kg · IMC ${data.bmi}` : record.kind === 'consultations' ? `${data.date} · ${data.type} · ${data.status}` : record.kind === 'plans' ? `${data.planMonth} · ${data.title}` : record.kind === 'photos' ? String(data.comment || 'Sin comentario') : record.kind === 'habits' ? `${data.date} · ${Array.isArray(data.completed) ? data.completed.length : 0}/${data.mealCount} comidas · ${data.water} vasos` : String(data.objective ?? '');
      return <Card key={record.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold text-[var(--primary)]">{labels[record.kind]} · {record.archived ? 'Archivado' : 'Disponible'}</p><h2 className="mt-2 font-bold">{patients.get(record.patientId) ?? (record.kind === 'habits' ? 'Mi seguimiento' : record.patientEmail)}</h2></div><p className="text-xs text-[var(--ink-muted)]">Actualizado: {new Date(record.updatedAt).toLocaleString('es-SV')}</p></div><p className="mt-3 break-words text-sm">{detail}</p>{record.feedback && <p className="mt-3 rounded-xl bg-[var(--soft-green)] p-3 text-sm">Retroalimentación: {record.feedback}</p>}<p className="mt-3 text-xs text-[var(--ink-muted)]">Creado: {new Date(record.createdAt).toLocaleString('es-SV')}</p>{!record.archived && <Link href={record.kind === "patients" && user?.role === "patient" ? "/perfil" : record.kind === "consultations" && user?.role === "patient" ? "/dashboard" : record.kind === "photos" && user?.role === "nutritionist" ? "/fotografias" : destinations[record.kind]} className="mt-3 inline-block text-sm font-bold text-[var(--primary)]">Abrir módulo →</Link>}<details className="mt-3 text-sm"><summary className="cursor-pointer font-semibold">Ver datos guardados</summary><RecordDetails data={data} /></details></Card>;
    })}</div>}
  </>;
}

const fieldLabels:Record<string,string> = {name:'Nombre',email:'Correo',dateOfBirth:'Nacimiento',sex:'Sexo',heightCm:'Estatura (cm)',objective:'Objetivo',status:'Estado',date:'Fecha',weightKg:'Peso (kg)',bmi:'IMC',measurementMode:'Modalidad de medición',waistCm:'Cintura (cm)',abdomenCm:'Abdomen (cm)',armCm:'Brazo (cm)',hipCm:'Cadera (cm)',bodyFatPercentage:'Grasa (%)',muscleMassPercentage:'Músculo (%)',metabolicAge:'Edad metabólica',notes:'Notas',type:'Tipo de consulta',mode:'Modalidad',title:'Título',planMonth:'Mes',active:'Plan activo',comment:'Comentario',water:'Vasos de agua',mealCount:'Comidas del día'};
function RecordDetails({data}:{data:Record<string,unknown>}) {
  return <div className="mt-3 grid gap-3 rounded-xl bg-[var(--surface-muted)] p-4">
    <dl className="grid gap-2">{Object.entries(data).filter(([key,value])=>fieldLabels[key] && ['string','number','boolean'].includes(typeof value)).map(([key,value])=><div key={key}><dt className="font-semibold">{fieldLabels[key]}</dt><dd className="break-words">{typeof value === 'boolean' ? value ? 'Sí':'No' : String(value)}</dd></div>)}</dl>
    {typeof data.image === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(data.image) && <Image src={data.image} alt="Fotografía guardada" width={600} height={400} unoptimized className="max-h-80 w-full rounded-xl object-contain" />}
    {Array.isArray(data.meals) && data.meals.map((meal,index)=><div key={index} className="border-t pt-3"><p className="font-bold">{meal.title} · {meal.time}</p><p>{meal.description}</p><p>{meal.portion}</p><p>{meal.comments}</p></div>)}
    {data.clinicalGuidance && typeof data.clinicalGuidance === 'object' ? Object.values(data.clinicalGuidance).filter(Array.isArray).map((items,index)=><ul key={index} className="list-inside list-disc">{items.map((item,j)=><li key={j}>{String(item)}</li>)}</ul>) : null}
  </div>;
}
