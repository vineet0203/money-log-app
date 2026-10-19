import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import SearchBar from '../../components/common/SearchBar';
import SubscriptionCard from '../../components/cards/SubscriptionCard';
import { useSubscriptionsInfinite } from '../../api/subscriptions';

const TABS = ['All', 'Active', 'Due Soon', 'Inactive'];

export default function SubscriptionsScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useSubscriptionsInfinite();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const allSubs = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  // Symmetrical 4 Stats matching Web StatCard row (§2.1, §2.2)
  const stats = useMemo(() => {
    let monthlyTotal = 0;
    let activeCount = 0;
    let upcomingCount = 0;
    let overdueCount = 0;
    let inactiveCount = 0;
    const today = dayjs().startOf('day');

    allSubs.forEach((sub) => {
      const isAct = sub.status !== 'cancelled';
      if (isAct) {
        activeCount++;
        const amt = parseFloat(sub.amount?.toString() || '0');
        if (sub.billing_cycle === 'yearly') {
          monthlyTotal += amt / 12;
        } else {
          monthlyTotal += amt;
        }

        if (sub.next_billing_date) {
          const dueDate = dayjs(sub.next_billing_date).startOf('day');
          if (dueDate.isValid()) {
            const diff = dueDate.diff(today, 'day');
            if (diff < 0) {
              overdueCount++;
            } else if (diff <= 7) {
              upcomingCount++;
            }
          }
        }
      } else {
        inactiveCount++;
      }
    });

    return {
      monthlyTotal,
      activeCount,
      upcomingCount,
      overdueCount,
      inactiveCount,
      totalCount: allSubs.length,
    };
  }, [allSubs]);

  // Tab Filtering matching Web (All, Ongoing, Upcoming, Inactive)
  const { filteredList, counts } = useMemo(() => {
    let allCount = 0;
    let actCount = 0;
    let upCount = 0;
    let inactCount = 0;
    const today = dayjs().startOf('day');

    allSubs.forEach((sub) => {
      allCount++;
      const isAct = sub.status !== 'cancelled';
      if (isAct) {
        actCount++;
        if (sub.next_billing_date) {
          const dueDate = dayjs(sub.next_billing_date).startOf('day');
          if (dueDate.isValid()) {
            const diff = dueDate.diff(today, 'day');
            if (diff >= 0 && diff <= 7) upCount++;
          }
        }
      } else {
        inactCount++;
      }
    });

    const filtered = allSubs.filter((sub) => {
      const isAct = sub.status !== 'cancelled';

      if (activeTab === 'Active' && !isAct) return false;
      if (activeTab === 'Inactive' && isAct) return false;
      if (activeTab === 'Due Soon') {
        if (!isAct || !sub.next_billing_date) return false;
        const dueDate = dayjs(sub.next_billing_date).startOf('day');
        if (!dueDate.isValid()) return false;
        const diff = dueDate.diff(today, 'day');
        if (diff < 0 || diff > 7) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = sub.name?.toLowerCase().includes(q);
        const matchesCat = sub.category_name?.toLowerCase().includes(q);
        return matchesName || matchesCat;
      }
      return true;
    });

    return {
      filteredList: filtered,
      counts: {
        All: allCount,
        Active: actCount,
        'Due Soon': upCount,
        Inactive: inactCount,
      },
    };
  }, [allSubs, activeTab, searchQuery]);

  const openAddScreen = () => {
    router.push('/add-subscription');
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isError) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-3xl bg-red-50 items-center justify-center mb-3">
          <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        </View>
        <Text className="text-base font-bold text-slate-800 mb-1">Failed to load subscriptions</Text>
        <Text className="text-xs text-slate-400 text-center mb-4">
          Please check your network connection and try again.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-slate-900 px-5 py-2.5 rounded-full"
        >
          <Text className="text-white text-xs font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50/70">
      {/* Search Input Bar */}
      <View className="px-5 pt-3 pb-2 bg-white border-b border-slate-100">
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search recurring bills & subscriptions..."
        />
      </View>

      {/* Segmented Filter Pills matching Web Tabs (All, Active, Due Soon, Inactive) */}
      <View className="bg-white px-5 py-2.5 border-b border-slate-100">
        <View className="flex-row bg-slate-100 p-1 rounded-2xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const count = counts[tab as keyof typeof counts] || 0;

            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
                className={`flex-1 py-2 items-center justify-center rounded-xl flex-row ${
                  isActive ? 'bg-white shadow-xs' : ''
                }`}
              >
                <Text
                  className={`text-xs ${
                    isActive ? 'text-slate-900 font-extrabold' : 'text-slate-500 font-semibold'
                  }`}
                >
                  {tab}
                </Text>
                {count > 0 && (
                  <View
                    className={`ml-1 px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-100' : 'bg-slate-200/60'
                    }`}
                  >
                    <Text
                      className={`text-[10px] ${
                        isActive ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'
                      }`}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Content List */}
      {isLoading && !isRefetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#159A1D" />
          <Text className="text-slate-400 font-semibold text-xs mt-3">Loading recurring payments...</Text>
        </View>
      ) : (
        <FlatList
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 14 }}
          data={filteredList}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            allSubs.length > 0 ? (
              <View className="mb-4">
                {/* 4 Stat Cards directly matching Web's StatCard row */}
                <View className="flex-row flex-wrap gap-2.5">
                  {/* Active Payments */}
                  <View className="flex-1 min-w-[46%] bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-[11px] font-bold text-slate-500" numberOfLines={1}>
                        Active Payments
                      </Text>
                      <View className="w-6 h-6 rounded-lg bg-emerald-50 items-center justify-center">
                        <Ionicons name="repeat" size={13} color="#159A1D" />
                      </View>
                    </View>
                    <Text className="text-xl font-black text-slate-900">
                      {stats.activeCount.toString().padStart(2, '0')}
                    </Text>
                    <Text className="text-[10px] font-medium text-slate-400 mt-0.5">
                      Running schedules
                    </Text>
                  </View>

                  {/* Due in 7 Days */}
                  <View className="flex-1 min-w-[46%] bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-[11px] font-bold text-slate-500" numberOfLines={1}>
                        Due in 7 Days
                      </Text>
                      <View className="w-6 h-6 rounded-lg bg-amber-50 items-center justify-center">
                        <Ionicons name="calendar-outline" size={13} color="#D97706" />
                      </View>
                    </View>
                    <Text className="text-xl font-black text-slate-900">
                      {stats.upcomingCount.toString().padStart(2, '0')}
                    </Text>
                    <Text className="text-[10px] font-medium text-slate-400 mt-0.5">
                      Upcoming renewals
                    </Text>
                  </View>

                  {/* Overdue / Missed */}
                  <View className="flex-1 min-w-[46%] bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-[11px] font-bold text-slate-500" numberOfLines={1}>
                        Overdue / Missed
                      </Text>
                      <View className="w-6 h-6 rounded-lg bg-rose-50 items-center justify-center">
                        <Ionicons name="alert-circle-outline" size={13} color="#E11D48" />
                      </View>
                    </View>
                    <Text className="text-xl font-black text-slate-900">
                      {stats.overdueCount.toString().padStart(2, '0')}
                    </Text>
                    <Text className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {stats.overdueCount > 0 ? 'Requires attention' : 'All up to date'}
                    </Text>
                  </View>

                  {/* Inactive Payments */}
                  <View className="flex-1 min-w-[46%] bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs">
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-[11px] font-bold text-slate-500" numberOfLines={1}>
                        Inactive Payments
                      </Text>
                      <View className="w-6 h-6 rounded-lg bg-slate-100 items-center justify-center">
                        <Ionicons name="pause-circle-outline" size={13} color="#64748B" />
                      </View>
                    </View>
                    <Text className="text-xl font-black text-slate-900">
                      {stats.inactiveCount.toString().padStart(2, '0')}
                    </Text>
                    <Text className="text-[10px] font-medium text-slate-400 mt-0.5">
                      Paused or cancelled
                    </Text>
                  </View>
                </View>

                {/* Section Title */}
                <View className="flex-row justify-between items-center mt-5 mb-1 px-1">
                  <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Recurring Schedules
                  </Text>
                  <Text className="text-xs font-bold text-[#159A1D]">
                    ${stats.monthlyTotal.toFixed(2)}/mo
                  </Text>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item: sub }) => (
            <SubscriptionCard
              subscription={{
                id: sub.id,
                name: sub.name,
                price: parseFloat(sub.amount?.toString() || '0'),
                billingCycle: sub.billing_cycle,
                nextBillingDate: sub.next_billing_date
                  ? sub.next_billing_date.split('T')[0]
                  : undefined,
                status: sub.status,
                categoryName: sub.category_name,
                iconColor: sub.category_color,
                iconBgColor: sub.category_color,
                iconName: sub.category_icon,
                autoPost: sub.auto_post,
              }}
              onPress={() => router.push(`/subscription/${sub.id}`)}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color="#159A1D" className="my-4" />
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-8 bg-white rounded-3xl p-8 border border-slate-100 border-dashed">
              <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-3">
                <Ionicons name="repeat-outline" size={32} color="#94A3B8" />
              </View>
              <Text className="text-base font-bold text-slate-800 mb-1">
                No recurring payments found
              </Text>
              <Text className="text-xs font-medium text-slate-400 text-center max-w-[220px] mb-4">
                {searchQuery
                  ? `No subscriptions match "${searchQuery}".`
                  : activeTab !== 'All'
                  ? `No ${activeTab.toLowerCase()} payments found.`
                  : 'Track your subscriptions, rent, gym, and bills easily.'}
              </Text>
              <TouchableOpacity
                onPress={openAddScreen}
                activeOpacity={0.8}
                className="bg-[#159A1D] px-5 py-2.5 rounded-full flex-row items-center shadow-sm shadow-[#159A1D]/20"
              >
                <Ionicons name="add" size={16} color="#FFF" />
                <Text className="text-white font-bold text-xs ml-1">Add Recurring Payment</Text>
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#159A1D']}
              tintColor="#159A1D"
            />
          }
        />
      )}

      {/* Floating Add Recurring Button */}
      <TouchableOpacity
        onPress={openAddScreen}
        activeOpacity={0.85}
        className="absolute right-5 bottom-6 w-14 h-14 rounded-full bg-[#159A1D] items-center justify-center shadow-lg shadow-[#159A1D]/40 border-2 border-white"
        style={{ elevation: 6 }}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
