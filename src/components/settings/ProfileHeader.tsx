import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileHeader() {
  return (
    <View className="flex-row items-center bg-white p-5 rounded-3xl shadow-sm shadow-slate-100 mb-8 mt-2 border border-slate-50">
      <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mr-4">
        <Ionicons name="person" size={32} color="#94A3B8" />
      </View>
      <View className="flex-1">
        <Text className="text-xl font-bold text-text mb-0.5">Alex Doe</Text>
        <Text className="text-textMuted text-sm font-medium">+1 123-456-7890</Text>
      </View>
      <TouchableOpacity className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
        <Ionicons name="pencil" size={18} color="#1591DC" />
      </TouchableOpacity>
    </View>
  );
}
