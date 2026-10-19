import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/authStore';
import { useDashboardOverview } from '../../api/dashboard';
import { useSubscriptions } from '../../api/subscriptions';
import WelcomeCard from '../../components/homescreen/WelcomeCard';
import StatsCard from '../../components/homescreen/StatsCard';
import BudgetHealthCard from '../../components/homescreen/BudgetHealthCard';
import SubscriptionCard from '../../components/cards/SubscriptionCard';
import BillCard from '../../components/cards/BillCard';
import TransactionCard from '../../components/cards/TransactionCard';

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();

  // 1. Fetch Unified Dashboard Overview (Stats, Savings Rate, Budgets, Recent Transactions)
  const {
    data: dashboard,
    isLoading: isLoadingDashboard,
    refetch: refetchDashboard,
  } = useDashboardOverview();

  // 2. Fetch Top 3 Active Subscriptions
  const {
    data: subscriptions,
    isLoading: isLoadingSubs,
    refetch: refetchSubs,
  } = useSubscriptions({ limit: 3 });

  // 3. Fetch Top 3 Upcoming Bills (Due in 15 days)
  const {
    data: upcomingBills,
    isLoading: isLoadingBills,
    refetch: refetchBills,
  } = useSubscriptions({ upcomingDays: 15, limit: 3 });

  useFocusEffect(
    useCallback(() => {
      refetchDashboard();
      refetchSubs();
      refetchBills();
    }, [refetchDashboard, refetchSubs, refetchBills])
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchDashboard(),
      refetchSubs(),
      refetchBills(),
    ]);
    setRefreshing(false);
  }, [refetchDashboard, refetchSubs, refetchBills]);

  const displayName = user?.name || "User";

  // Stat values from unified overview (Calculated from transactions: All-Time Income - All-Time Expense)
  const income = dashboard?.todayIncome?.thisMonth || 0;
  const expense = dashboard?.todayExpenses?.thisMonth || 0;
  const balance = dashboard?.totalBalance?.total !== undefined 
    ? Number(dashboard.totalBalance.total) 
    : (income - expense);
  const savingsRate = dashboard?.savingsRate;
  const netSaved = dashboard?.netProfit?.monthly ?? (income - expense);

  // Recent transactions list from overview
  const recentTransactions = dashboard?.recentTransactions || [];

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#159A1D']}
            tintColor="#159A1D"
          />
        }
      >
        {/* 1. GREETING CARD */}
        <WelcomeCard name={displayName} />

        {/* 2. STATS */}
        {isLoadingDashboard && !dashboard ? (
          <View className="h-44 rounded-3xl bg-slate-100 items-center justify-center mb-6">
            <ActivityIndicator color="#159A1D" />
          </View>
        ) : (
          <StatsCard
            balance={balance}
            income={income}
            expense={expense}
            savingsRate={savingsRate}
            netSaved={netSaved}
          />
        )}

        {/* 3. ACTIVE RECURRING */}
        <View className="flex-row justify-between items-end mb-3">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-[#159A1D] mr-2" />
            <Text className="text-lg font-extrabold text-slate-900">Active Recurring</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/subscriptions')} activeOpacity={0.7}>
            <Text className="text-[#159A1D] font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingSubs && !subscriptions ? (
          <ActivityIndicator color="#159A1D" className="my-3" />
        ) : subscriptions && subscriptions.length > 0 ? (
          <View className="mb-6">
            {subscriptions.slice(0, 3).map((sub) => (
              <SubscriptionCard
                key={sub.id}
                subscription={{
                  id: sub.id.toString(),
                  name: sub.name,
                  price: parseFloat(sub.amount.toString()),
                  billingCycle: sub.billing_cycle,
                  iconName: sub.category_icon || 'play-circle',
                  iconBgColor: sub.category_color ? `${sub.category_color}20` : 'bg-primary/20',
                  iconColor: sub.category_color || '#159A1D',
                  nextBillingDate: sub.next_billing_date ? sub.next_billing_date.split('T')[0] : '—',
                  categoryName: sub.category_name,
                  status: sub.status,
                  autoPost: sub.auto_post,
                }}
                onPress={() => router.push(`/subscription/${sub.id}`)}
              />
            ))}
          </View>
        ) : (
          <View className="bg-slate-50/70 rounded-2xl p-5 items-center justify-center border border-slate-100 border-dashed mb-6">
            <Text className="text-slate-400 text-xs font-medium text-center mb-2">No active subscriptions yet.</Text>
            <TouchableOpacity onPress={() => router.push('/add-subscription')} activeOpacity={0.7}>
              <Text className="text-[#159A1D] font-bold text-xs">Add Subscription</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. UPCOMING DUE - UPCOMING BILLS & RECURRING */}
        <View className="flex-row justify-between items-end mb-3">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
            <Text className="text-lg font-extrabold text-slate-900">Upcoming Bills & Recurring</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/bills')} activeOpacity={0.7}>
            <Text className="text-[#159A1D] font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingBills && !upcomingBills ? (
          <ActivityIndicator color="#159A1D" className="my-3" />
        ) : upcomingBills && upcomingBills.length > 0 ? (
          <View className="bg-white rounded-2xl border border-slate-100 px-4 mb-6 shadow-sm shadow-slate-100">
            {upcomingBills.slice(0, 3).map((bill) => (
              <BillCard
                key={bill.id}
                subscription={bill}
                onPress={(b) => router.push(`/subscription/${b.id}`)}
              />
            ))}
          </View>
        ) : (
          <View className="bg-slate-50/70 rounded-2xl p-5 items-center justify-center border border-slate-100 border-dashed mb-6">
            <Ionicons name="calendar-outline" size={24} color="#94A3B8" className="mb-1" />
            <Text className="text-slate-400 text-xs font-medium text-center">No bills due in the next 15 days!</Text>
          </View>
        )}

        {/* 5. RECENT TRANSACTIONS */}
        <View className="flex-row justify-between items-end mb-3">
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            <Text className="text-lg font-extrabold text-slate-900">Recent Transactions</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/transactions')} activeOpacity={0.7}>
            <Text className="text-[#159A1D] font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingDashboard && !dashboard ? (
          <ActivityIndicator color="#159A1D" className="my-3" />
        ) : recentTransactions.length > 0 ? (
          <View className="bg-white rounded-2xl border border-slate-100 px-4 mb-6 shadow-sm shadow-slate-100">
            {recentTransactions.slice(0, 5).map((tx, idx, arr) => {
              const isIncome = tx.type === 'income';
              const iconName = tx.category_icon || (isIncome ? 'cash-outline' : 'receipt-outline');
              const iconBg = tx.category_color ? `${tx.category_color}20` : (isIncome ? '#159A1D' : '#64748B');

              return (
                <TransactionCard
                  key={tx.id}
                  showDivider={idx < arr.length - 1}
                  transaction={{
                    id: tx.id.toString(),
                    title: tx.title,
                    subtitle: `${tx.category_name || (isIncome ? 'Income' : 'Expense')} • ${dayjs(tx.date).format('MMM D')}`,
                    amount: parseFloat(tx.amount.toString()),
                    type: tx.type,
                    date: tx.date ? tx.date.split('T')[0] : '',
                    iconName: iconName,
                    iconBgColor: iconBg,
                    categoryColor: tx.category_color,
                    categoryIcon: tx.category_icon,
                    categoryName: tx.category_name,
                  }}
                  onPress={() => router.push(`/transaction/${tx.id}`)}
                />
              );
            })}
          </View>
        ) : (
          <View className="bg-slate-50/70 rounded-2xl p-5 items-center justify-center border border-slate-100 border-dashed mb-6">
            <Ionicons name="receipt-outline" size={24} color="#94A3B8" className="mb-1" />
            <Text className="text-slate-400 text-xs font-medium text-center mb-2">No transactions recorded yet.</Text>
            <TouchableOpacity onPress={() => router.push('/add')} activeOpacity={0.7}>
              <Text className="text-[#159A1D] font-bold text-xs">Add Transaction</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 6. BUDGET & SPENDING HEALTH */}
        <BudgetHealthCard
          budgets={dashboard?.budgets}
          budgetHealth={dashboard?.budgetHealth}
          onManagePress={() => router.push('/categories')}
        />

      </ScrollView>
    </View>
  );
}
