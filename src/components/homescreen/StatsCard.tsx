import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsCardProps {
  balance: number;
  income: number;
  expense: number;
}

export default function StatsCard({ balance, income, expense }: StatsCardProps) {
  return (
    <View className="w-full bg-primary rounded-3xl p-6 shadow-md shadow-primary/40 mb-6">
      {/* Top: Total Balance */}
      <View className="mb-6">
        <Text className="text-white/80 text-sm font-medium mb-1">Total Balance</Text>
        <Text className="text-white text-4xl font-extrabold tracking-tight">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {/* Bottom: Income vs Expense Row */}
      <View className="flex-row justify-between items-center bg-white/10 rounded-2xl p-4">
        
        {/* Income */}
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
            <Ionicons name="arrow-down" size={20} color="#FFF" />
          </View>
          <View>
            <Text className="text-white/80 text-xs font-medium">Income</Text>
            <Text className="text-white text-base font-bold">
              +${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="w-[1px] h-8 bg-white/20 mx-4" />

        {/* Expense */}
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </View>
          <View>
            <Text className="text-white/80 text-xs font-medium">Expense</Text>
            <Text className="text-white text-base font-bold">
              -${expense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
}
