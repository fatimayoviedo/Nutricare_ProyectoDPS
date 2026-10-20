import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View, type ImageStyle, type StyleProp } from 'react-native';

import { colors, radius } from '@/constants/theme';

export function FoodPhotoImage({ uri, style }: { uri: string; style: StyleProp<ImageStyle> }) {
  const [failed, setFailed] = useState(uri.startsWith('blob:'));

  if (failed) {
    return <View style={[styles.unavailable, style]}><Text style={styles.icon}>▧</Text><Text style={styles.label}>Imagen no disponible</Text><Text style={styles.help}>Vuelve a seleccionar la fotografía para guardarla otra vez.</Text></View>;
  }

  return <Image source={{ uri }} style={style} contentFit="cover" onError={() => setFailed(true)} />;
}

const styles = StyleSheet.create({
  unavailable: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', padding: 16 },
  icon: { color: colors.primary, fontSize: 30 }, label: { color: colors.ink, fontWeight: '800', marginTop: 6 }, help: { color: colors.inkMuted, fontSize: 12, textAlign: 'center', marginTop: 4 },
});
