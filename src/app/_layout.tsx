import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from '../store/authStore';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function Layout() {
  usePushNotifications(); // Request permissions and send token when logged in
  
  const { initAuth, isInitialized } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      // Hide the splash screen once the root layout has mounted and auth is hydrated
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  if (!isInitialized) return null;
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </QueryClientProvider>
  );
}
