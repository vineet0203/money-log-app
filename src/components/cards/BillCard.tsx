import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Subscription } from '../../api/subscriptions';

interface BillCardProps {
  subscription: Subscription;
  onPress?: (subscription: Subscription) => void;
}

export default function BillCard({ subscription, onPress }: BillCardProps) {
  const { name, amount, next_billing_date } = subscription;

  const calculateDaysRemaining = (dateString: string) => {
    const due = new Date(dateString);
    const today = new Date();
    // Strip time for accurate day difference
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(next_billing_date);
  const isOverdue = daysRemaining < 0;
  const isDueToday = daysRemaining === 0;

  let statusText = `Due in ${daysRemaining} days`;
  let statusColor = 'text-orange-700';
  let statusBg = 'bg-orange-100';

  if (isOverdue) {
    statusText = `Overdue by ${Math.abs(daysRemaining)} days`;
    statusColor = 'text-red-700';
    statusBg = 'bg-red-100';
  } else if (isDueToday) {
    statusText = 'Due Today';
    statusColor = 'text-red-700';
    statusBg = 'bg-red-100';
  } else if (daysRemaining > 7) {
    statusColor = 'text-slate-700';
    statusBg = 'bg-slate-100';
  }

  // Parse amount carefully
  const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // We can use a generic document/bill icon or map based on name later
  const iconName = 'receipt';
  const iconBgColor = isOverdue ? 'bg-red-500' : 'bg-orange-500';

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
        <Text className="text-base font-bold text-gray-800 mb-1">{name}</Text>
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
          <Text className="text-sm font-medium text-slate-500 ml-1">
            {new Date(next_billing_date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Amount & Status Area */}
      <View className="items-end justify-center">
        <Text className="text-base font-extrabold text-gray-800 mb-1">
          ${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <View className={`px-2 py-0.5 rounded-full ${statusBg}`}>
          <Text className={`text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
            {statusText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
