import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Bill } from '../../types';

interface BillCardProps {
  bill: Bill;
  onPress?: (bill: Bill) => void;
}

export default function BillCard({ bill, onPress }: BillCardProps) {
  const { name, amount, dueDate, status, iconName, iconBgColor } = bill;

  const isPaid = status === 'paid';

  return (
    <TouchableOpacity 
      onPress={() => onPress && onPress(bill)}
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
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
          <Text className="text-sm font-medium text-textMuted ml-1">
            {isPaid ? `Paid on ${dueDate}` : `Due ${dueDate}`}
          </Text>
        </View>
      </View>

      {/* Amount & Status Area */}
      <View className="items-end justify-center">
        <Text className="text-base font-extrabold text-text mb-1">
          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <View className={`px-2 py-0.5 rounded-full ${isPaid ? 'bg-green-100' : 'bg-orange-100'}`}>
          <Text className={`text-[10px] font-bold uppercase tracking-wider ${isPaid ? 'text-green-700' : 'text-orange-700'}`}>
            {status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
