import { Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { Screen } from '@/components/ui/Screen';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usePhotos } from '@/context/PhotoContext';

export default function PendingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { photos } = usePhotos();
  const pendingPhotos = photos.filter((photo) => !photo.nutritionistComment).length;
  const pendingItems = [
    { title: 'Fotografías por revisar', value: String(pendingPhotos), detail: pendingPhotos ? 'Lee los comentarios del paciente y envía tu retroalimentación.' : 'No hay fotografías nuevas.', route: '/photo-feedback' as const },
    { title: 'Planes por vencer', value: '5', detail: 'Revisar vigencias antes de finalizar octubre' },
    { title: 'Consultas sin notas', value: '2', detail: 'Completar recomendaciones del último control' },
  ];
  if (!user || user.role !== 'nutritionist') return <Redirect href="/" />;

  return (
    <Screen><BrandHeader role={user.role} />
      <Text onPress={() => router.back()} style={styles.back}>← Inicio</Text>
      <Text style={styles.title}>Pendientes</Text><Text style={styles.subtitle}>Resumen de actividades que requieren seguimiento profesional.</Text>
      <View style={styles.list}>{pendingItems.map((item) => item.route ? <Pressable key={item.title} accessibilityRole="button" onPress={() => router.push(item.route)}><SurfaceCard><View style={styles.row}><View style={styles.info}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.detail}>{item.detail}</Text><Text style={styles.open}>Abrir fotografías →</Text></View><Text style={styles.value}>{item.value}</Text></View></SurfaceCard></Pressable> : <SurfaceCard key={item.title}><View style={styles.row}><View style={styles.info}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.detail}>{item.detail}</Text></View><Text style={styles.value}>{item.value}</Text></View></SurfaceCard>)}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '800', marginBottom: spacing.lg }, title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1 }, subtitle: { color: colors.inkMuted, lineHeight: 21, marginTop: spacing.sm },
  list: { gap: spacing.md, marginTop: spacing.xl }, row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg }, info: { flex: 1 }, cardTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' }, detail: { color: colors.inkMuted, lineHeight: 19, marginTop: spacing.xs }, open: { color: colors.primary, fontWeight: '800', marginTop: spacing.sm, fontSize: 12 }, value: { color: colors.primary, fontSize: 28, fontWeight: '900' },
});
