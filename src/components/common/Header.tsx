import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View 
      className="bg-white px-6 pb-4 border-b border-slate-100 flex-row items-center justify-between shadow-sm shadow-slate-100"
      style={{ paddingTop: insets.top + 16 }}
    >
      <StatusBar style="dark" />
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-3">
          <Ionicons name="person" size={20} color="#94A3B8" />
        </View>
        <Text className="text-2xl font-bold text-text">{title}</Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => router.push('/notifications')}
        className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center"
      >
        <Ionicons name="notifications-outline" size={22} color="#0F172A" />
        <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      </TouchableOpacity>
    </View>
  );
}
