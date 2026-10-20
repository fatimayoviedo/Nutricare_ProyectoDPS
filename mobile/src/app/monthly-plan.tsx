import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { Screen } from '@/components/ui/Screen';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { patientClinicalGuidance } from '@/data/demo';
import { monthlyMealsForDay } from '@/data/monthlyPlan';

const days = Array.from({ length: 31 }, (_, index) => index + 1);
const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const firstWeekday = new Date(2026, 9, 1).getDay();

export default function MonthlyPlanScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [day, setDay] = useState(() => Math.min(new Date().getDate(), 31));
  const dayMeals = monthlyMealsForDay(day);

  if (!user || user.role !== 'patient') return <Redirect href="/" />;

  return (
    <Screen>
      <BrandHeader role={user.role} />
      <Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={styles.back}>← Mi plan</Text></Pressable>
      <Text style={styles.title}>Plan mensual</Text>
      <Text style={styles.subtitle}>Plan equilibrado · 1,750 kcal</Text>
      <SurfaceCard style={styles.monthCard}>
        <Text style={styles.cardTitle}>Octubre de 2026</Text>
        <Text style={styles.objective}>Objetivo: pérdida de peso gradual y sostenible.</Text>
        <View style={styles.calendar}>
          {weekdays.map((label, index) => <Text key={`${label}-${index}`} style={styles.weekday}>{label}</Text>)}
          {Array.from({ length: firstWeekday }, (_, index) => <View key={`empty-${index}`} style={styles.dayCell} />)}
          {days.map((number) => <Pressable key={number} accessibilityRole="button" accessibilityLabel={`Ver menú del ${number} de octubre`} accessibilityState={{ selected: day === number }} onPress={() => setDay(number)} style={[styles.dayCell, day === number && styles.selectedDay]}><Text style={[styles.dayText, day === number && styles.selectedDayText]}>{number}</Text></Pressable>)}
        </View>
      </SurfaceCard>

      <Text style={styles.sectionTitle}>Menú del {day} de octubre</Text>
      <Text style={styles.menuNote}>Cinco tiempos de comida y porciones asignadas para este día.</Text>
      <View style={styles.list}>
        {dayMeals.map((meal, index) => <SurfaceCard key={`${day}-${index}`}>
          <View style={styles.mealHeading}><Text style={styles.mealTitle}>{meal.title}</Text><Text style={styles.time}>{meal.time}</Text></View>
          <Text style={styles.description}>{meal.description}</Text>
          <Text style={styles.portion}>Porción: {meal.portion}</Text>
          <Text style={styles.portion}>{meal.calories} kcal</Text>
        </SurfaceCard>)}
      </View>

      <Text style={styles.sectionTitle}>Indicaciones clínicas de tu nutricionista</Text>
      <Text style={styles.menuNote}>Estas indicaciones son de lectura. Consulta a tu profesional antes de iniciar suplementos o exámenes.</Text>
      <View style={styles.list}>
        {patientClinicalGuidance.map((section) => <SurfaceCard key={section.title}>
          <Text style={styles.guidanceTitle}>{section.title}</Text>
          {section.items.map((item) => <Text key={item} style={styles.guidanceItem}>• {item}</Text>)}
        </SurfaceCard>)}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '800', marginBottom: spacing.lg }, title: { color: colors.ink, fontSize: 31, fontWeight: '900' }, subtitle: { color: colors.inkMuted, marginTop: spacing.xs },
  monthCard: { marginTop: spacing.lg, gap: spacing.sm }, cardTitle: { color: colors.ink, fontSize: 19, fontWeight: '900' }, objective: { color: colors.inkMuted, fontSize: 13, lineHeight: 19 },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }, weekday: { width: '14.285%', textAlign: 'center', color: colors.inkMuted, fontWeight: '800', paddingVertical: spacing.sm },
  dayCell: { width: '14.285%', height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill }, dayText: { color: colors.ink, fontWeight: '700' }, selectedDay: { backgroundColor: colors.primary }, selectedDayText: { color: colors.surface },
  sectionTitle: { color: colors.ink, fontSize: 19, fontWeight: '900', marginTop: spacing.xl }, menuNote: { color: colors.inkMuted, fontSize: 13, lineHeight: 19, marginTop: spacing.sm }, list: { gap: spacing.md, marginTop: spacing.lg },
  mealHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }, mealTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' }, time: { color: colors.primary, fontWeight: '800', fontSize: 12 }, description: { color: colors.ink, lineHeight: 20, marginTop: spacing.sm }, portion: { color: colors.inkMuted, fontSize: 12, marginTop: spacing.xs },
  guidanceTitle: { color: colors.ink, fontSize: 16, fontWeight: '900', marginBottom: spacing.sm }, guidanceItem: { color: colors.inkMuted, lineHeight: 21, marginTop: spacing.xs },
});
