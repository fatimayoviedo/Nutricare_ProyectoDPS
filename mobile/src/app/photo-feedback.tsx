import { Redirect, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { FoodPhotoImage } from '@/components/ui/FoodPhotoImage';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usePhotos } from '@/context/PhotoContext';

export default function PhotoFeedbackScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { photos, saveNutritionistComment } = usePhotos();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const closeSuccess = () => { if (Platform.OS === 'web' && typeof document !== 'undefined') (document.activeElement as HTMLElement | null)?.blur(); setSaved(false); };
  const orderedPhotos = useMemo(() => [...photos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [photos]);

  if (!user || user.role !== 'nutritionist') return <Redirect href="/" />;

  async function saveFeedback(id: string, currentComment?: string) {
    const feedback = drafts[id] ?? currentComment ?? '';
    if (!feedback.trim()) return;
    setSavingId(id);
    try {
      await saveNutritionistComment(id, feedback);
      setSaved(true);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Screen>
      <BrandHeader role={user.role} />
      <Text onPress={() => router.back()} style={styles.back}>← Inicio</Text>
      <Text style={styles.title}>Fotografías de pacientes</Text>
      <Text style={styles.subtitle}>Revisa cada comida, lee el comentario del paciente y envía una retroalimentación.</Text>

      <View style={styles.list}>
        {orderedPhotos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>▧</Text>
            <Text style={styles.emptyTitle}>No hay fotografías pendientes</Text>
            <Text style={styles.emptyText}>Las fotografías que envíen los pacientes aparecerán aquí.</Text>
          </View>
        ) : orderedPhotos.map((photo) => (
          <View key={photo.id} style={styles.card}>
            <FoodPhotoImage uri={photo.uri} style={styles.image} />
            <Text style={styles.patient}>{photo.patientName ?? 'Gerardo Peña'}</Text>
            <Text style={styles.meta}>{photo.mealType} · {new Date(photo.createdAt).toLocaleDateString('es-SV')}</Text>
            <View style={styles.patientComment}>
              <Text style={styles.sectionLabel}>Comentario del paciente</Text>
              <Text style={styles.comment}>{photo.comment || 'El paciente no agregó comentarios.'}</Text>
            </View>
            <Text style={styles.sectionLabel}>Retroalimentación de nutricionista</Text>
            <TextInput
              value={drafts[photo.id] ?? photo.nutritionistComment ?? ''}
              onChangeText={(value) => setDrafts((current) => ({ ...current, [photo.id]: value }))}
              placeholder="Escribe una recomendación clara para el paciente"
              placeholderTextColor={colors.inkMuted}
              multiline
              maxLength={400}
              style={styles.feedbackInput}
            />
            <PrimaryButton
              label={photo.nutritionistComment ? 'Actualizar comentario' : 'Enviar comentario'}
              loading={savingId === photo.id}
              disabled={!(drafts[photo.id] ?? photo.nutritionistComment ?? '').trim()}
              onPress={() => void saveFeedback(photo.id, photo.nutritionistComment)}
            />
          </View>
        ))}
      </View>

      <Modal transparent visible={saved} animationType="fade" onRequestClose={closeSuccess}>
        <View style={styles.backdrop}><View style={styles.dialog}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.dialogTitle}>Comentario enviado</Text>
          <Text style={styles.dialogText}>El paciente ya puede ver la retroalimentación en sus fotografías guardadas.</Text>
          <PrimaryButton label="Aceptar" onPress={closeSuccess} />
        </View></View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '800', marginBottom: spacing.lg },
  title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: colors.inkMuted, lineHeight: 21, marginTop: spacing.sm },
  list: { gap: spacing.lg, marginTop: spacing.xl },
  emptyCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyIcon: { color: colors.primary, fontSize: 32 }, emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' }, emptyText: { color: colors.inkMuted, textAlign: 'center', lineHeight: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  image: { height: 220, borderRadius: radius.md }, patient: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: spacing.xs }, meta: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  patientComment: { backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs, marginVertical: spacing.xs }, sectionLabel: { color: colors.ink, fontSize: 13, fontWeight: '900' }, comment: { color: colors.inkMuted, lineHeight: 20 },
  feedbackInput: { minHeight: 104, textAlignVertical: 'top', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, color: colors.ink, padding: spacing.lg },
  backdrop: { flex: 1, backgroundColor: 'rgba(23,53,46,0.48)', justifyContent: 'center', padding: spacing.xl }, dialog: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, width: '100%', maxWidth: 430, alignSelf: 'center' },
  successIcon: { alignSelf: 'center', width: 54, height: 54, borderRadius: radius.pill, backgroundColor: colors.primarySoft, color: colors.primary, textAlign: 'center', textAlignVertical: 'center', fontSize: 28, fontWeight: '900', overflow: 'hidden' }, dialogTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', textAlign: 'center' }, dialogText: { color: colors.inkMuted, lineHeight: 21, textAlign: 'center' },
});
