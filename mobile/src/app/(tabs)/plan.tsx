import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usePhotos } from '@/context/PhotoContext';
import { patientMeals } from '@/data/demo';
import { monthlyMealsForDay } from '@/data/monthlyPlan';

function PatientPlan() {
  const router = useRouter();
  const { photos } = usePhotos();
  const todayKey = new Date().toDateString();
  const completedMeals = patientMeals.filter((_, index) => photos.some((photo) => new Date(photo.createdAt).toDateString() === todayKey && photo.mealType.toLowerCase() === monthlyMealsForDay(Math.min(new Date().getDate(), 31))[index].title.toLowerCase())).length;
  const progress = Math.round((completedMeals / patientMeals.length) * 100);
  const day = Math.min(new Date().getDate(), 31);
  const dayMeals = monthlyMealsForDay(day);
  return (
    <>
      <View style={styles.titleRow}><Text style={styles.title}>Mi plan nutricional</Text><Text style={styles.today}>OCTUBRE 2026</Text></View>
      <View style={styles.summary}><View><Text style={styles.summaryTitle}>Plan mensual activo</Text><Text style={styles.summaryText}>{completedMeals} de {patientMeals.length} comidas registradas hoy</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><Text style={styles.percent}>{progress}%</Text></View>
      <PrimaryButton label="Ver plan mensual e indicaciones" variant="secondary" onPress={() => router.push('/monthly-plan')} style={styles.monthlyButton} />
      <Text style={styles.dailyTitle}>Menú del {day} de octubre</Text>
      <View style={styles.list}>
        {patientMeals.map((meal, index) => {
          const hasPhoto = photos.some((photo) => new Date(photo.createdAt).toDateString() === todayKey && photo.mealType.toLowerCase() === dayMeals[index].title.toLowerCase());
          return (
          <SurfaceCard key={meal.id}>
            <View style={styles.mealHeader}><View style={[styles.mealDot, { backgroundColor: meal.color }]} /><View style={styles.mealHeading}><Text style={styles.mealTitle}>{dayMeals[index].title}</Text><Text style={styles.time}>{dayMeals[index].time}</Text></View>{hasPhoto ? <Text onPress={() => router.push('/saved-photos')} style={styles.done}>Ver foto guardada</Text> : <Text onPress={() => router.push('/upload-photo')} style={styles.addPhoto}>+ Agregar foto</Text>}</View>
            <Text style={styles.detail}>{dayMeals[index].description}</Text>
            <Text style={styles.portion}>Porción: {dayMeals[index].portion} · {dayMeals[index].calories} kcal</Text>
          </SurfaceCard>
        );})}
      </View>
      <View style={styles.photoActions}><PrimaryButton label="+  Agregar fotografía de comida" onPress={() => router.push('/upload-photo')} /><PrimaryButton label="Ver fotografías guardadas" variant="secondary" onPress={() => router.push('/saved-photos')} /></View>
      <Text style={styles.privacy}>Solo tú y tu nutricionista podrán verla.</Text>
    </>
  );
}

const professionalPlans = [
  { patient: 'Gerardo Peña', title: 'Plan equilibrado · 1,750 kcal', month: 'Octubre 2026', active: true },
  { patient: 'Ana Martínez', title: 'Plan de hábitos saludables · 1,650 kcal', month: 'Octubre 2026', active: true },
  { patient: 'Carlos López', title: 'Plan de ganancia muscular · 2,300 kcal', month: 'Septiembre 2026', active: false },
];

function NutritionistPlans() {
  const activePlans = professionalPlans.filter((plan) => plan.active).length;
  return (
    <>
      <Text style={styles.title}>Planes de pacientes</Text><Text style={styles.intro}>Consulta el panorama mensual y los planes que requieren renovación.</Text>
      <View style={styles.planSummaryRow}>
        <SurfaceCard style={styles.planSummaryCard}><View style={styles.summaryHeading}><View style={styles.activeIcon}><SymbolView name={{ ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' }} size={20} tintColor={colors.primary} /></View><Text style={styles.statLabel}>Planes activos</Text></View><Text style={styles.statValue}>{activePlans}</Text><Text style={styles.statHint}>En seguimiento</Text></SurfaceCard>
        <SurfaceCard style={styles.planSummaryCard}><View style={styles.summaryHeading}><View style={styles.renewIcon}><SymbolView name={{ ios: 'arrow.clockwise.circle.fill', android: 'autorenew', web: 'autorenew' }} size={20} tintColor={colors.warning} /></View><Text style={styles.statLabel}>Por renovar</Text></View><Text style={styles.statValue}>{professionalPlans.length - activePlans}</Text><Text style={styles.renewHint}>Requieren revisión</Text></SurfaceCard>
      </View>
      <View style={styles.list}>{professionalPlans.map((plan) => <SurfaceCard key={plan.patient}><View style={styles.professionalPlanRow}><View style={styles.planAvatar}><Text style={styles.avatarText}>{plan.patient.split(' ').map((part) => part[0]).join('').slice(0, 2)}</Text></View><View style={styles.patientInfo}><Text style={styles.mealTitle}>{plan.patient}</Text><Text style={styles.planName}>{plan.title}</Text><Text style={styles.detail}>{plan.month}</Text></View><Text style={plan.active ? styles.activePlan : styles.renewPlan}>{plan.active ? 'Plan activo' : 'Por renovar'}</Text></View></SurfaceCard>)}</View>
    </>
  );
}

export default function PlanScreen() {
  const { user } = useAuth(); if (!user) return null;
  return <Screen><BrandHeader role={user.role} />{user.role === 'patient' ? <PatientPlan /> : <NutritionistPlans />}</Screen>;
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }, title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1 },
  today: { color: colors.primary, fontSize: 11, fontWeight: '900', backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, overflow: 'hidden' },
  summary: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md }, summaryTitle: { color: colors.surface, fontSize: 17, fontWeight: '900' }, summaryText: { color: '#D9F3EA', fontSize: 12, marginTop: spacing.xs },
  progressTrack: { flex: 1, height: 10, borderRadius: radius.pill, backgroundColor: colors.primaryDark, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: colors.lime }, percent: { color: colors.surface, fontWeight: '900' },
  list: { gap: spacing.md, marginVertical: spacing.lg }, mealHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, mealDot: { width: 38, height: 38, borderRadius: radius.pill }, mealHeading: { flex: 1 }, mealTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  time: { color: colors.inkMuted, fontSize: 12, marginTop: 3 }, detail: { color: colors.ink, marginTop: spacing.md, lineHeight: 19 }, portion: { color: colors.inkMuted, marginTop: spacing.xs, fontSize: 12, lineHeight: 18 }, done: { color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, overflow: 'hidden', fontSize: 11, fontWeight: '800' },
  addPhoto: { color: colors.surface, backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 10, overflow: 'hidden', fontSize: 11, fontWeight: '800' }, photoActions: { gap: spacing.md }, privacy: { textAlign: 'center', color: colors.inkMuted, fontSize: 12, marginTop: spacing.md },
  intro: { color: colors.inkMuted, lineHeight: 21, marginTop: spacing.sm },
  monthlyButton: { marginTop: spacing.lg }, dailyTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: spacing.xl },
  planSummaryRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }, planSummaryCard: { flex: 1, minHeight: 132, justifyContent: 'center', gap: spacing.xs }, summaryHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, activeIcon: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }, renewIcon: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: '#FFF4D9', alignItems: 'center', justifyContent: 'center' }, statLabel: { color: colors.inkMuted, fontSize: 13, flex: 1 }, statValue: { color: colors.ink, fontSize: 28, fontWeight: '900', marginTop: spacing.xs }, statHint: { color: colors.primary, fontSize: 11, fontWeight: '800' }, renewHint: { color: colors.warning, fontSize: 11, fontWeight: '800' },
  professionalPlanRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, planAvatar: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.primaryDark, fontWeight: '900' }, patientInfo: { flex: 1 }, planName: { color: colors.inkMuted, fontSize: 12, marginTop: 3 }, activePlan: { color: colors.primary, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 6, overflow: 'hidden', fontSize: 10, fontWeight: '800' }, renewPlan: { color: '#8A5A00', backgroundColor: '#FFF2D7', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 6, overflow: 'hidden', fontSize: 10, fontWeight: '800' },
});
