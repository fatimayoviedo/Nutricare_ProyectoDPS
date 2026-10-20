import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useAppointments } from '@/context/AppointmentContext';
import { usePhotos } from '@/context/PhotoContext';
import { patientMeals } from '@/data/demo';
import { monthlyMealsForDay } from '@/data/monthlyPlan';

function PatientHome() {
  const router = useRouter();
  const dayMeals = monthlyMealsForDay(Math.min(new Date().getDate(), 31));
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const checklistKey = `nutricare.mobile.daily-checklist.${new Date().toISOString().slice(0, 10)}`;
  const completionRatio = completedMeals.length / patientMeals.length;
  const weeklyProgress = Math.round(((5 + completionRatio) / 7) * 100);
  const trackedDays = completedMeals.length === patientMeals.length ? 6 : 5;
  useEffect(() => { AsyncStorage.getItem(checklistKey).then((raw) => { if (raw) setCompletedMeals(JSON.parse(raw) as string[]); }).catch(() => undefined); }, [checklistKey]);
  const toggleMeal = (id: string) => setCompletedMeals((current) => { const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]; void AsyncStorage.setItem(checklistKey, JSON.stringify(next)); return next; });
  return (
    <>
      <Text style={styles.title}>¡Hola, Gerardo!</Text>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{trackedDays} días siguiendo tu plan</Text>
        <Text style={styles.heroText}>Marca tus comidas del día para actualizar el avance semanal.</Text>
        <View style={styles.goalPill}><Text style={styles.goalText}>Meta semanal {weeklyProgress}%</Text></View>
      </View>
      <View style={styles.statRow}>
        <SurfaceCard style={styles.statCard}><Text style={styles.statLabel}>⚖ Peso actual</Text><Text style={styles.statValue}>68.4 kg</Text><Text style={styles.positive}>−0.5 kg</Text></SurfaceCard>
        <SurfaceCard style={styles.statCard}><View style={styles.statHeading}><View style={styles.statIcon}><SymbolView name={{ios:'calendar',android:'event',web:'event'}} size={18} tintColor={colors.primary}/></View><Text style={styles.statLabel}>Próxima cita</Text></View><Text style={styles.statValue}>31 oct</Text><Text style={styles.appointment}>10:30 a. m.</Text></SurfaceCard>
      </View>
      <SurfaceCard style={styles.planCard}>
        <Text style={styles.cardTitle}>Plan de hoy</Text><Text style={styles.checkHelp}>Toca cada círculo al completar la comida.</Text>
        {patientMeals.map((meal, index) => { const complete = completedMeals.includes(meal.id); return <Pressable key={meal.id} accessibilityRole="checkbox" accessibilityState={{ checked: complete }} onPress={() => toggleMeal(meal.id)} style={styles.mealRow}><View style={[styles.mealDot, { backgroundColor: complete ? colors.primary : meal.color }]}>{complete ? <Text style={styles.check}>✓</Text> : null}</View><Text style={[styles.mealTitle, complete && styles.completedText]}>{dayMeals[index].title}</Text><Text style={[styles.mealDetail, complete && styles.completedText]}>{dayMeals[index].description}</Text></Pressable>;})}
        <PrimaryButton label="Abrir plan completo" onPress={() => router.push('/plan')} variant="lime" />
      </SurfaceCard>
    </>
  );
}

function NutritionistHome() {
  const router = useRouter();
  const { appointments } = useAppointments();
  const { photos } = usePhotos();
  const pendingPhotos = photos.filter((photo) => !photo.nutritionistComment).length;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayAppointments = appointments.filter((item) => !item.date || item.date === today);
  const formatDate = (date?: string) => date ? new Date(`${date}T12:00:00`).toLocaleDateString('es-SV', { day: 'numeric', month: 'short' }) : 'Hoy';
  const formatTime = (time: string) => { const [hour, minute] = time.split(':').map(Number); const period = hour >= 12 ? 'PM' : 'AM'; return `${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`; };
  return (
    <>
      <Text style={styles.title}>Resumen de hoy</Text>
      <View style={styles.statRow}>
        <SurfaceCard style={styles.statCard}><View style={styles.statHeading}><View style={styles.statIcon}><SymbolView name={{ios:'calendar',android:'event',web:'event'}} size={18} tintColor={colors.primary}/></View><Text style={styles.statLabel}>Consultas</Text></View><Text style={styles.statValue}>{todayAppointments.length}</Text><Text style={styles.positive}>Próxima {todayAppointments[0]?.time ?? '—'}</Text></SurfaceCard>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir fotografías de pacientes" onPress={() => router.push('/photo-feedback')} style={styles.statPressable}><SurfaceCard style={styles.statCard}><View style={styles.statHeading}><View style={styles.statIcon}><SymbolView name={{ios:'photo.fill',android:'photo_camera',web:'photo_camera'}} size={18} tintColor={colors.primary}/></View><Text style={styles.statLabel}>Fotografías</Text></View><Text style={styles.statValue}>{photos.length}</Text><Text style={styles.appointment}>{pendingPhotos} por revisar</Text></SurfaceCard></Pressable>
      </View>
      <SurfaceCard style={styles.planCard}>
        <View style={styles.sectionRow}><Text style={styles.cardTitle}>Agenda</Text><Pressable onPress={() => router.push('/new-appointment' as never)}><Text style={styles.newLabel}>+ Nueva</Text></Pressable></View>
        {appointments.length ? appointments.map((item) => <View key={item.id} style={styles.agendaRow}><View style={styles.agendaWhen}><Text style={styles.time}>{formatTime(item.time)}</Text><Text style={styles.agendaDate}>{formatDate(item.date)}</Text></View><View style={styles.agendaInfo}><Text style={styles.patientName}>{item.name}</Text>{item.reason ? <Text style={styles.agendaReason}>{item.reason}</Text> : null}</View></View>) : <Text style={styles.emptyAgenda}>No hay consultas programadas.</Text>}
      </SurfaceCard>
      <View style={styles.attentionBox}><Text style={styles.attentionTitle}>Requieren atención</Text><Text style={styles.attentionText}>5 planes por vencer · {pendingPhotos} fotos pendientes</Text><PrimaryButton label="Revisar pendientes" variant="secondary" onPress={() => router.push('/pending')} /></View>
    </>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  if (!user) return null;
  return <Screen><BrandHeader role={user.role} />{user.role === 'patient' ? <PatientHome /> : <NutritionistHome />}</Screen>;
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1, marginBottom: spacing.lg },
  hero: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.lg }, heroTitle: { color: colors.surface, fontSize: 21, fontWeight: '900' },
  heroText: { color: '#D9F3EA', marginTop: spacing.sm }, goalPill: { alignSelf: 'flex-start', backgroundColor: colors.lime, borderRadius: radius.pill, paddingVertical: 9, paddingHorizontal: 18, marginTop: spacing.lg }, goalText: { color: colors.primaryDark, fontWeight: '900' },
  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }, statPressable: { flex: 1 }, statCard: { flex: 1, minHeight: 130 }, statHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, statIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, statLabel: { color: colors.inkMuted, fontSize: 13 }, statValue: { color: colors.ink, fontSize: 27, fontWeight: '900', marginTop: spacing.md },
  positive: { color: colors.primary, fontWeight: '800', marginTop: spacing.xs }, appointment: { color: colors.warning, fontWeight: '800', marginTop: spacing.xs },
  planCard: { gap: spacing.lg }, cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' }, mealRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkHelp: { color: colors.inkMuted, fontSize: 12, marginTop: -spacing.sm }, mealDot: { width: 30, height: 30, borderRadius: radius.pill, borderWidth: 2, borderColor: 'rgba(23,53,46,0.10)', alignItems: 'center', justifyContent: 'center' }, check: { color: colors.surface, fontWeight: '900', fontSize: 17 }, mealTitle: { color: colors.ink, fontWeight: '800', width: 88 }, mealDetail: { color: colors.inkMuted, flex: 1, fontSize: 13, lineHeight: 18 }, completedText: { textDecorationLine: 'line-through', opacity: 0.58 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, newLabel: { color: colors.primary, fontWeight: '800' },
  agendaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, agendaWhen: { width: 92, backgroundColor: colors.primarySoft, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, alignItems: 'center' }, time: { color: colors.primaryDark, fontWeight: '900', fontSize: 12 }, agendaDate: { color: colors.inkMuted, fontSize: 11, marginTop: 3, textTransform: 'capitalize' }, agendaInfo: { flex: 1 }, patientName: { color: colors.ink, fontWeight: '700' }, agendaReason: { color: colors.inkMuted, fontSize: 12, marginTop: 3 },
  emptyAgenda: { color: colors.inkMuted, lineHeight: 20 },
  attentionBox: { backgroundColor: '#FFF7E7', borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, marginTop: spacing.lg }, attentionTitle: { color: '#8A5A00', fontSize: 18, fontWeight: '900' }, attentionText: { color: '#9D7223' },
});
