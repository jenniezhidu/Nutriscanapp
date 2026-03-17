import { useEffect } from 'react';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase } from '@/lib/supabase';
import { getGuestMode } from '@/lib/guestMode';

export default function RootLayout() {
  useFrameworkReady();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const inAuthGroup = segments[0] === 'login';
      const isGuestMode = getGuestMode();

      if (!session && !isGuestMode && !inAuthGroup) {
        router.replace('/login');
      } else if (session && inAuthGroup) {
        router.replace('/');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const inAuthGroup = segments[0] === 'login';
      const isGuestMode = getGuestMode();

      if (!session && !isGuestMode && !inAuthGroup) {
        router.replace('/login');
      } else if (session && inAuthGroup) {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [segments, navigationState?.key]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="index" />
        <Stack.Screen name="scan-barcode" />
        <Stack.Screen name="scan-nutrition-label" />
        <Stack.Screen name="result" />
        <Stack.Screen name="favourites" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
