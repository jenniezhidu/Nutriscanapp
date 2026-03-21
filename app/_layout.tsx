import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { initRevenueCat } from '@/lib/revenuecat';

export default function RootLayout() {
  useFrameworkReady();
  useEffect(() => {
    initRevenueCat();

    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem('onboardingSeen');
      if (seen !== 'true') router.replace('/onboarding');
    };
    checkOnboarding();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="index" />
        <Stack.Screen name="scan-barcode" />
        <Stack.Screen name="scan-nutrition-label" />
        <Stack.Screen name="result" />
        <Stack.Screen name="history" />
        <Stack.Screen name="favourites" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
