import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList, Text, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import SubscriptionCard from '../components/cards/SubscriptionCard';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { useSubscriptionsInfinite, useDeleteSubscription } from '../api/subscriptions';
import { router } from 'expo-router';

export default function SubscriptionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    data, 
    isLoading, 
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useSubscriptionsInfinite();
  
  const deleteSub = useDeleteSubscription();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const filteredSubscriptions = useMemo(() => {
    const allSubs = data?.pages.flatMap(page => page.data) || [];
    if (!searchQuery) return allSubs;
    return allSubs.filter(sub => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const openAddScreen = () => {
    router.push('/add-subscription');
  };

  const openEditScreen = (sub: any) => {
    router.push({
      pathname: '/add-subscription',
      params: {
        id: sub.id,
        name: sub.name,
        amount: sub.amount.toString(),
        billingCycle: sub.billing_cycle,
        startDate: sub.start_date ? sub.start_date.split('T')[0] : '',
        categoryId: sub.category_id || ''
      }
    });
  };

  const handleDelete = (id: number, subName: string) => {
    Alert.alert('Delete', `Are you sure you want to cancel ${subName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSub.mutate(id) }
    ]);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isError) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-red-500">Failed to load subscriptions.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header title="Subscriptions" showBack={true} />

      {/* Search Bar */}
      <View className="px-5 pt-4 pb-2">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search subscriptions..." 
        />
      </View>

      {/* Subscriptions List */}
      {isLoading && !isRefetching ? (
        <View className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#6BCB77" />
        </View>
      ) : (
        <FlatList
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: sub }) => (
            <SubscriptionCard 
              subscription={{
                id: sub.id.toString(),
                name: sub.name,
                price: parseFloat(sub.amount.toString()),
                billingCycle: sub.billing_cycle,
                iconName: sub.category_icon || 'play-circle',
                iconBgColor: sub.category_color ? `${sub.category_color}20` : 'bg-primary/20',
                iconColor: sub.category_color || '#6BCB77',
                nextBillingDate: sub.next_billing_date.split('T')[0]
              }} 
              showActions={true}
              onEdit={() => openEditScreen(sub)}
              onCancel={() => handleDelete(sub.id, sub.name)}
              onDetails={() => router.push(`/subscription/${sub.id}`)}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator color="#6BCB77" className="my-4" /> : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Ionicons name="search-outline" size={64} color="#CBD5E1" />
              <Text className="text-textMuted font-medium mt-4 text-center">
                {searchQuery ? `No subscriptions found matching "${searchQuery}"` : "No active subscriptions. Add your first one!"}
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

      {/* Floating Add Button */}
      <FloatingActionButton 
        label="Add Subscription" 
        onPress={openAddScreen} 
      />
    </View>
  );
}
