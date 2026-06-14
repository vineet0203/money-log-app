import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  useEffect(() => {
    // Hide the splash screen once the root layout has mounted
    SplashScreen.hideAsync();
  }, []);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="notifications" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
