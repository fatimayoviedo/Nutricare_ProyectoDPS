import { Redirect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usePatients } from '@/context/PatientContext';

export default function PatientsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { patients } = usePatients();

  if (!user || user.role !== 'nutritionist') return <Redirect href="/" />;

  return (
    <Screen>
      <BrandHeader role={user.role} />
      <Text style={styles.title}>Mis pacientes</Text>
      <Text style={styles.intro}>Consulta expedientes, objetivos y el estado actual de cada seguimiento.</Text>

      <View style={styles.summaryRow}>
        <SurfaceCard style={styles.summaryCard}>
          <View style={styles.summaryHeading}><View style={styles.summaryIcon}><SymbolView name={{ ios: 'person.2.fill', android: 'groups', web: 'groups' }} size={18} tintColor={colors.primary} /></View><Text style={styles.summaryLabel}>Pacientes activos</Text></View>
          <Text style={styles.summaryValue}>{patients.length}</Text>
        </SurfaceCard>
        <SurfaceCard style={styles.summaryCard}>
          <View style={styles.summaryHeading}><View style={[styles.summaryIcon, styles.warningIcon]}><SymbolView name={{ ios: 'exclamationmark.triangle.fill', android: 'notification_important', web: 'notification_important' }} size={18} tintColor={colors.warning} /></View><Text style={styles.summaryLabel}>Requieren atención</Text></View>
          <Text style={styles.summaryValue}>{patients.filter((patient) => patient.status.toLowerCase().includes('revisión') || patient.status.toLowerCase().includes('renovar')).length}</Text>
        </SurfaceCard>
      </View>

      <View style={styles.list}>
        {patients.map((patient) => (
              <SurfaceCard key={patient.id}>
                <View style={styles.patientRow}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{patient.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</Text></View>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.goal}>{patient.goal}</Text>
                    <Text style={styles.status}>{patient.status}</Text>
                  </View>
                </View>
              </SurfaceCard>
        ))}
      </View>

      <PrimaryButton label="Registrar nuevo paciente" variant="secondary" onPress={() => router.push('/new-patient')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1 },
  intro: { color: colors.inkMuted, lineHeight: 21, marginTop: spacing.sm },
  summaryRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  summaryCard: { flex: 1, minHeight: 112 },
  summaryHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  summaryIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  warningIcon: { backgroundColor: '#FFF4D9' },
  summaryLabel: { color: colors.inkMuted, fontSize: 13, lineHeight: 18 },
  summaryValue: { color: colors.ink, fontSize: 28, fontWeight: '900', marginTop: spacing.md },
  list: { gap: spacing.md, marginVertical: spacing.lg },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primaryDark, fontWeight: '900' },
  patientInfo: { flex: 1 },
  patientName: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  goal: { color: colors.inkMuted, marginTop: spacing.xs },
  status: { color: colors.primary, fontSize: 12, fontWeight: '800', marginTop: spacing.xs },
});
