import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function parseDate(value: string, fallbackYear: number) {
  const [year, month] = value.split('-').map(Number);
  return { year: year || fallbackYear, month: month ? month - 1 : new Date().getMonth() };
}

export function BirthDatePicker({ value, onChange, error, label = 'Fecha de nacimiento', fallbackYear = new Date().getFullYear() - 18 }: { value: string; onChange: (value: string) => void; error?: string; label?: string; fallbackYear?: number }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(() => parseDate(value, fallbackYear));
  const firstWeekday = new Date(shown.year, shown.month, 1).getDay();
  const daysInMonth = new Date(shown.year, shown.month + 1, 0).getDate();

  function choose(day: number) {
    const month = String(shown.month + 1).padStart(2, '0');
    onChange(`${shown.year}-${month}-${String(day).padStart(2, '0')}`);
    setOpen(false);
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Seleccionar ${label.toLowerCase()}`} onPress={() => { setShown(parseDate(value, fallbackYear)); setOpen(true); }} style={[styles.field, error && styles.fieldError]}>
        <Text style={value ? styles.value : styles.placeholder}>{value || 'Selecciona una fecha'}</Text>
        <Text style={styles.calendarIcon}>▦</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Cerrar calendario" />
          <View style={styles.dialog}>
            <View style={styles.header}>
              <Text style={styles.title}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} accessibilityLabel="Cerrar"><Text style={styles.close}>×</Text></Pressable>
            </View>
            <View style={styles.yearRow}>
              <Pressable accessibilityLabel="Año anterior" onPress={() => setShown((current) => ({ ...current, year: current.year - 1 }))} style={styles.yearButton}><Text style={styles.yearArrow}>‹</Text></Pressable>
              <Text style={styles.year}>{shown.year}</Text>
              <Pressable accessibilityLabel="Año siguiente" onPress={() => setShown((current) => ({ ...current, year: current.year + 1 }))} style={styles.yearButton}><Text style={styles.yearArrow}>›</Text></Pressable>
            </View>
            <View style={styles.monthRow}>
              {months.map((month, index) => <Pressable key={month} onPress={() => setShown((current) => ({ ...current, month: index }))} style={[styles.month, shown.month === index && styles.monthActive]}><Text style={[styles.monthText, shown.month === index && styles.monthTextActive]}>{month.slice(0, 3)}</Text></Pressable>)}
            </View>
            <View style={styles.grid}>
              {weekdays.map((day, index) => <Text key={`${day}-${index}`} style={styles.weekday}>{day}</Text>)}
              {Array.from({ length: firstWeekday }, (_, index) => <View key={`blank-${index}`} style={styles.dayCell} />)}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1;
                const selected = value === `${shown.year}-${String(shown.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                return <Pressable key={day} onPress={() => choose(day)} style={[styles.dayCell, selected && styles.selected]}><Text style={[styles.dayText, selected && styles.selectedText]}>{day}</Text></Pressable>;
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 }, label: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  field: { minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldError: { borderColor: colors.danger }, value: { color: colors.ink, fontSize: 15 }, placeholder: { color: colors.inkMuted, fontSize: 15 }, calendarIcon: { color: colors.primary, fontSize: 24 }, error: { color: colors.danger, fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(23,53,46,0.45)', justifyContent: 'center', padding: spacing.lg },
  dialog: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 430, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { color: colors.ink, fontSize: 19, fontWeight: '900' }, close: { color: colors.ink, fontSize: 28 },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, marginVertical: spacing.md }, yearButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primarySoft }, yearArrow: { color: colors.primary, fontSize: 30 }, year: { color: colors.ink, fontSize: 19, fontWeight: '800', minWidth: 62, textAlign: 'center' },
  monthRow: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: spacing.sm }, month: { width: '25%', alignItems: 'center', paddingHorizontal: spacing.xs, paddingVertical: 6, borderRadius: radius.pill }, monthActive: { backgroundColor: colors.primary }, monthText: { color: colors.inkMuted, fontWeight: '700' }, monthTextActive: { color: colors.surface },
  grid: { flexDirection: 'row', flexWrap: 'wrap' }, weekday: { width: '14.285%', textAlign: 'center', color: colors.inkMuted, fontWeight: '800', paddingVertical: spacing.sm }, dayCell: { width: '14.285%', height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill }, dayText: { color: colors.ink, fontWeight: '700' }, selected: { backgroundColor: colors.primary }, selectedText: { color: colors.surface },
});
