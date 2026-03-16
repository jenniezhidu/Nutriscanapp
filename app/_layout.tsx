import { useEffect, useState } from 'react';
import { Stack, useSegments, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  useFrameworkReady();
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [guestMode, setGuestMode] = useState<boolean | null>(null);
  const segments = useSegments();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const guestFlag = await AsyncStorage.getItem('guestMode');
      setIsLoggedIn(!!session);
      setGuestMode(!!guestFlag);
      setIsReady(true);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const guestFlag = await AsyncStorage.getItem('guestMode');
      setIsLoggedIn(!!session);
      setGuestMode(!!guestFlag);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const inLoginRoute = segments[0] === 'login';
    if (!isLoggedIn && !guestMode && !inLoginRoute) {
      router.replace('/login');
    } else if (isLoggedIn && inLoginRoute) {
      AsyncStorage.removeItem('guestMode');
      router.replace('/');
    }
  }, [isReady, isLoggedIn, guestMode, segments]);

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
