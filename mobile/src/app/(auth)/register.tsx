import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterValues } from '@/schemas/auth';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', role: 'patient', password: '', confirmPassword: '', acceptTerms: false },
  });

  const onSubmit = handleSubmit(async ({ confirmPassword: _confirmation, acceptTerms: _accepted, ...values }) => {
    try { await register(values); }
    catch (error) { setError('root', { message: error instanceof Error ? error.message : 'No fue posible crear la cuenta.' }); }
  });

  return (
    <Screen>
      <BrandHeader />
      <Text style={styles.title}>Crea tu cuenta</Text>
      <Text style={styles.subtitle}>Completa tus datos para comenzar tu seguimiento.</Text>
      <View style={styles.form}>
        <Controller control={control} name="name" render={({ field }) => <FormField label="Nombre completo" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} autoComplete="name" error={errors.name?.message} />} />
        <Controller control={control} name="email" render={({ field }) => <FormField label="Correo electrónico" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email?.message} />} />
        <Controller control={control} name="role" render={({ field }) => (
          <View style={styles.roleGroup}>
            <Text style={styles.label}>Tipo de cuenta</Text>
            <View style={styles.roleRow}>
              {(['patient', 'nutritionist'] as const).map((role) => <Pressable key={role} onPress={() => field.onChange(role)} style={[styles.roleOption, field.value === role && styles.roleActive]}><Text style={[styles.roleText, field.value === role && styles.roleTextActive]}>{role === 'patient' ? 'Paciente' : 'Nutricionista'}</Text></Pressable>)}
            </View>
          </View>
        )} />
        <Controller control={control} name="password" render={({ field }) => <FormField label="Contraseña" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} password autoComplete="new-password" error={errors.password?.message} />} />
        <Controller control={control} name="confirmPassword" render={({ field }) => <FormField label="Confirmar contraseña" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} password autoComplete="new-password" error={errors.confirmPassword?.message} />} />
        <Controller control={control} name="acceptTerms" render={({ field }) => (
          <Pressable onPress={() => field.onChange(!field.value)} style={styles.termsRow}><View style={[styles.checkbox, field.value && styles.checkboxActive]}>{field.value ? <Text style={styles.check}>✓</Text> : null}</View><Text style={styles.termsText}>Acepto el tratamiento responsable de mis datos.</Text></Pressable>
        )} />
        {errors.acceptTerms?.message ? <Text style={styles.error}>{errors.acceptTerms.message}</Text> : null}
        {errors.root?.message ? <Text style={styles.submitError}>{errors.root.message}</Text> : null}
        <PrimaryButton label="Crear cuenta" onPress={() => void onSubmit()} loading={isSubmitting} />
      </View>
      <Text style={styles.footer}>¿Ya tienes cuenta? <Link href="/login" style={styles.link}>Iniciar sesión</Link></Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 32, fontWeight: '900', letterSpacing: -1 }, subtitle: { color: colors.inkMuted, fontSize: 15, marginTop: spacing.sm, lineHeight: 22 },
  form: { gap: spacing.lg, marginTop: spacing.xl }, label: { color: colors.ink, fontSize: 13, fontWeight: '700' }, roleGroup: { gap: spacing.sm }, roleRow: { flexDirection: 'row', gap: spacing.sm },
  roleOption: { flex: 1, minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  roleActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary }, roleText: { color: colors.inkMuted, fontWeight: '700' }, roleTextActive: { color: colors.primaryDark },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary }, check: { color: colors.surface, fontWeight: '900' }, termsText: { flex: 1, color: colors.inkMuted, fontSize: 13 },
  error: { color: colors.danger, fontSize: 12, marginTop: -spacing.md }, submitError: { backgroundColor: '#FDEAEA', color: colors.danger, padding: spacing.md, borderRadius: radius.sm },
  footer: { color: colors.inkMuted, textAlign: 'center', marginTop: spacing.xl }, link: { color: colors.primary, fontWeight: '800' },
});
