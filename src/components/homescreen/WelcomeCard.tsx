import React from 'react';
import { View, Text } from 'react-native';

interface WelcomeCardProps {
  name?: string;
}

export default function WelcomeCard({ name = "User" }: WelcomeCardProps) {
  // Get a simple greeting based on time (optional, hardcoding for now)
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  return (
    <View className="w-full mb-6">
      <Text className="text-sm font-medium text-textMuted uppercase tracking-wider mb-1">
        {greeting}
      </Text>
      <Text className="text-2xl font-extrabold text-text">
        Welcome back, {name}!
      </Text>
    </View>
  );
}
