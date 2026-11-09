import { isFirebaseConfigured } from '@/lib/firebase/firebase';
import { decodeRecord, listCloudRecords } from './cloudRecords';
import type { Consultation } from '@/types';
export interface AppNotification { id:string; category:string; title:string; detail:string; expanded:string; time:string; href:string; action:string }
export async function listNotifications(isPatient:boolean): Promise<AppNotification[]> {
  if (!isFirebaseConfigured) return [];
  const records = await listCloudRecords();
  const notifications:AppNotification[] = [];
  for (const record of records) {
    if (record.kind === 'consultations') {
      const appointment = decodeRecord<Consultation>(record);
      if (appointment.status !== 'scheduled' || new Date(appointment.date).getTime() < Date.now()) continue;
      notifications.push({id:record.id+record.updatedAt,category:isPatient?'appointments':'consultations',title:'Consulta programada',detail:`${appointment.patientName} · ${new Date(appointment.date).toLocaleString('es-SV',{dateStyle:'short',timeStyle:'short'})}`,expanded:appointment.type+' · '+appointment.mode,time:'Agenda',href:isPatient?'/historial':`/consultas/${record.id}`,action:'Ver consulta'});
    } else if (record.kind === 'photos' && (!isPatient && !record.approved || isPatient && record.feedback)) {
      notifications.push({id:record.id+record.updatedAt,category:isPatient?'meals':'mealPhotos',title:isPatient?'Retroalimentación de fotografía':'Fotografía pendiente',detail:isPatient?record.feedback:record.patientEmail,expanded:isPatient?record.feedback:'Abre el registro para revisar la comida y responder al paciente.',time:'Seguimiento',href:isPatient?'/comidas':'/fotografias',action:'Ver fotografía'});
    } else if (record.kind === 'plans') {
      const plan = decodeRecord<{title:string;planMonth:string}>(record);
      notifications.push({id:record.id+record.updatedAt,category:isPatient?'meals':'planReviews',title:'Plan guardado',detail:plan.title,expanded:`Plan correspondiente a ${plan.planMonth}.`,time:'Planes',href:'/planes',action:'Ver planes'});
    }
  }
  return notifications.slice(0,30);
}
