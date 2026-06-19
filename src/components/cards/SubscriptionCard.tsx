import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Subscription } from '../../types';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress?: (subscription: Subscription) => void;
  showActions?: boolean;
  onEdit?: (subscription: Subscription) => void;
  onCancel?: (subscription: Subscription) => void;
  onDetails?: (subscription: Subscription) => void;
}

export default function SubscriptionCard({ 
  subscription, 
  onPress, 
  showActions = true,
  onEdit,
  onCancel,
  onDetails
}: SubscriptionCardProps) {
  const { name, price, billingCycle, iconName, iconBgColor, iconColor, nextBillingDate } = subscription;

  const cycleText = billingCycle === 'monthly' ? '/mo' : '/yr';

  return (
    <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 mb-3">
      <TouchableOpacity 
        onPress={() => onPress ? onPress(subscription) : (onDetails && onDetails(subscription))}
        activeOpacity={0.7}
        className="flex-row items-center mb-1"
      >
        {/* Icon Area */}
        <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${iconBgColor || 'bg-primary/20'}`}>
          <Ionicons name={iconName || 'play-circle'} size={24} color={iconColor || (iconBgColor ? "#FFF" : "#6BCB77")} />
        </View>

        {/* Text Area */}
        <View className="flex-1 justify-center">
          <Text className="text-lg font-bold text-gray-800 mb-0.5">{name}</Text>
          <Text className="text-sm font-medium text-gray-500">Next bill: {nextBillingDate}</Text>
        </View>

        {/* Amount Area */}
        <View className="items-end justify-center">
          <Text className="text-lg font-bold text-gray-800">
            ${price.toFixed(2)}<Text className="text-sm text-gray-400 font-bold">{cycleText}</Text>
          </Text>
        </View>
      </TouchableOpacity>

      {/* Actions Area */}
      {showActions && (
        <View className="flex-row items-center border-t border-slate-100 pt-3 mt-3">
          <TouchableOpacity 
            onPress={() => onEdit && onEdit(subscription)}
            className="flex-1 items-center justify-center py-2 flex-row"
          >
            <Ionicons name="pencil" size={18} color="#3B82F6" className="mr-1" />
            <Text className="text-blue-500 font-bold ml-1">Edit</Text>
          </TouchableOpacity>
          
          <View className="w-[1px] h-6 bg-slate-200 mx-1" />
          
          <TouchableOpacity 
            onPress={() => onCancel && onCancel(subscription)}
            className="flex-1 items-center justify-center py-2 flex-row"
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" className="mr-1" />
            <Text className="text-red-500 font-bold ml-1">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
