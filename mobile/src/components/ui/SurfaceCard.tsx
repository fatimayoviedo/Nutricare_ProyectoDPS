import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, shadow, spacing } from '@/constants/theme';

export function SurfaceCard({ style, ...props }: ViewProps) { return <View style={[styles.card, style]} {...props} />; }

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, ...(shadow ?? {}) },
});
