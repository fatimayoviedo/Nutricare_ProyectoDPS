import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { BirthDatePicker } from '@/components/ui/BirthDatePicker';
import { FormField } from '@/components/ui/FormField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { profileSchema, type ProfileValues } from '@/schemas/auth';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '', birthDate: user?.birthDate ?? '' },
  });

  if (!user) return <Redirect href="/login" />;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile({ name: values.name, birthDate: user.role === 'patient' ? values.birthDate : undefined });
      setSaved(true);
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : 'No fue posible actualizar el perfil.' });
    }
  });

  return (
    <Screen><BrandHeader role={user.role} />
      <Text onPress={() => router.back()} style={styles.back}>← Mi perfil</Text>
      <Text style={styles.title}>Editar perfil</Text><Text style={styles.subtitle}>Actualiza la información visible en tu cuenta.</Text>
      <View style={styles.form}>
        <Controller control={control} name="name" render={({ field }) => <FormField label="Nombre completo" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} autoComplete="name" error={errors.name?.message} />} />
        <FormField label="Correo electrónico" value={user.email} editable={false} style={styles.disabledField} />
        {user.role === 'patient' ? <Controller control={control} name="birthDate" render={({ field }) => <BirthDatePicker value={field.value ?? ''} onChange={field.onChange} error={errors.birthDate?.message} />} /> : null}
        {errors.root?.message ? <Text style={styles.error}>{errors.root.message}</Text> : null}
        <PrimaryButton label="Guardar cambios" onPress={() => void onSubmit()} loading={isSubmitting} />
      </View>
      <Modal transparent visible={saved} animationType="fade" onRequestClose={() => { setSaved(false); router.back(); }}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => { setSaved(false); router.back(); }} accessibilityLabel="Cerrar confirmación" />
          <View style={styles.dialog}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Perfil actualizado</Text>
            <Text style={styles.successText}>Tus cambios se guardaron correctamente.</Text>
            <PrimaryButton label="Aceptar" onPress={() => { setSaved(false); router.back(); }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '800', marginBottom: spacing.lg }, title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1 }, subtitle: { color: colors.inkMuted, lineHeight: 21, marginTop: spacing.sm },
  form: { gap: spacing.lg, marginTop: spacing.xl }, disabledField: { backgroundColor: colors.surfaceMuted, color: colors.inkMuted }, error: { color: colors.danger, backgroundColor: '#FDEAEA', borderRadius: radius.sm, padding: spacing.md },
  backdrop: { flex: 1, backgroundColor: 'rgba(23,53,46,0.45)', justifyContent: 'center', padding: spacing.xl }, dialog: { width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md },
  successIcon: { alignSelf: 'center', width: 52, height: 52, borderRadius: radius.pill, backgroundColor: colors.primarySoft, color: colors.primary, overflow: 'hidden', textAlign: 'center', textAlignVertical: 'center', fontSize: 28, fontWeight: '900' }, successTitle: { color: colors.ink, fontSize: 21, fontWeight: '900', textAlign: 'center' }, successText: { color: colors.inkMuted, textAlign: 'center', marginBottom: spacing.sm },
});
