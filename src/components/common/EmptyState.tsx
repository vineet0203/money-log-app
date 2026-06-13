import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  iconName?: string;
  title: string;
  message: string;
}

export default function EmptyState({ 
  iconName = 'folder-open-outline', 
  title, 
  message 
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-12 px-6 bg-white rounded-3xl border border-slate-50 shadow-sm shadow-slate-100 mb-6">
      <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-4 border border-slate-100">
        <Ionicons name={iconName as any} size={36} color="#94A3B8" />
      </View>
      <Text className="text-xl font-bold text-slate-800 mb-2 text-center">{title}</Text>
      <Text className="text-slate-500 text-center text-sm leading-5">
        {message}
      </Text>
    </View>
  );
}
