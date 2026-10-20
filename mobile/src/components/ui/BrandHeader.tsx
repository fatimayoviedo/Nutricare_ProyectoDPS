import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import type { UserRole } from '@/types/auth';

export function BrandHeader({ role }: { role?: UserRole }) {
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={styles.logoCircle}><Image source={require('../../../assets/images/nutricare-logo.png')} style={styles.logo} contentFit="contain" /></View>
        <View><Text style={styles.name}>NutriCare</Text><Text style={styles.tagline}>Nutrición balanceada</Text></View>
      </View>
      {role ? <Text style={styles.role}>{role === 'patient' ? 'PACIENTE' : 'NUTRICIONISTA'}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.xl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 1 },
  logoCircle: { width: 58, height: 58, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logo: { width: 48, height: 48, borderRadius: radius.pill }, name: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  tagline: { color: colors.inkMuted, fontSize: 12, marginTop: 2 },
  role: { backgroundColor: colors.primarySoft, color: colors.primary, borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 8, fontSize: 11, fontWeight: '800', overflow: 'hidden' },
});
