import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import Toast from "react-native-toast-message";
import { toastConfig } from "../components/ToastConfig";
import { LogBox } from 'react-native';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuthStore } from "../store/authStore";

// Ignore specific development warnings
LogBox.ignoreLogs([
  'Unable to activate keep awake',
  'Must use physical device for Push Notifications'
]);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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

  const { initAuth, isInitialized, isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    initAuth();

    // Ensure splash screen stays for at least 2 seconds
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialized && minTimePassed) {
      // Hide the splash screen once auth is hydrated AND min time has passed
      SplashScreen.hideAsync();
    }
  }, [isInitialized, minTimePassed]);

  // Global redirect to login whenever session is revoked or unauthorized
  useEffect(() => {
    if (!isInitialized) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
    }
  }, [isAuthenticated, isInitialized, segments]);

  if (!isInitialized || !minTimePassed) return null;
  return (
    <QueryClientProvider client={queryClient}>
      <>
        <Stack screenOptions={{ headerShown: false }}>
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
      </>
    </QueryClientProvider>
  );
}
