import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

export interface SubscriptionCardData {
  id: string | number;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate?: string;
  status?: 'active' | 'cancelled';
  iconName?: any;
  iconBgColor?: string;
  iconColor?: string;
  categoryName?: string;
  autoPost?: boolean | number;
}

interface SubscriptionCardProps {
  subscription: SubscriptionCardData;
  showActions?: boolean;
  onPress?: (subscription: SubscriptionCardData) => void;
  onDetails?: (subscription: SubscriptionCardData) => void;
  onEdit?: (subscription: SubscriptionCardData) => void;
  onCancel?: (subscription: SubscriptionCardData) => void;
}

export const getInitials = (name: string) => {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].slice(0, 2).toUpperCase();
};

export const getSubscriptionColor = (name: string, categoryColor?: string): string => {
  if (categoryColor && categoryColor !== '#CBD5E1' && categoryColor !== '#94A3B8') {
    return categoryColor;
  }
  const n = name.toLowerCase();
  if (n.includes('rent') || n.includes('apartment') || n.includes('home')) return '#159A1D';
  if (n.includes('netflix') || n.includes('youtube')) return '#EF4444';
  if (n.includes('spotify')) return '#10B981';
  if (n.includes('gym') || n.includes('fitness')) return '#F59E0B';
  if (n.includes('wifi') || n.includes('internet') || n.includes('cloud')) return '#3B82F6';
  return '#159A1D';
};

export default function SubscriptionCard({
  subscription,
  onPress,
  onDetails,
}: SubscriptionCardProps) {
  const {
    name,
    price,
    billingCycle,
    iconColor,
    nextBillingDate,
    status = 'active',
    categoryName,
    autoPost,
  } = subscription;

  const cycleText = billingCycle === 'monthly' ? '/mo' : '/yr';
  const color = getSubscriptionColor(name, iconColor);
  const initials = getInitials(name);
  const isCancelled = status === 'cancelled';

  // Calculate due countdown badge matching Web
  const getDueBadge = () => {
    if (!nextBillingDate || nextBillingDate === '—') return null;
    const today = dayjs().startOf('day');
    const dueDate = dayjs(nextBillingDate).startOf('day');
    if (!dueDate.isValid()) return null;

    const diffDays = dueDate.diff(today, 'day');

    if (diffDays < 0) {
      return (
        <View className="bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 flex-row items-center">
          <Text className="text-[10.5px] font-extrabold text-rose-600">
            {Math.abs(diffDays)}d overdue
          </Text>
        </View>
      );
    }
    if (diffDays === 0) {
      return (
        <View className="bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 flex-row items-center">
          <Text className="text-[10.5px] font-extrabold text-amber-700">Due today</Text>
        </View>
      );
    }
    if (diffDays === 1) {
      return (
        <View className="bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 flex-row items-center">
          <Text className="text-[10.5px] font-extrabold text-amber-700">Due tomorrow</Text>
        </View>
      );
    }
    if (diffDays <= 7) {
      return (
        <View className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex-row items-center">
          <Text className="text-[10.5px] font-extrabold text-[#159A1D]">In {diffDays}d</Text>
        </View>
      );
    }

    return (
      <View className="bg-slate-100 px-2 py-0.5 rounded-md flex-row items-center">
        <Text className="text-[10.5px] font-semibold text-slate-500">
          In {diffDays}d
        </Text>
      </View>
    );
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress(subscription);
    } else if (onDetails) {
      onDetails(subscription);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      activeOpacity={0.75}
      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs mb-3"
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Avatar with Initials + Title & Category */}
        <View className="flex-row items-center flex-1 mr-3">
          {/* Subscription Initials Avatar matching Web SubscriptionLogo */}
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: color }}
          >
            <Text className="text-xs font-black text-white uppercase tracking-wider">
              {initials}
            </Text>
          </View>

          <View className="flex-1 min-w-0">
            <View className="flex-row items-center flex-wrap gap-1.5 mb-0.5">
              <Text
                className="text-sm font-bold text-slate-900"
                numberOfLines={1}
              >
                {name}
              </Text>

              {Boolean(autoPost) && (
                <View className="bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 flex-row items-center">
                  <Ionicons name="flash" size={9} color="#0284C7" className="mr-0.5" />
                  <Text className="text-[9px] font-bold text-sky-700">Auto-post</Text>
                </View>
              )}

              {isCancelled && (
                <View className="bg-slate-100 px-1.5 py-0.2 rounded">
                  <Text className="text-[9px] font-bold text-slate-500 uppercase">Inactive</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center flex-wrap gap-1">
              <Text className="text-xs font-medium text-slate-500 capitalize">
                {categoryName || 'General'}
              </Text>
              <Text className="text-xs text-slate-300">·</Text>
              <Text className="text-xs font-medium text-slate-500 capitalize">
                {billingCycle}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Amount & Frequency */}
        <View className="items-end justify-center">
          <Text className="text-base font-extrabold text-slate-900">
            ${price.toFixed(2)}
          </Text>
          <Text className="text-[11px] font-semibold text-slate-400">
            {cycleText}
          </Text>
        </View>
      </View>

      {/* Footer Row matching Web due date and days left */}
      <View className="mt-3 pt-2.5 border-t border-slate-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={13} color="#94A3B8" className="mr-1.5" />
          <Text className="text-xs font-medium text-slate-500">
            {nextBillingDate ? `Due ${dayjs(nextBillingDate).format('DD-MM-YYYY')}` : 'No due date'}
          </Text>
        </View>

        {getDueBadge()}
      </View>
    </TouchableOpacity>
  );
}
