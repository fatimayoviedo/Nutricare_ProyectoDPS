import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { Screen } from '@/components/ui/Screen';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useMeasurements } from '@/context/MeasurementContext';
import { usePatients } from '@/context/PatientContext';
import { weightHistory } from '@/data/demo';

type Period = '6 meses' | '1 año' | 'Todo';
const monthLabels = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
const periods: Period[] = ['6 meses', '1 año', 'Todo'];

function WeightChart({ entries }: { entries: typeof weightHistory }) {
  if (entries.length === 0) return <Text style={styles.noData}>Aún no hay mediciones para este periodo.</Text>;
  const min = Math.min(...entries.map((entry) => entry.weightKg));
  const max = Math.max(...entries.map((entry) => entry.weightKg));
  const range = max - min || 1;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chart}>
      {entries.map(({ date, weightKg }) => {
        const height = 42 + ((weightKg - min) / range) * 86;
        const month = date.slice(5, 7);
        return <View key={date} style={styles.chartColumn}><Text style={styles.chartValue}>{weightKg}</Text><View style={[styles.bar, { height }]} /><Text style={styles.month}>{monthLabels[Number(month) - 1]}</Text></View>;
      })}
    </ScrollView>
  );
}

function PatientProgress() {
  const { user } = useAuth();
  const { patients } = usePatients();
  const { measurements } = useMeasurements();
  const [period, setPeriod] = useState<Period>('6 meses');
  const patient = patients.find((item) => item.email.toLowerCase() === user?.email.toLowerCase());
  const recorded = measurements.filter((item) => item.patientId === patient?.id).map((item) => ({ date: item.date, weightKg: item.weightKg }));
  const allEntries = [...(user?.email === 'paciente@nutricare.com' ? weightHistory : []), ...recorded].sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date();
  const cutoff = (monthsBack: number) => {
    const date = new Date(today.getFullYear(), today.getMonth() - monthsBack + 1, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
  };
  const entries = period === '6 meses' ? allEntries.filter((item) => item.date >= cutoff(6)) : period === '1 año' ? allEntries.filter((item) => item.date >= cutoff(12)) : allEntries;
  const latest = entries.at(-1)?.weightKg ?? 0;
  const first = entries[0]?.weightKg ?? latest;
  const change = latest - first;
  const latestMeasurement = measurements.filter((item) => item.patientId === patient?.id).sort((a, b) => b.date.localeCompare(a.date))[0];
  return (
    <>
      <Text style={styles.title}>Mi progreso</Text>
      <View style={styles.filter}>{periods.map((option) => <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: period === option }} onPress={() => setPeriod(option)} style={[styles.filterOption, period === option && styles.filterSelected]}><Text style={[styles.filterText, period === option && styles.filterActive]}>{option}</Text></Pressable>)}</View>
      <SurfaceCard style={styles.chartCard}><View style={styles.sectionRow}><Text style={styles.cardTitle}>Peso</Text><Text style={styles.current}>{entries.length ? `${latest.toFixed(1)} kg` : '—'}</Text></View><WeightChart entries={entries} /></SurfaceCard>
      {entries.length ? <View style={styles.statRow}><SurfaceCard style={styles.statCard}><Text style={styles.label}>Cambio en {period.toLowerCase()}</Text><Text style={styles.bigValue}>{change > 0 ? '+' : ''}{change.toFixed(1)} kg</Text></SurfaceCard><SurfaceCard style={styles.statCard}><Text style={styles.label}>Meta</Text><Text style={styles.bigValue}>65 kg</Text></SurfaceCard></View> : null}
      {user?.email === 'paciente@nutricare.com' ? <View style={styles.positiveBox}><Text style={styles.positiveTitle}>Tendencia positiva</Text><Text style={styles.positiveText}>Tu avance se mantiene constante. Continúa con tus controles periódicos.</Text></View> : null}
      {(latestMeasurement || user?.email === 'paciente@nutricare.com') ? <SurfaceCard><Text style={styles.cardTitle}>IMC de la última medición</Text><Text style={styles.bmi}>{latestMeasurement?.bmi ?? 24.2}</Text><Text style={styles.label}>{latestMeasurement ? `Registrado el ${latestMeasurement.date}` : 'Medición de septiembre de 2026'}</Text></SurfaceCard> : null}
    </>
  );
}

function NutritionistProgress() {
  const summaries = [
    { name: 'Gerardo Peña', value: '−4.6 kg', note: 'Avance constante', tone: colors.primary },
    { name: 'Ana Martínez', value: '−1.8 kg', note: 'Seguimiento al día', tone: colors.blue },
    { name: 'Carlos López', value: '+0.4 kg', note: 'Requiere revisión', tone: colors.warning },
  ];
  return (
    <>
      <Text style={styles.title}>Estado de pacientes</Text><Text style={styles.intro}>Resumen de las mediciones y cambios más recientes.</Text>
      <View style={styles.list}>{summaries.map((item) => <SurfaceCard key={item.name}><View style={styles.sectionRow}><View><Text style={styles.cardTitle}>{item.name}</Text><Text style={styles.label}>{item.note}</Text></View><Text style={[styles.change, { color: item.tone }]}>{item.value}</Text></View></SurfaceCard>)}</View>
      <View style={styles.positiveBox}><Text style={styles.positiveTitle}>Resumen mensual</Text><Text style={styles.positiveText}>3 pacientes mejoraron sus indicadores y 1 necesita una revisión del plan.</Text></View>
    </>
  );
}

export default function ProgressScreen() {
  const { user } = useAuth(); if (!user) return null;
  return <Screen><BrandHeader role={user.role} />{user.role === 'patient' ? <PatientProgress /> : <NutritionistProgress />}</Screen>;
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1 }, intro: { color: colors.inkMuted, marginTop: spacing.sm },
  filter: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.sm, marginVertical: spacing.lg }, filterOption: { flex: 1, alignItems: 'center', borderRadius: radius.pill, paddingVertical: spacing.sm }, filterSelected: { backgroundColor: colors.primary }, filterText: { color: colors.inkMuted }, filterActive: { color: colors.surface, fontWeight: '800' },
  chartCard: { gap: spacing.lg }, sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }, cardTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' }, current: { color: colors.primary, fontSize: 22, fontWeight: '900' },
  chart: { height: 185, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, paddingTop: spacing.lg }, chartColumn: { width: 41, alignItems: 'center', justifyContent: 'flex-end', gap: 5 }, chartValue: { color: colors.inkMuted, fontSize: 9 }, bar: { width: 18, borderRadius: radius.pill, backgroundColor: colors.primary }, month: { color: colors.inkMuted, fontSize: 10 },
  statRow: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.lg }, statCard: { flex: 1 }, label: { color: colors.inkMuted, fontSize: 13, marginTop: spacing.xs }, bigValue: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: spacing.md },
  positiveBox: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm, marginBottom: spacing.lg }, positiveTitle: { color: colors.primaryDark, fontSize: 18, fontWeight: '900' }, positiveText: { color: colors.inkMuted, lineHeight: 21 },
  bmi: { color: colors.primary, fontSize: 32, fontWeight: '900', marginTop: spacing.sm }, list: { gap: spacing.md, marginVertical: spacing.lg }, change: { fontSize: 20, fontWeight: '900' },
  noData: { color: colors.inkMuted, lineHeight: 20, marginVertical: spacing.lg },
});
