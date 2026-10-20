import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { recoverySchema, type RecoveryValues } from '@/schemas/auth';

export default function ForgotPasswordScreen() {
  const { control, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<RecoveryValues>({ resolver: zodResolver(recoverySchema), defaultValues: { email: '' } });
  const onSubmit = handleSubmit(async () => { await new Promise((resolve) => setTimeout(resolve, 600)); });

  return (
    <Screen>
      <BrandHeader />
      <Link href="/login" style={styles.back}>← Volver</Link>
      <View style={styles.icon}><SymbolView name={{ ios: 'key.fill', android: 'key', web: 'key' }} size={50} tintColor={colors.primary} fallback={<Text style={styles.iconFallback}>◆</Text>} /></View>
      <Text style={styles.title}>Recupera tu acceso</Text>
      <Text style={styles.subtitle}>Recibirás un enlace seguro en tu correo.</Text>
      {isSubmitSuccessful ? <Text style={styles.success}>Solicitud registrada. Si el correo existe, recibirás las instrucciones de recuperación.</Text> : null}
      <View style={styles.form}>
        <Controller control={control} name="email" render={({ field }) => <FormField label="Correo electrónico" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email?.message} />} />
        <PrimaryButton label="Enviar enlace" onPress={() => void onSubmit()} loading={isSubmitting} />
        <Link href="/login" asChild><PrimaryButton label="Volver al login" variant="secondary" /></Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '800', marginBottom: spacing.xl }, icon: { width: 116, height: 116, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.xl },
  iconFallback: { color: colors.primary, fontSize: 38, fontWeight: '900' }, title: { color: colors.ink, fontSize: 31, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.inkMuted, textAlign: 'center', marginTop: spacing.md, fontSize: 15 }, success: { backgroundColor: colors.primarySoft, color: colors.primaryDark, padding: spacing.lg, borderRadius: radius.md, lineHeight: 20, marginTop: spacing.xl },
  form: { gap: spacing.lg, marginTop: spacing.xxl },
});
