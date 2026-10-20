import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrandHeader } from '@/components/ui/BrandHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usePhotos } from '@/context/PhotoContext';

export default function UploadPhotoScreen() {
  const router = useRouter(); const { user } = useAuth(); const { addPhoto } = usePhotos();
  const [imageUri, setImageUri] = useState<string | null>(null); const [comment, setComment] = useState(''); const [mealType, setMealType] = useState('Almuerzo'); const [mealOpen, setMealOpen] = useState(false); const [saved, setSaved] = useState(false); const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState('');
  if (!user) return null;

  const acceptImage = async (selected: ImagePicker.ImagePickerAsset) => {
    if (selected.fileSize && selected.fileSize > 10 * 1024 * 1024) { Alert.alert('Archivo demasiado grande', 'Selecciona una imagen menor de 10 MB.'); return; }
    setPhotoError('');
    try {
      const sourceUri = selected.base64 ? `data:${selected.mimeType ?? 'image/jpeg'};base64,${selected.base64}` : selected.uri;
      setImageUri(Platform.OS === 'web' ? await makeWebPhotoPersistent(sourceUri) : sourceUri);
    } catch {
      setPhotoError('No se pudo preparar esta imagen. Elige otra fotografía e inténtalo de nuevo.');
    }
  };

  const chooseFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permiso requerido', 'Activa el acceso a fotografías para seleccionar una comida.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8, base64: Platform.OS === 'web' });
    if (!result.canceled) await acceptImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permiso requerido', 'Activa el acceso a la cámara para fotografiar tu comida.'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8, base64: Platform.OS === 'web' });
    if (!result.canceled) await acceptImage(result.assets[0]);
  };

  const choosePhoto = () => {
    if (Platform.OS === 'web') { void chooseFromLibrary(); return; }
    Alert.alert('Agregar fotografía', 'Elige cómo deseas registrar tu comida.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Galería', onPress: () => void chooseFromLibrary() },
      { text: 'Cámara', onPress: () => void takePhoto() },
    ]);
  };

  const save = async () => {
    if (!imageUri) { Alert.alert('Falta la fotografía', 'Selecciona una imagen antes de guardar.'); return; }
    setSaving(true);
    try { await addPhoto({ uri: imageUri, mealType, comment, patientId: user.id, patientName: user.name }); setSaved(true); }
    catch { setPhotoError('No se pudo guardar la fotografía. Selecciona una imagen más pequeña e inténtalo de nuevo.'); }
    finally { setSaving(false); }
  };

  return (
    <Screen><BrandHeader role={user.role} /><Text onPress={() => router.replace('/plan')} style={styles.back}>← Planes</Text>
      <Text style={styles.title}>Sube tu comida</Text><Text style={styles.subtitle}>Tus fotografías serán visibles únicamente para tu nutricionista.</Text>
      <Pressable onPress={choosePhoto} style={styles.uploadBox}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" /> : <><View style={styles.plusCircle}><Text style={styles.plus}>＋</Text></View><Text style={styles.uploadTitle}>Tomar o elegir fotografía</Text><Text style={styles.uploadHelp}>JPG o PNG · máximo 10 MB</Text></>}
      </Pressable>
      {photoError ? <Text accessibilityLiveRegion="polite" style={styles.photoError}>{photoError}</Text> : null}
      <View style={styles.photoActions}><PrimaryButton label="Elegir de galería" variant="secondary" onPress={() => void chooseFromLibrary()} /><PrimaryButton label="Tomar fotografía" onPress={() => void takePhoto()} /></View>
      <Text style={styles.label}>Tipo de comida</Text><Pressable style={styles.select} onPress={() => setMealOpen((open) => !open)}><Text style={styles.selectText}>{mealType}</Text><Text style={styles.chevron}>⌄</Text></Pressable>{mealOpen ? <View style={styles.dropdown}>{['Desayuno', 'Almuerzo', 'Cena'].map((meal) => <Pressable key={meal} style={styles.dropdownItem} onPress={() => { setMealType(meal); setMealOpen(false); }}><Text style={styles.selectText}>{meal}</Text></Pressable>)}</View> : null}
      <Text style={styles.label}>Comentario opcional</Text><TextInput value={comment} onChangeText={setComment} placeholder="Ej. Cambié arroz por papa" placeholderTextColor={colors.inkMuted} multiline maxLength={240} style={styles.comment} />
      <PrimaryButton label="Guardar fotografía" loading={saving} onPress={() => void save()} /><Pressable onPress={() => router.push('/saved-photos')}><Text style={styles.savedLink}>Ver fotografías guardadas y comentarios</Text></Pressable>
      <Modal transparent visible={saved} animationType="fade" onRequestClose={() => setSaved(false)}><View style={styles.backdrop}><View style={styles.dialog}><Text style={styles.successIcon}>✓</Text><Text style={styles.dialogTitle}>Fotografía guardada</Text><Text style={styles.dialogText}>La fotografía ya aparece en tus registros y podrá ser revisada por tu nutricionista.</Text><PrimaryButton label="Ver fotografías guardadas" onPress={() => { setSaved(false); router.replace('/saved-photos'); }} /><PrimaryButton label="Cerrar" variant="secondary" onPress={() => { setSaved(false); router.replace('/plan'); }} /></View></View></Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.primary, fontWeight: '800', marginBottom: spacing.lg }, title: { color: colors.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1 }, subtitle: { color: colors.inkMuted, lineHeight: 21, marginTop: spacing.sm },
  uploadBox: { height: 300, borderRadius: radius.lg, backgroundColor: colors.primarySoft, marginVertical: spacing.xl, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: spacing.lg }, preview: { width: '100%', height: '100%', borderRadius: radius.md }, photoError: { color: colors.danger, fontSize: 13, lineHeight: 19, marginTop: -spacing.lg, marginBottom: spacing.lg },
  plusCircle: { width: 112, height: 112, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }, plus: { color: colors.surface, fontSize: 45 }, uploadTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: spacing.lg }, uploadHelp: { color: colors.inkMuted, marginTop: spacing.sm },
  label: { color: colors.ink, fontSize: 13, fontWeight: '800', marginBottom: spacing.sm }, mealOptions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }, mealOption: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md }, mealActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary }, mealText: { color: colors.inkMuted, fontWeight: '700', fontSize: 12 }, mealTextActive: { color: colors.primaryDark },
  comment: { minHeight: 96, textAlignVertical: 'top', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, color: colors.ink, padding: spacing.lg, marginBottom: spacing.lg },
  photoActions: { gap: spacing.sm, marginTop: -spacing.md, marginBottom: spacing.xl }, select: { minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }, selectText: { color: colors.ink, fontWeight: '700' }, chevron: { color: colors.primary, fontSize: 20, fontWeight: '900' }, dropdown: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, marginTop: -spacing.sm, marginBottom: spacing.lg, overflow: 'hidden' }, dropdownItem: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }, savedLink: { color: colors.primary, fontWeight: '800', textAlign: 'center', paddingVertical: spacing.lg }, backdrop: { flex: 1, backgroundColor: 'rgba(23,53,46,0.48)', justifyContent: 'center', padding: spacing.xl }, dialog: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.md, width: '100%', maxWidth: 430, alignSelf: 'center' }, successIcon: { alignSelf: 'center', width: 54, height: 54, borderRadius: radius.pill, backgroundColor: colors.primarySoft, color: colors.primary, textAlign: 'center', textAlignVertical: 'center', fontSize: 28, fontWeight: '900', overflow: 'hidden' }, dialogTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', textAlign: 'center' }, dialogText: { color: colors.inkMuted, lineHeight: 21, textAlign: 'center' },
});

async function makeWebPhotoPersistent(uri: string): Promise<string> {
  const response = uri.startsWith('blob:') ? await fetch(uri) : null;
  const dataUri = response ? await blobToDataUri(await response.blob()) : uri;
  if (typeof document === 'undefined') return dataUri;

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new window.Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error('No se pudo leer la fotografía.'));
    element.src = dataUri;
  });
  const maxSide = 1440;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No se pudo preparar la fotografía.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.76);
}

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('No se pudo leer la fotografía.'));
    reader.onerror = () => reject(new Error('No se pudo leer la fotografía.'));
    reader.readAsDataURL(blob);
  });
}
