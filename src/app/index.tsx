import { Redirect } from "expo-router";
import { useAuthStore } from "../store/authStore";

export default function RootIndex() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)" />;
}
