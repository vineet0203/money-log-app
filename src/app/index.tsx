import { Redirect } from "expo-router";
import { useAuthStore } from "../store/authStore";

export default function RootIndex() {
  const { isAuthenticated, hasSeenOnboarding, isInitialized } = useAuthStore();

  if (!isInitialized) return null;

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(auth)" />;
}
