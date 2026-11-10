import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import Toast from "react-native-toast-message";
import { toastConfig } from "../components/ToastConfig";
import { LogBox } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import SplashScreen from "../screens/SplashScreen";

// Ignore specific development warnings
LogBox.ignoreLogs([
  'Unable to activate keep awake',
  'Must use physical device for Push Notifications'
]);

// Prevent the native splash screen from auto-hiding prematurely.
ExpoSplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 0, // Do not keep cached data in memory after unmount
      staleTime: 0, // Always fetch fresh data
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      retry: (failureCount, error: any) => {
        // Never retry if server responded with 401 unauthorized
        if (error?.response?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

export default function Layout() {
  usePushNotifications(); // Request permissions and send token when logged in

  const { initAuth, isInitialized, isAuthenticated, hasSeenOnboarding } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [splashElapsed, setSplashElapsed] = useState(false);

  useEffect(() => {
    initAuth();
    ExpoSplashScreen.hideAsync();

    // Ensure branded splash screen plays smoothly for 2.2 seconds
    const timer = setTimeout(() => {
      setSplashElapsed(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Global redirect whenever session or onboarding changes
  useEffect(() => {
    if (!isInitialized || !splashElapsed) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated) {
      if (!hasSeenOnboarding && !inOnboarding) {
        router.replace('/onboarding');
      } else if (hasSeenOnboarding && !inAuthGroup && !inOnboarding) {
        router.replace('/(auth)');
      }
    } else if (isAuthenticated && (inAuthGroup || inOnboarding)) {
      router.replace('/(app)');
    }
  }, [isAuthenticated, isInitialized, hasSeenOnboarding, splashElapsed, segments]);

  // Render branded splash screen while initializing or splash duration is active
  if (!isInitialized || !splashElapsed) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="reports" options={{ headerShown: false }} />
          <Stack.Screen name="add" options={{ headerShown: false }} />
          <Stack.Screen name="bills" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="categories" options={{ headerShown: false }} />
          <Stack.Screen name="notification-settings" options={{ headerShown: false }} />
          <Stack.Screen name="accounts" options={{ headerShown: false }} />
          <Stack.Screen name="account/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="add-subscription" options={{ headerShown: false }} />
          <Stack.Screen name="transaction/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="subscription/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="bank-transaction/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast config={toastConfig} position="bottom" bottomOffset={60} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
