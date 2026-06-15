import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function Home() {
  const { logout } = useAuthStore();

  return (
    <View className="flex-1 bg-white items-center justify-center px-4">
      <Text className="text-xl font-bold mb-6 text-primary">You are logged in.</Text>
      
      <TouchableOpacity 
        onPress={logout}
        className="px-6 py-3 bg-red-500 rounded-full"
      >
        <Text className="text-white font-bold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
