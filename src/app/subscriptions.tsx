import React, { useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import SubscriptionCard from '../components/cards/SubscriptionCard';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { useSubscriptions, useDeleteSubscription } from '../api/subscriptions';
import { router } from 'expo-router';

export default function SubscriptionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: subscriptions, isLoading, isError } = useSubscriptions();
  const deleteSub = useDeleteSubscription();

  // Filter subscriptions based on search query
  const filteredSubscriptions = subscriptions?.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6BCB77" />
      </View>
    );
  }

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
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map(sub => (
            <SubscriptionCard 
              key={sub.id}
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
          ))
        ) : (
          <View className="flex-1 items-center justify-center mt-20">
            <Ionicons name="search-outline" size={64} color="#CBD5E1" />
            <Text className="text-textMuted font-medium mt-4 text-center">
              {searchQuery ? `No subscriptions found matching "${searchQuery}"` : "No active subscriptions. Add your first one!"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingActionButton 
        label="Add Subscription" 
        onPress={openAddScreen} 
      />
    </View>
  );
}
