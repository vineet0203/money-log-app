import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReportSummaryCardProps {
  income: number;
  incomeChangePercentage: number;
  expense: number;
  expenseChangePercentage: number;
}

export default function ReportSummaryCard({ 
  income, 
  expense, 
  incomeChangePercentage,
  expenseChangePercentage 
}: ReportSummaryCardProps) {
  
  const isExpenseUp = expenseChangePercentage > 0;
  const isIncomeUp = incomeChangePercentage > 0;

  return (
    <View className="flex-row justify-between bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-100 mt-4 mx-5 mb-6">
      
      {/* Expense Side */}
      <View className="flex-1 items-center border-r border-slate-100 pr-2">
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expense</Text>
        <Text className="text-2xl font-extrabold text-slate-800 mb-3">
          ${expense.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </Text>
        <View className={`flex-row items-center px-2 py-1 rounded-full ${isExpenseUp ? 'bg-red-50' : 'bg-green-50'}`}>
          <Ionicons name={isExpenseUp ? 'trending-up' : 'trending-down'} size={12} color={isExpenseUp ? '#EF4444' : '#22C55E'} />
          <Text className={`text-[10px] font-extrabold ml-1 ${isExpenseUp ? 'text-red-500' : 'text-green-500'}`}>
            {Math.abs(expenseChangePercentage)}% vs last mo
          </Text>
        </View>
      </View>

      {/* Income Side */}
      <View className="flex-1 items-center pl-2">
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Income</Text>
        <Text className="text-2xl font-extrabold text-slate-800 mb-3">
          ${income.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </Text>
        <View className={`flex-row items-center px-2 py-1 rounded-full ${isIncomeUp ? 'bg-green-50' : 'bg-red-50'}`}>
          <Ionicons name={isIncomeUp ? 'trending-up' : 'trending-down'} size={12} color={isIncomeUp ? '#22C55E' : '#EF4444'} />
          <Text className={`text-[10px] font-extrabold ml-1 ${isIncomeUp ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(incomeChangePercentage)}% vs last mo
          </Text>
        </View>
      </View>

    </View>
  );
}
