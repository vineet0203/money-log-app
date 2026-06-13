import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Security() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-slate-50">
      <View 
        style={{ paddingTop: insets.top + 16 }} 
        className="flex-row items-center justify-between px-5 pb-4 bg-white shadow-sm shadow-slate-100 z-10 border-b border-slate-100"
      >
        <TouchableOpacity 
          onPress={() => router.navigate('/more')}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        
        <Text className="font-bold text-lg text-slate-800">Security</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-100 border border-slate-50 mb-6 items-center">
          <View className="w-20 h-20 bg-emerald-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="shield-checkmark" size={40} color="#10B981" />
          </View>
          <Text className="text-slate-800 font-bold text-lg mb-1">Your account is secure</Text>
          <Text className="text-slate-500 text-center">We use industry standard encryption to protect your financial data.</Text>
        </View>

        <TouchableOpacity className="flex-row items-center justify-between bg-white p-5 rounded-2xl mb-3 shadow-sm shadow-slate-100 border border-slate-50">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mr-4 border border-slate-100">
              <Ionicons name="key-outline" size={20} color="#334155" />
            </View>
            <Text className="text-slate-800 font-bold text-base">Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between bg-white p-5 rounded-2xl mb-3 shadow-sm shadow-slate-100 border border-slate-50">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mr-4 border border-slate-100">
              <Ionicons name="finger-print-outline" size={20} color="#334155" />
            </View>
            <Text className="text-slate-800 font-bold text-base">Biometric Login</Text>
          </View>
          <Text className="text-emerald-500 font-bold mr-2">Enabled</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between bg-white p-5 rounded-2xl mb-3 shadow-sm shadow-slate-100 border border-slate-50">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mr-4 border border-slate-100">
              <Ionicons name="phone-portrait-outline" size={20} color="#334155" />
            </View>
            <Text className="text-slate-800 font-bold text-base">Two-Factor Auth</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
