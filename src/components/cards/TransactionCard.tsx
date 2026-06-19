import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../types';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

export default function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const router = useRouter();
  const { title, subtitle, amount, type, iconName, iconBgColor } = transaction;

  // Format amount based on type
  const isExpense = type === 'expense';
  const amountStr = `${isExpense ? '-' : '+'}$${Math.abs(amount).toFixed(2)}`;
  const amountColor = isExpense ? 'text-red-500' : 'text-primary';

  return (
    <TouchableOpacity 
      onPress={() => onPress ? onPress(transaction) : router.push(`/transaction/${transaction.id}`)}
      activeOpacity={0.7}
      className="flex-row items-center bg-white py-4 border-b border-slate-100"
    >
      {/* Icon Area */}
      <View 
        className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${iconBgColor?.startsWith('bg-') ? iconBgColor : ''}`}
        style={iconBgColor?.startsWith('#') ? { backgroundColor: iconBgColor } : {}}
      >
        <Ionicons name={iconName} size={24} color="#FFF" />
      </View>

      {/* Text Area */}
      <View className="flex-1 justify-center">
        <Text className="text-base font-bold text-text mb-1">{title}</Text>
        <Text className="text-sm font-medium text-textMuted">{subtitle}</Text>
      </View>

      {/* Amount Area */}
      <View className="items-end justify-center">
        <Text className={`text-base font-extrabold ${amountColor}`}>
          {amountStr}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
