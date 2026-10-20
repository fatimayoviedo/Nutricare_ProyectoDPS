import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

interface PrimaryButtonProps extends PressableProps { label: string; loading?: boolean; variant?: 'primary' | 'secondary' | 'lime' }

export function PrimaryButton({ label, loading, disabled, variant = 'primary', style, ...props }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable accessibilityRole="button" disabled={isDisabled} style={(state) => [styles.base, variant === 'secondary' ? styles.secondary : variant === 'lime' ? styles.lime : styles.primary, isDisabled ? styles.disabled : null, state.pressed && !isDisabled ? styles.pressed : null, typeof style === 'function' ? style(state) : style]} {...props}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? colors.surface : colors.primary} /> : <Text style={[styles.label, variant === 'secondary' ? styles.secondaryLabel : null, variant === 'lime' ? styles.limeLabel : null]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  primary: { backgroundColor: colors.primary }, secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, lime: { backgroundColor: colors.lime },
  label: { color: colors.surface, fontWeight: '800', fontSize: 15, lineHeight: 20, textAlign: 'center', flexShrink: 1 }, secondaryLabel: { color: colors.primary }, limeLabel: { color: colors.primaryDark },
  disabled: { opacity: 0.55 }, pressed: { opacity: 0.82 },
});
