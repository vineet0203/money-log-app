import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsItemProps {
  iconName: any; // Ionicons name
  title: string;
  isDestructive?: boolean;
  onPress?: () => void;
}

export default function SettingsItem({ iconName, title, isDestructive = false, onPress }: SettingsItemProps) {
  const contentColor = isDestructive ? '#EF4444' : '#475569'; // Red for destructive, slate-600 for standard
  const textColor = isDestructive ? 'text-red-500' : 'text-slate-700';

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-4 px-5 bg-white border-b border-slate-50"
    >
      {/* Icon Area */}
      <View className="w-8 items-center justify-center mr-3">
        <Ionicons name={iconName} size={22} color={contentColor} />
      </View>

      {/* Text Area */}
      <View className="flex-1 justify-center">
        <Text className={`text-base font-semibold ${textColor}`}>{title}</Text>
      </View>

      {/* Chevron */}
      <View className="items-center justify-center ml-2">
        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
}
