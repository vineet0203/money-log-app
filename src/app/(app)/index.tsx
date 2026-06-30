import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useSubscriptions } from '../../api/subscriptions';
import { useAccounts } from '../../api/accounts';
import { useTransactionStats } from '../../api/transactions';
import WelcomeCard from '../../components/homescreen/WelcomeCard';
import StatsCard from '../../components/homescreen/StatsCard';
import SubscriptionCard from '../../components/cards/SubscriptionCard';
import AccountCard from '../../components/cards/AccountCard';
import BillCard from '../../components/cards/BillCard';

export default function Home() {
  const { user, phoneNumber } = useAuthStore();
  const router = useRouter();
  
  // Fetch data
  const { data: subscriptions, isLoading: isLoadingSubs, refetch: refetchSubs } = useSubscriptions({ limit: 3 });
  const { data: accounts, isLoading: isLoadingAccounts, refetch: refetchAccounts } = useAccounts();
  const { data: upcomingBills, isLoading: isLoadingBills, refetch: refetchBills } = useSubscriptions({ upcomingDays: 15, limit: 3 });
  const { data: stats, refetch: refetchStats } = useTransactionStats();

  useFocusEffect(
    useCallback(() => {
      refetchAccounts();
      refetchBills();
      refetchStats();
    }, [refetchAccounts, refetchBills, refetchStats])
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchSubs(),
      refetchAccounts(),
      refetchBills(),
      refetchStats()
    ]);
    setRefreshing(false);
  }, [refetchSubs, refetchAccounts, refetchBills, refetchStats]);

  const displayName = user?.name || "User";

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6BCB77']}
          />
        }
      >
        <WelcomeCard name={displayName} />
        
        <StatsCard 
          balance={stats?.balance || 0} 
          income={stats?.income || 0} 
          expense={stats?.expense || 0} 
        />

        {/* Subscriptions Section Header */}
        <View className="flex-row justify-between items-end mt-6 mb-3">
          <Text className="text-lg font-extrabold text-text">Active Subscriptions</Text>
          <TouchableOpacity onPress={() => router.push('/subscriptions')}>
            <Text className="text-primary font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {/* Subscriptions List (Top 3) */}
        {isLoadingSubs ? (
          <ActivityIndicator color="#6BCB77" className="my-4" />
        ) : subscriptions && subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <SubscriptionCard 
              key={sub.id} 
              subscription={{
                id: sub.id.toString(),
                name: sub.name,
                price: parseFloat(sub.amount.toString()),
                billingCycle: sub.billing_cycle,
                iconName: 'play-circle',
                iconBgColor: 'bg-primary/20',
                nextBillingDate: sub.next_billing_date.split('T')[0]
              }} 
              showActions={false}
              onPress={() => router.push(`/subscription/${sub.id}`)}
            />
          ))
        ) : (
          <View className="bg-gray-50 rounded-xl p-6 items-center justify-center border border-gray-100 border-dashed mt-2">
            <Text className="text-gray-400 text-center mb-2">No active subscriptions yet.</Text>
            <TouchableOpacity onPress={() => router.push('/subscriptions')}>
              <Text className="text-primary font-bold">Add Subscription</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* My Accounts Section */}
        <View className="flex-row justify-between items-end mt-6 mb-3">
          <Text className="text-lg font-extrabold text-text">My Accounts</Text>
          <TouchableOpacity onPress={() => router.push('/accounts')}>
            <Text className="text-primary font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingAccounts ? (
          <ActivityIndicator color="#6BCB77" className="my-4" />
        ) : accounts && accounts.length > 0 ? (
          accounts.slice(0, 3).map(account => (
            <AccountCard 
              key={account.id} 
              account={account} 
              showActions={false}
              onPress={(acc) => router.push(`/account/${acc.id}`)}
            />
          ))
        ) : (
          <View className="bg-gray-50 rounded-xl p-6 items-center justify-center border border-gray-100 border-dashed mt-2">
            <Text className="text-gray-400 text-center mb-2">No accounts added yet.</Text>
            <TouchableOpacity onPress={() => router.push('/accounts')}>
              <Text className="text-primary font-bold">Add Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Bills Section */}
        <View className="flex-row justify-between items-end mt-6 mb-3">
          <Text className="text-lg font-extrabold text-text">Upcoming Bills</Text>
          <TouchableOpacity onPress={() => router.push('/bills')}>
            <Text className="text-primary font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {isLoadingBills ? (
          <ActivityIndicator color="#6BCB77" className="my-4" />
        ) : upcomingBills && upcomingBills.length > 0 ? (
          upcomingBills.map(bill => (
            <BillCard 
              key={bill.id} 
              subscription={bill} 
              onPress={(b) => router.push(`/subscription/${b.id}`)} 
            />
          ))
        ) : (
          <View className="bg-gray-50 rounded-xl p-6 items-center justify-center border border-gray-100 border-dashed mt-2">
            <Text className="text-gray-400 text-center mb-2">No bills due in the next 15 days!</Text>
          </View>
        )}
        
      </ScrollView>
    </View>
  );
}
