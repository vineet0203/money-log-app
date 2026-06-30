import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import BillCard from '../components/cards/BillCard';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { useSubscriptions } from '../api/subscriptions';

export default function BillsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch upcoming bills (subscriptions due in next 15 days)
  const { data: upcomingBills, isLoading, refetch } = useSubscriptions({ upcomingDays: 15 });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Filter bills based on search query
  const filteredBills = upcomingBills?.filter(bill => 
    bill.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <View className="flex-1 bg-white">
      <Header title="Upcoming Bills" showBack={true} />

      {/* Search Bar */}
      <View className="px-5 pt-4 pb-2">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search upcoming bills..." 
        />
      </View>

      {/* Bills List */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6BCB77" colors={['#6BCB77']} />
        }
      >
        {isLoading && !refreshing ? (
          <ActivityIndicator color="#6BCB77" className="mt-10" />
        ) : filteredBills.length > 0 ? (
          <View className="mt-4">
            <Text className="text-sm font-extrabold text-slate-800 mb-2">Due in Next 15 Days</Text>
            {filteredBills.map(bill => (
              <BillCard 
                key={bill.id} 
                subscription={bill} 
                onPress={(b) => router.push(`/subscription/${b.id}`)}
              />
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center mt-20">
            <Ionicons name="search-outline" size={64} color="#CBD5E1" />
            <Text className="text-gray-400 font-medium mt-4 text-center">
              {searchQuery ? `No upcoming bills found matching "${searchQuery}"` : "You have no upcoming bills in the next 15 days!"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button (Routes to Add Subscription) */}
      <FloatingActionButton 
        label="Add Bill" 
        onPress={() => router.push('/subscriptions')} 
      />
    </View>
  );
}
