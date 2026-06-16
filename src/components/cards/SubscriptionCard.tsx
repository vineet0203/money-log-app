import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Subscription } from '../../types';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress?: (subscription: Subscription) => void;
}

export default function SubscriptionCard({ subscription, onPress }: SubscriptionCardProps) {
  const { name, price, billingCycle, iconName, iconBgColor, nextBillingDate } = subscription;

  const cycleText = billingCycle === 'monthly' ? '/mo' : '/yr';

  return (
    <TouchableOpacity 
      onPress={() => onPress && onPress(subscription)}
      activeOpacity={0.7}
      className="flex-row items-center bg-white py-4 border-b border-slate-100"
    >
      {/* Icon Area */}
      <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${iconBgColor}`}>
        <Ionicons name={iconName} size={24} color="#FFF" />
      </View>

      {/* Text Area */}
      <View className="flex-1 justify-center">
        <Text className="text-base font-bold text-text mb-1">{name}</Text>
        <Text className="text-sm font-medium text-textMuted">Next bill: {nextBillingDate}</Text>
      </View>

      {/* Amount Area */}
      <View className="items-end justify-center">
        <Text className="text-base font-extrabold text-text">
          ${price.toFixed(2)}<Text className="text-xs text-textMuted font-medium">{cycleText}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}
