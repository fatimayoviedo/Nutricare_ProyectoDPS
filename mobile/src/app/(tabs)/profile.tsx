import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usePatients } from '@/context/PatientContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { patients } = usePatients();
  const [showLogout, setShowLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogout(false);
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Screen><BrandHeader role={user.role} />
      <Text style={styles.title}>Mi perfil</Text>
      <SurfaceCard style={styles.profileCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</Text></View>
        <Text style={styles.name}>{user.name}</Text><Text style={styles.email}>{user.email}</Text>
      </SurfaceCard>
      <SurfaceCard style={styles.details}>
        <Text style={styles.sectionTitle}>Información de la cuenta</Text>
        <View style={styles.detailRow}><Text style={styles.label}>Tipo de perfil</Text><Text style={styles.value}>{user.role === 'patient' ? 'Paciente' : 'Nutricionista'}</Text></View>
        {user.role === 'patient' ? <><View style={styles.separator} /><View style={styles.detailRow}><Text style={styles.label}>Fecha de nacimiento</Text><Text style={styles.value}>{user.birthDate ?? 'Sin registrar'}</Text></View><View style={styles.separator} /><View style={styles.detailRow}><Text style={styles.label}>Nutricionista</Text><Text style={styles.value}>Licda. Fátima Oviedo</Text></View></> : <><View style={styles.separator} /><View style={styles.detailRow}><Text style={styles.label}>Pacientes activos</Text><Text style={styles.value}>{patients.length}</Text></View></>}
      </SurfaceCard>
      <View style={styles.actions}><PrimaryButton label="Editar perfil" variant="secondary" onPress={() => router.push('/edit-profile')} /><PrimaryButton label="Cerrar sesión" onPress={() => setShowLogout(true)} /></View>
      <Modal transparent visible={showLogout} animationType="fade" onRequestClose={() => setShowLogout(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowLogout(false)} accessibilityLabel="Cerrar confirmación" />
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}><Text style={styles.modalIconText}>↪</Text></View>
            <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.modalMessage}>Saldrás de tu cuenta de NutriCare. Podrás volver a ingresar con tu correo y contraseña.</Text>
            <View style={styles.modalActions}>
              <PrimaryButton label="Cancelar" variant="secondary" onPress={() => setShowLogout(false)} style={styles.modalButton} />
              <PrimaryButton label="Sí, cerrar sesión" loading={isLoggingOut} onPress={() => void handleLogout()} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1, marginBottom: spacing.lg }, profileCard: { alignItems: 'center', gap: spacing.sm },
  avatar: { width: 82, height: 82, borderRadius: radius.pill, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }, avatarText: { color: colors.primaryDark, fontSize: 26, fontWeight: '900' },
  name: { color: colors.ink, fontSize: 21, fontWeight: '900' }, email: { color: colors.inkMuted }, details: { marginTop: spacing.lg, gap: spacing.md }, sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginBottom: spacing.xs },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg }, label: { color: colors.inkMuted, flex: 1 }, value: { color: colors.ink, fontWeight: '700', flex: 1, textAlign: 'right' }, separator: { height: 1, backgroundColor: colors.border },
  actions: { gap: spacing.md, marginTop: spacing.lg },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(23, 53, 46, 0.46)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  modalCard: { width: '100%', maxWidth: 430, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: spacing.md },
  modalIcon: { width: 54, height: 54, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  modalIconText: { color: colors.primary, fontSize: 26, fontWeight: '900' },
  modalTitle: { color: colors.ink, fontSize: 23, fontWeight: '900', textAlign: 'center' },
  modalMessage: { color: colors.inkMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  modalActions: { width: '100%', flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  modalButton: { flex: 1 },
});
