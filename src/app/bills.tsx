import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import {
  useSubscriptions,
  useSubscriptionStats,
  Subscription,
} from '../api/subscriptions';
import { useCategories } from '../api/categories';

type ReminderFilterTab = 'all' | 'overdue' | 'due_7' | 'due_30';

export default function RenewalRemindersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ReminderFilterTab>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | string | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch upcoming subscriptions
  const {
    data: subscriptions,
    isLoading: isSubsLoading,
    refetch: refetchSubs,
  } = useSubscriptions({ limit: 100 });

  // 2. Fetch reminder statistics
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useSubscriptionStats();

  // 3. Fetch categories for chips
  const { data: categories = [], refetch: refetchCats } = useCategories();

  useFocusEffect(
    useCallback(() => {
      refetchSubs();
      refetchStats();
      refetchCats();
    }, [refetchSubs, refetchStats, refetchCats])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSubs(), refetchStats(), refetchCats()]);
    setRefreshing(false);
  }, [refetchSubs, refetchStats, refetchCats]);

  // Compute days left and filtered list
  const processedList = useMemo(() => {
    if (!subscriptions) return [];

    const today = dayjs().startOf('day');

    const mapped = subscriptions.map((sub) => {
      const billingDate = dayjs(sub.next_billing_date).startOf('day');
      const daysLeft = billingDate.diff(today, 'day');
      return {
        ...sub,
        days_left: daysLeft,
      };
    });

    return mapped.filter((sub) => {
      // Category filter
      if (selectedCategoryId !== 'all' && String(sub.category_id) !== String(selectedCategoryId)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = sub.name.toLowerCase().includes(query);
        const matchesCategory = sub.category_name?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory) return false;
      }

      // Tab filter
      if (activeTab === 'overdue') {
        return sub.days_left < 0 && sub.status !== 'cancelled';
      }
      if (activeTab === 'due_7') {
        return sub.days_left >= 0 && sub.days_left <= 7 && sub.status !== 'cancelled';
      }
      if (activeTab === 'due_30') {
        return sub.days_left >= 8 && sub.days_left <= 30 && sub.status !== 'cancelled';
      }

      return true;
    });
  }, [subscriptions, selectedCategoryId, searchQuery, activeTab]);

  const isLoading = (isSubsLoading || isStatsLoading) && !refreshing;

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Renewal Reminders" showBack={true} />

      {/* SEARCH BAR */}
      <View className="px-5 pt-3 pb-2 bg-white border-b border-slate-100">
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search renewal reminders..."
        />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 90, 110) }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#159A1D"
            colors={['#159A1D']}
          />
        }
      >
        {/* 1. TOP KPI STAT CARDS (Matching Web) */}
        <View className="px-5 pt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-1"
            contentContainerStyle={{ paddingHorizontal: 4 }}
          >
            {/* Total Recurring */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('all')}
              className={`p-3.5 rounded-2xl mr-3 w-36 border ${
                activeTab === 'all'
                  ? 'bg-purple-50/70 border-purple-200 shadow-xs'
                  : 'bg-white border-slate-100'
              }`}
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total
                </Text>
                <Ionicons name="repeat" size={14} color="#7E22CE" />
              </View>
              <Text className="text-xl font-black text-purple-700 tracking-tight">
                {stats?.total_count || 0}
              </Text>
              <Text className="text-[10px] text-slate-400 font-medium mt-0.5" numberOfLines={1}>
                {stats?.total_monthly_count || 0} M • {stats?.total_yearly_count || 0} Y
              </Text>
            </TouchableOpacity>

            {/* Overdue */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('overdue')}
              className={`p-3.5 rounded-2xl mr-3 w-36 border ${
                activeTab === 'overdue'
                  ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                  : 'bg-white border-slate-100'
              }`}
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Overdue
                </Text>
                <Ionicons name="alert-circle" size={14} color="#EF4444" />
              </View>
              <Text className="text-xl font-black text-rose-600 tracking-tight">
                {stats?.overdue_count || 0}
              </Text>
              <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                Requires attention
              </Text>
            </TouchableOpacity>

            {/* Within 7 Days */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('due_7')}
              className={`p-3.5 rounded-2xl mr-3 w-36 border ${
                activeTab === 'due_7'
                  ? 'bg-amber-50/70 border-amber-200 shadow-xs'
                  : 'bg-white border-slate-100'
              }`}
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Within 7 Days
                </Text>
                <Ionicons name="calendar-outline" size={14} color="#D97706" />
              </View>
              <Text className="text-xl font-black text-amber-600 tracking-tight">
                {stats?.within_7_days_count || 0}
              </Text>
              <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                Renewing soon
              </Text>
            </TouchableOpacity>

            {/* Within 8-30 Days */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('due_30')}
              className={`p-3.5 rounded-2xl mr-3 w-36 border ${
                activeTab === 'due_30'
                  ? 'bg-emerald-50/70 border-emerald-200 shadow-xs'
                  : 'bg-white border-slate-100'
              }`}
            >
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  8-30 Days
                </Text>
                <Ionicons name="checkmark-circle-outline" size={14} color="#159A1D" />
              </View>
              <Text className="text-xl font-black text-[#159A1D] tracking-tight">
                {stats?.within_8_30_days_count || 0}
              </Text>
              <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                Upcoming cycle
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 2. CATEGORY FILTER CHIPS */}
        <View className="pt-3 px-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-1"
            contentContainerStyle={{ paddingHorizontal: 4 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategoryId('all')}
              activeOpacity={0.7}
              className={`px-3 py-1.5 rounded-full mr-2 border ${
                selectedCategoryId === 'all'
                  ? 'bg-slate-900 border-slate-900'
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  selectedCategoryId === 'all' ? 'text-white' : 'text-slate-600'
                }`}
              >
                All Categories
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  activeOpacity={0.7}
                  className={`px-3 py-1.5 rounded-full mr-2 border ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      isSelected ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. LIST OF RENEWAL REMINDERS */}
        <View className="px-5 pt-4">
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {activeTab === 'overdue'
                ? 'Overdue Renewals'
                : activeTab === 'due_7'
                ? 'Renewals Due Within 7 Days'
                : activeTab === 'due_30'
                ? 'Renewals Due in 8-30 Days'
                : 'All Active Renewals'}
            </Text>
            <Text className="text-xs font-bold text-slate-500">
              {processedList.length} items
            </Text>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#159A1D" className="mt-8" />
          ) : processedList.length > 0 ? (
            processedList.map((sub: any) => {
              const isOverdue = sub.days_left < 0;
              const isUrgent = sub.days_left >= 0 && sub.days_left <= 7;
              const renewalDate = dayjs(sub.next_billing_date);

              // Days left badge styling
              let daysBadgeText = `${sub.days_left} days left`;
              let daysBadgeBg = 'bg-emerald-50 border-emerald-200';
              let daysBadgeTextColor = 'text-[#159A1D]';

              if (isOverdue) {
                daysBadgeText = `${Math.abs(sub.days_left)}d overdue`;
                daysBadgeBg = 'bg-rose-50 border-rose-200';
                daysBadgeTextColor = 'text-rose-600';
              } else if (isUrgent) {
                daysBadgeText = sub.days_left === 0 ? 'Due Today' : `${sub.days_left}d left`;
                daysBadgeBg = 'bg-amber-50 border-amber-200';
                daysBadgeTextColor = 'text-amber-700';
              }

              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => router.push(`/subscription/${sub.id}`)}
                  activeOpacity={0.7}
                  className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm shadow-slate-100"
                >
                  {/* Top Row: Title, Amount, Days Left Badge */}
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center flex-1 mr-3">
                      <View
                        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                        style={{
                          backgroundColor: (sub.category_color || '#3B82F6') + '20',
                        }}
                      >
                        <Ionicons
                          name={(sub.category_icon as any) || 'repeat'}
                          size={20}
                          color={sub.category_color || '#3B82F6'}
                        />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5 flex-wrap">
                          <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                            {sub.name}
                          </Text>
                          {/* Type Pill */}
                          <View
                            className={`px-1.5 py-0.2 rounded-md ${
                              sub.type === 'income' ? 'bg-emerald-50' : 'bg-slate-100'
                            }`}
                          >
                            <Text
                              className={`text-[9px] font-bold ${
                                sub.type === 'income' ? 'text-[#159A1D]' : 'text-slate-600'
                              }`}
                            >
                              {sub.type === 'income' ? 'Income' : 'Expense'}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-xs text-slate-400 font-medium mt-0.5">
                          {sub.category_name || 'Uncategorized'} • {sub.billing_cycle || 'monthly'}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-base font-black text-slate-900 font-mono">
                        ${parseFloat(sub.amount.toString()).toFixed(2)}
                      </Text>
                      {/* Days left badge */}
                      <View className={`px-2 py-0.5 rounded-full border mt-1 ${daysBadgeBg}`}>
                        <Text className={`text-[10px] font-extrabold ${daysBadgeTextColor}`}>
                          {daysBadgeText}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Bottom Row: Renewal Date & Reminder Delivery Settings */}
                  <View className="flex-row items-center justify-between pt-3 mt-3 border-t border-slate-50">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="calendar-outline" size={13} color="#64748B" />
                      <Text className="text-xs font-semibold text-slate-700">
                        {renewalDate.format('MMM D, YYYY')}
                      </Text>
                      <Text className="text-[11px] text-slate-400 font-medium">
                        ({renewalDate.format('dddd')})
                      </Text>
                    </View>

                    {/* Reminder Status Badge (Matching Web) */}
                    <View className="flex-row items-center">
                      {sub.is_reminder_on ? (
                        <View className="flex-row items-center bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full gap-1">
                          {sub.is_email_enabled ? (
                            <Ionicons name="mail" size={10} color="#159A1D" />
                          ) : null}
                          {sub.is_sms_enabled ? (
                            <Ionicons name="chatbubble" size={10} color="#159A1D" />
                          ) : null}
                          <Text className="text-[10px] font-bold text-[#159A1D]">
                            {sub.reminder_days || 3}d before
                          </Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="notifications-off-outline" size={12} color="#94A3B8" />
                          <Text className="text-[11px] font-medium text-slate-400">Off</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="items-center justify-center py-16 bg-white rounded-3xl p-6 border border-slate-100 border-dashed">
              <View className="w-14 h-14 rounded-full bg-slate-100 items-center justify-center mb-3">
                <Ionicons name="calendar-outline" size={28} color="#94A3B8" />
              </View>
              <Text className="text-base font-bold text-slate-800 mb-1">
                No reminders found
              </Text>
              <Text className="text-xs font-medium text-slate-400 text-center max-w-[220px]">
                {searchQuery
                  ? `No upcoming renewals match "${searchQuery}".`
                  : 'You have no scheduled renewals in this category.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Subscription Button */}
      <TouchableOpacity
        onPress={() => router.push('/add-subscription')}
        activeOpacity={0.85}
        className="absolute w-14 h-14 rounded-full bg-[#159A1D] items-center justify-center shadow-lg shadow-[#159A1D]/40 border-2 border-white"
        style={{
          bottom: Math.max(insets.bottom + 20, 28),
          right: 20,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
