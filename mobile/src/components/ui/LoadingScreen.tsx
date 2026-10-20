import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/constants/theme';

export function LoadingScreen() {
  return <View style={styles.container}><ActivityIndicator color={colors.primary} size="large" /><Text style={styles.label}>Cargando NutriCare...</Text></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: colors.background }, label: { color: colors.inkMuted } });
