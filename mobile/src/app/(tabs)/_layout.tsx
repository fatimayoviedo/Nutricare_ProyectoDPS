import { Redirect, Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const icons = {
  index: { ios: 'house.fill', android: 'home', web: 'home' },
  patients: { ios: 'person.2.fill', android: 'groups', web: 'groups' },
  measurements: { ios: 'ruler.fill', android: 'straighten', web: 'straighten' },
  plan: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  progress: { ios: 'chart.line.uptrend.xyaxis', android: 'monitoring', web: 'monitoring' },
  profile: { ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' },
} as const;

function TabIcon({ route, color, focused }: { route: string; color: any; focused: boolean }) {
  const name = icons[route as keyof typeof icons] ?? icons.index;
  return <View style={[styles.iconWrap, focused && styles.iconWrapActive]}><SymbolView name={name} size={21} tintColor={color} fallback={<Text style={[styles.fallbackIcon, { color }]}>●</Text>} /></View>;
}

export default function TabsLayout() {
  const { user, isReady } = useAuth();
  if (!isReady) return <LoadingScreen />;
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.inkMuted,
      tabBarStyle: styles.tabBar, tabBarLabelStyle: styles.tabLabel,
      tabBarIcon: ({ color, focused }) => <TabIcon route={route.name} color={color} focused={focused} />,
    })}>
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="patients" options={{ title: 'Pacientes', href: user.role === 'nutritionist' ? undefined : null }} />
      <Tabs.Screen name="measurements" options={{ title: 'Medición', href: user.role === 'nutritionist' ? undefined : null }} />
      <Tabs.Screen name="plan" options={{ title: 'Planes' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progreso', href: user.role === 'patient' ? undefined : null }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { height: 72, paddingTop: 8, paddingBottom: 9, borderTopColor: colors.border, backgroundColor: colors.surface },
  tabLabel: { fontSize: 11, fontWeight: '700' }, iconWrap: { width: 38, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, iconWrapActive: { backgroundColor: colors.primarySoft }, fallbackIcon: { fontSize: 16, lineHeight: 20 },
});
