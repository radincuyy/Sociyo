import { CheckCircle2, CircleAlert } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { ThemeToggle } from '../../components/ThemeToggle';
import { isFirebaseConfigured } from '../../services/firebase';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';

const checklist = [
  'Expo SDK 56 project initialized',
  'React Navigation Stack + Tab + Drawer installed',
  'Zustand store ready',
  'Reanimated + Gesture Handler ready',
  'Firebase config ready',
];

export function SettingsScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen>
      <Text style={[styles.title, { color: palette.text }]}>Settings</Text>
      <View style={styles.row}>
        <Text style={[styles.label, { color: palette.text }]}>Theme</Text>
        <ThemeToggle />
      </View>

      <View style={[styles.panel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <View style={styles.firebaseRow}>
          {isFirebaseConfigured ? (
            <CheckCircle2 size={21} color={palette.success} />
          ) : (
            <CircleAlert size={21} color={palette.warning} />
          )}
          <View style={styles.firebaseCopy}>
            <Text style={[styles.panelTitle, { color: palette.text }]}>Firebase config</Text>
            <Text style={[styles.panelText, { color: palette.textMuted }]}>
              {isFirebaseConfigured
                ? 'Environment variables are filled.'
                : 'Isi .env dari .env.example setelah project Firebase dibuat.'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: palette.text }]}>Minggu 13 checklist</Text>
      <View style={styles.checklist}>
        {checklist.map((item) => (
          <View key={item} style={styles.checkItem}>
            <CheckCircle2 size={18} color={palette.success} />
            <Text style={[styles.checkText, { color: palette.text }]}>{item}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 12,
    marginBottom: 20,
    fontSize: 26,
    fontWeight: '900',
  },
  row: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
  },
  panel: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  firebaseRow: {
    flexDirection: 'row',
    gap: 12,
  },
  firebaseCopy: {
    flex: 1,
    gap: 4,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  panelText: {
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '900',
  },
  checklist: {
    gap: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkText: {
    flex: 1,
    fontSize: 14,
  },
});
