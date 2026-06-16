import React from 'react';
import { View, Text, Image } from 'react-native';

interface UserCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function UserCard({ name, email, avatarUrl }: UserCardProps) {
  return (
    <View className="flex-row items-center py-4 px-5 border-b border-slate-100 bg-white">
      {/* Avatar */}
      <View className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden mr-4">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="w-full h-full" />
        ) : (
          <View className="w-full h-full bg-primary/20 items-center justify-center">
            <Text className="text-2xl font-bold text-primary">
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 justify-center">
        <Text className="text-xl font-bold text-text mb-1">{name}</Text>
        <Text className="text-sm font-medium text-textMuted">{email}</Text>
      </View>
    </View>
  );
}
