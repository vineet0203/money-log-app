import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Alert, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import AccountCard from '../components/cards/AccountCard';
import { useAccountsInfinite, useDeleteAccount, useSyncAllTransactions } from '../api/accounts';
import { usePlaidLink } from '../hooks/usePlaidLink';

export default function AccountsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // API hooks
  const { 
    data, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useAccountsInfinite();
  
  const deleteAccount = useDeleteAccount();
  const syncTransactions = useSyncAllTransactions();

  // Plaid Link
  const { openPlaidLink, isLoading: isPlaidLoading } = usePlaidLink();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Filter accounts based on search query
  const filteredAccounts = (data?.pages.flatMap(p => p.data) || []).filter(account => 
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (account.account_number && account.account_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = (account: any) => {
    Alert.alert(
      'Disconnect Bank Account',
      'This will disconnect this bank account from your app. You can reconnect it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: () => deleteAccount.mutate(account.id)
        }
      ]
    );
  };

  const handleSyncTransactions = () => {
    syncTransactions.mutate(undefined, {
      onSuccess: (data) => {
        Alert.alert(
          'Sync Complete',
          `Successfully synced transactions!\nAdded: ${data.stats.added}\nModified: ${data.stats.modified}\nRemoved: ${data.stats.removed}`
        );
      },
      onError: (error) => {
        Alert.alert('Sync Failed', 'Could not sync transactions. Please try again.');
        console.error(error);
      }
    });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Header title="My Accounts" showBack={true} />

      <View className="px-5 pt-4 pb-2">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search accounts..." 
        />
      </View>

      {/* Connect Bank Button */}
      <TouchableOpacity
        onPress={() => openPlaidLink()}
        disabled={isPlaidLoading}
        activeOpacity={0.8}
        className="mx-5 mb-3 mt-1 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex-row items-center"
      >
        <View className="w-11 h-11 rounded-xl bg-indigo-600 items-center justify-center mr-3">
          {isPlaidLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="link" size={22} color="#FFF" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-indigo-900 font-bold text-base">Connect Your Bank</Text>
          <Text className="text-indigo-500 text-xs mt-0.5">Securely link your bank account via Plaid</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6366F1" />
      </TouchableOpacity>

      {/* Sync All Transactions Button */}
      {filteredAccounts.some((acc: any) => acc.provider === 'plaid') && (
        <TouchableOpacity
          onPress={handleSyncTransactions}
          disabled={syncTransactions.isPending}
          activeOpacity={0.8}
          className="mx-5 mb-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex-row items-center"
        >
          <View className="w-11 h-11 rounded-xl bg-emerald-500 items-center justify-center mr-3">
            {syncTransactions.isPending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="sync" size={22} color="#FFF" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-emerald-900 font-bold text-base">Sync Transactions</Text>
            <Text className="text-emerald-600 text-xs mt-0.5">Fetch latest history for all accounts</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#10B981" />
        </TouchableOpacity>
      )}

      {isLoading && !isRefetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6BCB77" size="large" />
        </View>
      ) : (
        <FlatList
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}
          data={filteredAccounts}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: account }) => (
            <AccountCard 
              account={account} 
              isLoading={isPlaidLoading}
              onDetails={(acc) => router.push(`/account/${acc.id}`)}
              onCancel={(acc) => handleDelete(acc)}
              onReconnect={(itemId) => openPlaidLink(itemId)}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator color="#6BCB77" className="my-4" /> : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Ionicons name="wallet-outline" size={64} color="#CBD5E1" />
              <Text className="text-gray-400 font-medium mt-4 text-center">
                {searchQuery ? `No accounts found matching "${searchQuery}"` : "You haven't added any accounts yet."}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={['#6BCB77']}
            />
          }
        />
      )}
    </View>
  );
}
