import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [darkMode, setDarkMode] = useState(false);

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
        
        <Text className="font-bold text-lg text-slate-800">App Settings</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-slate-500 font-bold text-sm tracking-wider uppercase mb-4 ml-1">Preferences</Text>
        
        <View className="bg-white p-5 rounded-2xl mb-3 shadow-sm shadow-slate-100 border border-slate-50 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mr-4 border border-slate-100">
              <Ionicons name="moon-outline" size={20} color="#334155" />
            </View>
            <Text className="text-slate-800 font-bold text-base">Dark Mode</Text>
          </View>
          <Switch
            trackColor={{ false: "#E2E8F0", true: "#1591DC" }}
            thumbColor={"#FFFFFF"}
            ios_backgroundColor="#E2E8F0"
            onValueChange={setDarkMode}
            value={darkMode}
          />
        </View>

        <TouchableOpacity className="flex-row items-center justify-between bg-white p-5 rounded-2xl mb-3 shadow-sm shadow-slate-100 border border-slate-50">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mr-4 border border-slate-100">
              <Ionicons name="globe-outline" size={20} color="#334155" />
            </View>
            <Text className="text-slate-800 font-bold text-base">Language</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-slate-500 font-bold mr-2">English (US)</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between bg-white p-5 rounded-2xl mb-8 shadow-sm shadow-slate-100 border border-slate-50">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mr-4 border border-slate-100">
              <Ionicons name="cash-outline" size={20} color="#334155" />
            </View>
            <Text className="text-slate-800 font-bold text-base">Default Currency</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-slate-500 font-bold mr-2">USD ($)</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        <Text className="text-slate-500 font-bold text-sm tracking-wider uppercase mb-4 ml-1">About</Text>
        
        <View className="bg-white p-5 rounded-2xl mb-10 shadow-sm shadow-slate-100 border border-slate-50">
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-800 font-bold text-base">App Version</Text>
            <Text className="text-slate-500 font-medium">1.0.0 (Build 42)</Text>
          </View>
          <TouchableOpacity className="flex-row justify-between border-t border-slate-100 pt-4">
            <Text className="text-slate-800 font-bold text-base">Terms of Service</Text>
            <Ionicons name="open-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
