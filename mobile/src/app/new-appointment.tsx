import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { BirthDatePicker } from '@/components/ui/BirthDatePicker';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useAppointments } from '@/context/AppointmentContext';
import { useAuth } from '@/context/AuthContext';

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

function toTwentyFourHour(clock: string, period: 'AM' | 'PM') {
  const [rawHour, minute] = clock.split(':').map(Number);
  const hour = period === 'AM' ? rawHour % 12 : (rawHour % 12) + 12;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export default function NewAppointmentScreen() {
  const router = useRouter(); const { user } = useAuth(); const { addAppointment } = useAppointments();
  const [name, setName] = useState(''); const [date, setDate] = useState(today); const [clock, setClock] = useState('10:30'); const [period, setPeriod] = useState<'AM' | 'PM'>('AM'); const [periodOpen, setPeriodOpen] = useState(false); const [reason, setReason] = useState(''); const [saved, setSaved] = useState(false); const [error, setError] = useState('');
  if (!user || user.role !== 'nutritionist') return <Redirect href="/" />;
  async function save() { if (!name.trim() || !date || !/^(0?[1-9]|1[0-2]):[0-5]\d$/.test(clock)) { setError('Selecciona la fecha e ingresa una hora válida entre 01:00 y 12:59.'); return; } setError(''); await addAppointment({ name: name.trim(), date, time: toTwentyFourHour(clock, period), reason: reason.trim() }); setSaved(true); }
  return <Screen><BrandHeader role={user.role} /><Pressable onPress={() => router.back()}><Text style={styles.back}>← Agenda</Text></Pressable><Text style={styles.title}>Nueva consulta</Text><Text style={styles.subtitle}>Programa una cita para cualquier fecha disponible.</Text><SurfaceCard style={styles.form}><FormField label="Paciente" value={name} onChangeText={setName} placeholder="Nombre completo" /><BirthDatePicker label="Fecha de la consulta" value={date} onChange={setDate} fallbackYear={now.getFullYear()} /><View><Text style={styles.fieldLabel}>Hora</Text><View style={styles.timeRow}><View style={styles.clockField}><FormField label="" value={clock} onChangeText={setClock} placeholder="10:30" /></View><Pressable style={styles.periodButton} onPress={() => setPeriodOpen((open) => !open)}><Text style={styles.periodText}>{period} ⌄</Text></Pressable></View>{periodOpen ? <View style={styles.periodDropdown}>{(['AM', 'PM'] as const).map((option) => <Pressable key={option} style={[styles.periodOption, period === option && styles.periodOptionActive]} onPress={() => { setPeriod(option); setPeriodOpen(false); }}><Text style={styles.periodText}>{option}</Text></Pressable>)}</View> : null}</View><FormField label="Motivo" value={reason} onChangeText={setReason} placeholder="Control nutricional" />{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton label="Guardar consulta" onPress={() => void save()} /></SurfaceCard><Modal transparent visible={saved} animationType="fade"><View style={styles.backdrop}><View style={styles.dialog}><Text style={styles.icon}>✓</Text><Text style={styles.dialogTitle}>Consulta guardada</Text><Text style={styles.dialogText}>La consulta del {date} a las {clock} {period} ya aparece en la agenda.</Text><PrimaryButton label="Volver a la agenda" onPress={() => { setSaved(false); router.back(); }} /></View></View></Modal></Screen>;
}

const styles = StyleSheet.create({ back: { color: colors.primary, fontWeight: '800', marginBottom: spacing.lg }, title: { color: colors.ink, fontSize: 31, fontWeight: '900' }, subtitle: { color: colors.inkMuted, marginTop: spacing.sm }, form: { gap: spacing.lg, marginTop: spacing.xl }, fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 7 }, timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }, clockField: { flex: 1 }, periodButton: { width: 92, minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, periodText: { color: colors.primaryDark, fontWeight: '800' }, periodDropdown: { width: 92, alignSelf: 'flex-end', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface, marginTop: spacing.xs }, periodOption: { paddingVertical: spacing.md, alignItems: 'center' }, periodOptionActive: { backgroundColor: colors.primarySoft }, error: { color: colors.danger }, backdrop: { flex: 1, backgroundColor: 'rgba(23,53,46,.48)', justifyContent: 'center', padding: spacing.xl }, dialog: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md }, icon: { alignSelf: 'center', fontSize: 28, color: colors.primary, fontWeight: '900' }, dialogTitle: { textAlign: 'center', fontSize: 22, fontWeight: '900', color: colors.ink }, dialogText: { textAlign: 'center', color: colors.inkMuted } });
