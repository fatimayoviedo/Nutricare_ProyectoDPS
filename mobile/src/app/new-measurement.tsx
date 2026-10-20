import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useMeasurements } from '@/context/MeasurementContext';
import { usePatients } from '@/context/PatientContext';
import { officeMeasurementSchema } from '@/schemas/measurement';
import type { AdditionalMeasurement } from '@/types/measurement';

const units: AdditionalMeasurement['unit'][] = ['cm', 'kg', '%', 'mm'];
const today = new Date();
const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

interface ExtraDraft { id: number; name: string; value: string; unit: AdditionalMeasurement['unit'] }

export default function NewMeasurementScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ patientId?: string }>();
  const { patients, setPatientHeight } = usePatients();
  const { addMeasurement, measurements, isReady } = useMeasurements();
  const [patientId, setPatientId] = useState(params.patientId ?? '');
  const [patientPickerOpen, setPatientPickerOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [metabolicAge, setMetabolicAge] = useState('');
  const [extras, setExtras] = useState<ExtraDraft[]>([]);
  const [unitPickerId, setUnitPickerId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedBmi, setSavedBmi] = useState<number | null>(null);
  const selectedPatient = patients.find((patient) => patient.id === patientId);
  const patientMeasurements = measurements.filter((item) => item.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));

  if (!user || user.role !== 'nutritionist') return <Redirect href="/" />;

  async function save() {
    const parsed = officeMeasurementSchema.safeParse({
      patientId,
      date: todayLocal,
      weightKg: Number(weight.replace(',', '.')),
      heightCm: selectedPatient?.heightCm ?? Number(height.replace(',', '.')),
      bodyFatPercentage: Number(bodyFat.replace(',', '.')),
      muscleMassPercentage: Number(muscleMass.replace(',', '.')),
      metabolicAge: Number(metabolicAge.replace(',', '.')),
      additionalMeasurements: extras.map((item) => ({ name: item.name, value: Number(item.value.replace(',', '.')), unit: item.unit })),
    });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Revisa los datos ingresados.'); return; }
    setError('');
    setSaving(true);
    try {
      if (selectedPatient && !selectedPatient.heightCm) await setPatientHeight(selectedPatient.id, parsed.data.heightCm);
      const result = await addMeasurement(parsed.data);
      setSavedBmi(result.bmi);
      setWeight(''); setBodyFat(''); setMuscleMass(''); setMetabolicAge(''); setExtras([]);
    } catch {
      setError('No fue posible guardar la medición. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  function updateExtra(id: number, change: Partial<ExtraDraft>) {
    setExtras((current) => current.map((item) => item.id === id ? { ...item, ...change } : item));
  }

  return (
    <Screen>
      <BrandHeader role={user.role} />
      <Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={styles.back}>← Mediciones</Text></Pressable>
      <Text style={styles.title}>Registrar medición</Text>
      <Text style={styles.subtitle}>Datos tomados en el consultorio con báscula especializada.</Text>

      <SurfaceCard style={styles.form}>
        <Text style={styles.fieldLabel}>Paciente</Text>
        <Pressable accessibilityRole="button" onPress={() => setPatientPickerOpen(true)} style={styles.selector}><Text style={selectedPatient ? styles.selectorValue : styles.selectorPlaceholder}>{selectedPatient?.name ?? 'Selecciona un paciente'}</Text><Text style={styles.selectorArrow}>⌄</Text></Pressable>
        <Text style={styles.fieldLabel}>Fecha de medición: {todayLocal}</Text>
        <Text style={styles.mode}>Modalidad: Consultorio · báscula especializada</Text>
        <FormField label="Peso (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="Ej. 68.4" />
        {selectedPatient?.heightCm ? <View style={styles.fixedHeight}><View><Text style={styles.fixedHeightLabel}>Estatura del expediente</Text><Text style={styles.fixedHeightValue}>{selectedPatient.heightCm} cm</Text></View><Text style={styles.fixedHeightBadge}>Guardada</Text></View> : <><FormField label="Estatura del paciente (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="Ej. 168" /><Text style={styles.fixedHeightHelp}>Se solicitará una sola vez y quedará guardada en el expediente.</Text></>}
        <FormField label="Grasa corporal (%)" value={bodyFat} onChangeText={setBodyFat} keyboardType="decimal-pad" placeholder="Ej. 23.8" />
        <FormField label="Masa muscular (%)" value={muscleMass} onChangeText={setMuscleMass} keyboardType="decimal-pad" placeholder="Ej. 37.2" />
        <FormField label="Edad metabólica" value={metabolicAge} onChangeText={setMetabolicAge} keyboardType="numeric" placeholder="Ej. 30" />

        <Text style={styles.extraTitle}>Medidas adicionales</Text>
        {extras.map((item, index) => <View key={item.id} style={styles.extraCard}>
          <View style={styles.extraHeader}><Text style={styles.fieldLabel}>Medida {index + 1}</Text><Pressable onPress={() => setExtras((current) => current.filter((extra) => extra.id !== item.id))} accessibilityLabel={`Eliminar medida ${index + 1}`}><Text style={styles.remove}>Eliminar</Text></Pressable></View>
          <FormField label="Nombre" value={item.name} onChangeText={(name) => updateExtra(item.id, { name })} placeholder="Ej. Cintura" />
          <View style={styles.extraValueRow}><View style={styles.extraValue}><FormField label="Valor" value={item.value} onChangeText={(value) => updateExtra(item.id, { value })} keyboardType="decimal-pad" /></View><Pressable onPress={() => setUnitPickerId(unitPickerId === item.id ? null : item.id)} style={styles.unitButton} accessibilityLabel={`Unidad ${item.unit}. Abrir opciones`}><Text style={styles.unitText}>{item.unit} ⌄</Text></Pressable></View>
          {unitPickerId === item.id ? <View style={styles.unitDropdown}>{units.map((unit) => <Pressable key={unit} style={[styles.unitOption, item.unit === unit && styles.unitOptionActive]} onPress={() => { updateExtra(item.id, { unit }); setUnitPickerId(null); }}><Text style={[styles.unitOptionText, item.unit === unit && styles.unitOptionTextActive]}>{unit}</Text></Pressable>)}</View> : null}
        </View>)}
        <PrimaryButton label="+ Agregar medida adicional" variant="secondary" onPress={() => setExtras((current) => [...current, { id: Date.now() + current.length, name: '', value: '', unit: 'cm' }])} />
        {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
        <PrimaryButton label="Guardar y calcular IMC" onPress={() => void save()} loading={saving} disabled={!isReady} />
      </SurfaceCard>

      {selectedPatient && patientMeasurements.length > 0 ? <View style={styles.history}>
        <Text style={styles.extraTitle}>Mediciones guardadas de {selectedPatient.name}</Text>
        {patientMeasurements.slice(0, 3).map((item) => <SurfaceCard key={item.id}><Text style={styles.historyDate}>{item.date}</Text><Text style={styles.historyValues}>{item.weightKg} kg · IMC {item.bmi} · Grasa {item.bodyFatPercentage}%</Text></SurfaceCard>)}
      </View> : null}

      <Modal transparent visible={patientPickerOpen} animationType="fade" onRequestClose={() => setPatientPickerOpen(false)}>
        <View style={styles.backdrop}><Pressable style={StyleSheet.absoluteFill} onPress={() => setPatientPickerOpen(false)} /><View style={styles.dialog}>
          <Text style={styles.dialogTitle}>Selecciona un paciente</Text>
          {patients.map((patient) => <Pressable key={patient.id} accessibilityRole="button" onPress={() => { setPatientId(patient.id); setPatientPickerOpen(false); }} style={styles.patientOption}><Text style={styles.patientOptionText}>{patient.name}</Text></Pressable>)}
          <PrimaryButton label="Cancelar" variant="secondary" onPress={() => setPatientPickerOpen(false)} />
        </View></View>
      </Modal>
      <Modal transparent visible={savedBmi !== null} animationType="fade" onRequestClose={() => setSavedBmi(null)}>
        <View style={styles.backdrop}><View style={styles.dialog}>
          <Text style={styles.successIcon}>✓</Text><Text style={styles.dialogTitle}>Medición guardada</Text>
          <Text style={styles.successText}>El IMC calculado es {savedBmi}. La medición quedó registrada en este dispositivo.</Text>
          <PrimaryButton label="Aceptar" onPress={() => setSavedBmi(null)} />
        </View></View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '800', marginBottom: spacing.lg }, title: { color: colors.ink, fontSize: 31, fontWeight: '900' }, subtitle: { color: colors.inkMuted, marginTop: spacing.sm, lineHeight: 21 },
  form: { gap: spacing.lg, marginTop: spacing.xl }, fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: '800' }, selector: { minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, selectorValue: { color: colors.ink }, selectorPlaceholder: { color: colors.inkMuted }, selectorArrow: { color: colors.primary, fontSize: 22 }, mode: { color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: spacing.md, borderRadius: radius.md, fontWeight: '700', fontSize: 12 },
  fixedHeight: { minHeight: 72, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, fixedHeightLabel: { color: colors.inkMuted, fontSize: 12, fontWeight: '700' }, fixedHeightValue: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: spacing.xs }, fixedHeightBadge: { color: colors.primaryDark, backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, fontWeight: '900', fontSize: 12 }, fixedHeightHelp: { color: colors.inkMuted, fontSize: 12, lineHeight: 18, marginTop: -spacing.md },
  extraTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: spacing.sm }, extraCard: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.md, gap: spacing.md }, extraHeader: { flexDirection: 'row', justifyContent: 'space-between' }, remove: { color: colors.danger, fontWeight: '800' }, extraValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }, extraValue: { flex: 1 }, unitButton: { minWidth: 76, minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }, unitText: { color: colors.primary, fontWeight: '800' }, unitDropdown: { alignSelf: 'flex-end', width: 120, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden' }, unitOption: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }, unitOptionActive: { backgroundColor: colors.primarySoft }, unitOptionText: { color: colors.ink, fontWeight: '700' }, unitOptionTextActive: { color: colors.primary, fontWeight: '900' }, error: { color: colors.danger, backgroundColor: '#FDEAEA', borderRadius: radius.sm, padding: spacing.md },
  history: { gap: spacing.md, marginTop: spacing.xl }, historyDate: { color: colors.primary, fontWeight: '800' }, historyValues: { color: colors.ink, marginTop: spacing.sm },
  backdrop: { flex: 1, backgroundColor: 'rgba(23,53,46,0.45)', justifyContent: 'center', padding: spacing.xl }, dialog: { backgroundColor: colors.surface, width: '100%', maxWidth: 430, alignSelf: 'center', borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md }, dialogTitle: { color: colors.ink, textAlign: 'center', fontSize: 20, fontWeight: '900' }, patientOption: { padding: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }, patientOptionText: { color: colors.ink, fontWeight: '700' }, successIcon: { color: colors.primary, backgroundColor: colors.primarySoft, fontSize: 26, fontWeight: '900', textAlign: 'center', textAlignVertical: 'center', width: 52, height: 52, borderRadius: radius.pill, overflow: 'hidden', alignSelf: 'center' }, successText: { color: colors.inkMuted, textAlign: 'center', lineHeight: 21 },
});
