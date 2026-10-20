import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginValues } from '@/schemas/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try { await login(values.email, values.password); }
    catch (error) { setError('root', { message: error instanceof Error ? error.message : 'No fue posible iniciar sesión.' }); }
  });

  return (
    <Screen contentStyle={styles.content}>
      <BrandHeader />
      <Text style={styles.title}>Bienvenido/a</Text>
      <Text style={styles.subtitle}>Consulta tu plan y revisa tu progreso.</Text>
      <Text style={styles.sectionTitle}>Inicia sesión para continuar</Text>

      <View style={styles.form}>
        <Controller control={control} name="email" render={({ field: { onBlur, onChange, value } }) => (
          <FormField label="Correo electrónico" value={value} onBlur={onBlur} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="nombre@correo.com" error={errors.email?.message} />
        )} />
        <Controller control={control} name="password" render={({ field: { onBlur, onChange, value } }) => (
          <FormField label="Contraseña" value={value} onBlur={onBlur} onChangeText={onChange} autoComplete="current-password" placeholder="••••••••" password error={errors.password?.message} />
        )} />
        <Link href="/forgot-password" style={styles.recovery}>¿Olvidaste tu contraseña?</Link>
        {errors.root?.message ? <Text style={styles.submitError}>{errors.root.message}</Text> : null}
        <PrimaryButton label="Iniciar sesión" onPress={() => void onSubmit()} loading={isSubmitting} />
      </View>

      <Text style={styles.footer}>¿No tienes una cuenta? <Link href="/register" style={styles.link}>Crear cuenta</Link></Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl }, title: { color: colors.ink, fontSize: 34, fontWeight: '900', letterSpacing: -1.2 },
  subtitle: { color: colors.inkMuted, marginTop: spacing.sm, fontSize: 16 }, sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: spacing.xl },
  form: { gap: spacing.lg, marginTop: spacing.lg }, recovery: { color: colors.primary, textAlign: 'right', fontWeight: '700', fontSize: 13 },
  submitError: { backgroundColor: '#FDEAEA', color: colors.danger, padding: spacing.md, borderRadius: radius.sm, lineHeight: 19 },
  footer: { color: colors.inkMuted, textAlign: 'center', marginTop: spacing.xl }, link: { color: colors.primary, fontWeight: '800' },
});
