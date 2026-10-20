import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../types';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  variant?: 'card' | 'row';
  showDivider?: boolean;
}

export default function TransactionCard({
  transaction,
  onPress,
  variant = 'card',
  showDivider = false,
}: TransactionCardProps) {
  const {
    id,
    title,
    subtitle,
    amount,
    type,
    iconName,
    categoryName,
    categoryColor,
    categoryIcon,
    hasReceipt,
    isRecurring,
    formattedTime,
  } = transaction;

  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  const amountStr = `${isExpense ? '-' : '+'}$${Math.abs(amount).toFixed(2)}`;

  // Resolved colors & icons
  const iconBg = categoryColor
    ? `${categoryColor}15`
    : isIncome
    ? '#159A1D15'
    : '#64748B15';

  const iconColor = categoryColor || (isIncome ? '#159A1D' : '#64748B');

  const resolvedIcon =
    categoryIcon ||
    iconName ||
    (isIncome ? 'arrow-down-outline' : 'arrow-up-outline');

  const cardContent = (
    <View className="flex-row items-center justify-between">
      {/* Left: Icon & Details */}
      <View className="flex-row items-center flex-1 pr-3">
        {/* Soft Squircle Icon with Direction Dot */}
        <View className="relative mr-3.5">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center border border-slate-100"
            style={{ backgroundColor: iconBg }}
          >
            <Ionicons name={resolvedIcon as any} size={22} color={iconColor} />
          </View>

          {/* Mini Direction Indicator Dot */}
          <View
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full items-center justify-center border-2 border-white ${
              isIncome ? 'bg-[#159A1D]' : 'bg-slate-400'
            }`}
          >
            <Ionicons
              name={isIncome ? 'arrow-down' : 'arrow-up'}
              size={9}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* Text Info */}
        <View className="flex-1 justify-center">
          <Text
            numberOfLines={1}
            className="text-[15px] font-bold text-slate-900 tracking-tight mb-1"
          >
            {title}
          </Text>

          <View className="flex-row items-center flex-wrap gap-1.5">
            {/* Category Pill */}
            <View className="bg-slate-100 px-2 py-0.5 rounded-md">
              <Text
                numberOfLines={1}
                className="text-[11px] font-semibold text-slate-600 max-w-[130px]"
              >
                {categoryName || subtitle || (isIncome ? 'Income' : 'Expense')}
              </Text>
            </View>

            {/* Subscription Badge */}
            {isRecurring && (
              <View className="flex-row items-center bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-md">
                <Ionicons name="repeat" size={10} color="#7C3AED" />
                <Text className="text-[10px] font-bold text-purple-700 ml-0.5">Subscription</Text>
              </View>
            )}

            {/* Receipt Icon */}
            {hasReceipt && (
              <View className="bg-slate-100 px-1.5 py-0.5 rounded-md">
                <Ionicons name="attach-outline" size={12} color="#64748B" />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Right: Amount & Time */}
      <View className="items-end justify-center">
        <Text
          className={`text-[16px] font-black tracking-tight ${
            isIncome ? 'text-[#159A1D]' : 'text-slate-900'
          }`}
        >
          {amountStr}
        </Text>

        {formattedTime ? (
          <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
            {formattedTime}
          </Text>
        ) : (
          <View className="flex-row items-center mt-0.5">
            <Text className="text-[11px] font-semibold text-slate-400">View</Text>
            <Ionicons name="chevron-forward" size={12} color="#CBD5E1" className="ml-0.5" />
          </View>
        )}
      </View>
    </View>
  );

  if (variant === 'row') {
    return (
      <TouchableOpacity
        onPress={() => (onPress ? onPress(transaction) : router.push(`/transaction/${id}`))}
        activeOpacity={0.7}
        className="py-3.5 bg-white"
      >
        {cardContent}
        {showDivider && <View className="h-[1px] bg-slate-100 ml-15 mt-3" />}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => (onPress ? onPress(transaction) : router.push(`/transaction/${id}`))}
      activeOpacity={0.7}
      className="bg-white rounded-2xl p-3.5 mb-2.5 border border-slate-100 shadow-xs shadow-slate-100 flex-col"
    >
      {cardContent}
    </TouchableOpacity>
  );
}
