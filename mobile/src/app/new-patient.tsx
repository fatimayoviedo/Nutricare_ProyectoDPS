import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { BirthDatePicker } from '@/components/ui/BirthDatePicker';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usePatients } from '@/context/PatientContext';
import { patientSchema, type PatientInputValues, type PatientValues } from '@/schemas/patient';

const sexOptions = [
  { value: 'female' as const, label: 'Mujer' },
  { value: 'male' as const, label: 'Hombre' },
  { value: 'other' as const, label: 'Otro' },
];

export default function NewPatientScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addPatient } = usePatients();
  const [saved, setSaved] = useState(false);
  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<PatientInputValues, unknown, PatientValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { name: '', email: '', birthDate: '', heightCm: '168', sex: 'female', goal: '' },
  });

  if (!user || user.role !== 'nutritionist') return <Redirect href="/" />;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await addPatient(values);
      setSaved(true);
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'No fue posible registrar al paciente.' });
    }
  });

  return (
    <Screen><BrandHeader role={user.role} />
      <Text onPress={() => router.back()} style={styles.back}>← Mis pacientes</Text>
      <Text style={styles.title}>Nuevo paciente</Text><Text style={styles.subtitle}>Crea un expediente básico. El paciente debe ser mayor de edad.</Text>
      <View style={styles.form}>
        <Controller control={control} name="name" render={({ field }) => <FormField label="Nombre completo" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} autoComplete="name" error={errors.name?.message} />} />
        <Controller control={control} name="email" render={({ field }) => <FormField label="Correo electrónico" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email?.message} />} />
        <Controller control={control} name="birthDate" render={({ field }) => <BirthDatePicker value={field.value} onChange={field.onChange} error={errors.birthDate?.message} />} />
        <Controller control={control} name="heightCm" render={({ field }) => <FormField label="Estatura (cm)" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} keyboardType="decimal-pad" placeholder="Ej. 168" error={errors.heightCm?.message} />} />
        <Text style={styles.heightHelp}>Se guarda en el expediente y se reutiliza automáticamente en cada medición.</Text>
        <Text style={styles.label}>Sexo</Text>
        <Controller control={control} name="sex" render={({ field }) => <View style={styles.options}>{sexOptions.map((option) => <Pressable key={option.value} onPress={() => field.onChange(option.value)} style={[styles.option, field.value === option.value && styles.optionActive]}><Text style={[styles.optionText, field.value === option.value && styles.optionTextActive]}>{option.label}</Text></Pressable>)}</View>} />
        <Controller control={control} name="goal" render={({ field }) => <FormField label="Objetivo principal" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} placeholder="Ej. Mejorar hábitos de alimentación" error={errors.goal?.message} />} />
        {errors.root?.message ? <Text style={styles.error}>{errors.root.message}</Text> : null}
        <PrimaryButton label="Guardar paciente" onPress={() => void onSubmit()} loading={isSubmitting} />
      </View>
      <Modal transparent visible={saved} animationType="fade" onRequestClose={() => setSaved(false)}><View style={styles.backdrop}><View style={styles.dialog}><Text style={styles.successIcon}>✓</Text><Text style={styles.dialogTitle}>Paciente registrado</Text><Text style={styles.dialogText}>El expediente fue guardado correctamente y ya aparece en Mis pacientes.</Text><PrimaryButton label="Volver a pacientes" onPress={() => { setSaved(false); router.back(); }} /></View></View></Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '800', marginBottom: spacing.lg }, title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: colors.inkMuted, lineHeight: 21, marginTop: spacing.sm }, form: { gap: spacing.lg, marginTop: spacing.xl }, label: { color: colors.ink, fontSize: 13, fontWeight: '800', marginBottom: -spacing.sm },
  options: { flexDirection: 'row', gap: spacing.sm }, option: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, optionText: { color: colors.inkMuted, fontWeight: '700' }, optionTextActive: { color: colors.primaryDark },
  error: { color: colors.danger, backgroundColor: '#FDEAEA', borderRadius: radius.sm, padding: spacing.md }, backdrop: { flex: 1, backgroundColor: 'rgba(23,53,46,0.48)', justifyContent: 'center', padding: spacing.xl }, dialog: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, width: '100%', maxWidth: 430, alignSelf: 'center' }, successIcon: { alignSelf: 'center', width: 54, height: 54, borderRadius: radius.pill, backgroundColor: colors.primarySoft, color: colors.primary, textAlign: 'center', textAlignVertical: 'center', fontSize: 28, fontWeight: '900', overflow: 'hidden' }, dialogTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', textAlign: 'center' }, dialogText: { color: colors.inkMuted, lineHeight: 21, textAlign: 'center' },
  heightHelp: { color: colors.inkMuted, fontSize: 12, lineHeight: 18, marginTop: -spacing.md },
});
