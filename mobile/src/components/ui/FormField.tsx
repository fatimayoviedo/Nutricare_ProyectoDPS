import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

interface FormFieldProps extends TextInputProps { label: string; error?: string; password?: boolean }

export function FormField({ label, error, password, style, ...props }: FormFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        <TextInput style={[styles.input, style]} placeholderTextColor={colors.inkMuted} secureTextEntry={password && !visible} {...props} />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            accessibilityState={{ checked: visible }}
            onPress={() => setVisible((current) => !current)}
            hitSlop={10}
            style={styles.eyeButton}
          >
            <View style={styles.eyeShape} />
            <View style={styles.iris}><View style={styles.pupil} /></View>
            {!visible ? <View style={styles.eyeSlash} /> : null}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 }, label: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  inputRow: { minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  inputError: { borderColor: colors.danger }, input: { flex: 1, color: colors.ink, fontSize: 15, paddingVertical: spacing.md },
  eyeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  eyeShape: { position: 'absolute', width: 20, height: 20, backgroundColor: '#303436', borderTopLeftRadius: 16, borderBottomRightRadius: 16, borderTopRightRadius: 2, borderBottomLeftRadius: 2, transform: [{ rotate: '45deg' }] },
  iris: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  pupil: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#303436' },
  eyeSlash: { position: 'absolute', width: 30, height: 2.5, backgroundColor: '#303436', transform: [{ rotate: '45deg' }] },
  error: { color: colors.danger, fontSize: 12, lineHeight: 17 },
});
