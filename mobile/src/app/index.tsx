import { Redirect } from 'expo-router';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const { user, isReady } = useAuth();
  if (!isReady) return <LoadingScreen />;
  return <Redirect href={user ? '/(tabs)' : '/login'} />;
}
