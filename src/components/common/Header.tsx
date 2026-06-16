import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row justify-between items-center px-5 pb-4 bg-white border-b border-slate-100"
      style={{ paddingTop: insets.top + 8, elevation: 1 }}
    >
      <View className="flex-row items-center">
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        )}
        <Text className="text-2xl font-extrabold text-text">{title}</Text>
      </View>

      <TouchableOpacity className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center relative border border-slate-100">
        <Ionicons name="notifications-outline" size={22} color="#0F172A" />
        {/* Unread badge dot */}
        <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
      </TouchableOpacity>
    </View>
  );
}
