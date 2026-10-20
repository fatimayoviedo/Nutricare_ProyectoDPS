import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { PatientProvider } from '@/context/PatientContext';
import { MeasurementProvider } from '@/context/MeasurementContext';
import { PhotoProvider } from '@/context/PhotoContext';
import { AppointmentProvider } from '@/context/AppointmentContext';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PatientProvider>
          <MeasurementProvider>
          <PhotoProvider>
          <AppointmentProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="upload-photo" options={{ presentation: 'modal' }} />
            <Stack.Screen name="saved-photos" options={{ presentation: 'modal' }} />
            <Stack.Screen name="photo-feedback" />
            <Stack.Screen name="new-patient" options={{ presentation: 'modal' }} />
            <Stack.Screen name="pending" />
            <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
            <Stack.Screen name="monthly-plan" />
            <Stack.Screen name="new-measurement" options={{ presentation: 'modal' }} />
            <Stack.Screen name="new-appointment" options={{ presentation: 'modal' }} />
          </Stack>
          </AppointmentProvider>
          </PhotoProvider>
          </MeasurementProvider>
        </PatientProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
