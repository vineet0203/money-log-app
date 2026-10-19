import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsCardProps {
  balance: number;
  income: number;
  expense: number;
  savingsRate?: {
    rate: number | null;
    delta: number | null;
  };
  netSaved?: number;
}

export default function StatsCard({ balance, income, expense, savingsRate, netSaved }: StatsCardProps) {
  const hasSavingsRate = savingsRate?.rate !== null && savingsRate?.rate !== undefined;
  const rateVal = hasSavingsRate ? savingsRate.rate : null;
  const deltaVal = savingsRate?.delta;

  const computedNet = netSaved !== undefined ? netSaved : (income - expense);

  return (
    <View className="w-full bg-[#159A1D] rounded-3xl p-6 shadow-md shadow-[#159A1D]/30 mb-6">
      {/* Top: Total Balance & Savings Rate Badge */}
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</Text>
          <Text className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        {hasSavingsRate && (
          <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center border border-white/20">
            <Ionicons name="trending-up" size={14} color="#FFF" />
            <Text className="text-white text-xs font-extrabold ml-1.5">
              {rateVal}% Saved
            </Text>
            {deltaVal !== null && deltaVal !== undefined && deltaVal !== 0 && (
              <Text className="text-white/90 text-[10px] font-bold ml-1">
                ({deltaVal > 0 ? `+${deltaVal}%` : `${deltaVal}%`})
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Bottom: Income vs Expense Row */}
      <View className="bg-white/15 rounded-2xl p-4">
        <View className="flex-row justify-between items-center">
          {/* Income */}
          <View className="flex-row items-center flex-1">
            <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center mr-3">
              <Ionicons name="arrow-down" size={18} color="#FFF" />
            </View>
            <View>
              <Text className="text-white/80 text-[11px] font-semibold">Income MTD</Text>
              <Text className="text-white text-sm sm:text-base font-extrabold">
                +${income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="w-[1px] h-8 bg-white/20 mx-3" />

          {/* Expense */}
          <View className="flex-row items-center flex-1">
            <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center mr-3">
              <Ionicons name="arrow-up" size={18} color="#FFF" />
            </View>
            <View>
              <Text className="text-white/80 text-[11px] font-semibold">Expense MTD</Text>
              <Text className="text-white text-sm sm:text-base font-extrabold">
                -${expense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Net Saved Footer */}
        <View className="flex-row justify-between items-center mt-3 pt-2.5 border-t border-white/15">
          <Text className="text-white/80 text-[11px] font-medium">Net Saved This Month</Text>
          <Text className="text-white text-xs font-extrabold">
            {computedNet >= 0 ? '+' : '-'}${Math.abs(computedNet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>
    </View>
  );
}
