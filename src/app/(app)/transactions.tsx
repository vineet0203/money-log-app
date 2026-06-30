import { View, Text, TouchableOpacity, ActivityIndicator, SectionList, RefreshControl } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../../components/common/SearchBar';
import TransactionCard from '../../components/cards/TransactionCard';
import { useTransactionsInfinite } from '../../api/transactions';
import { useCategories } from '../../api/categories';
import { Transaction as UITransaction } from '../../types';

const TABS = ['All', 'Income', 'Expense'];

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Use the backend filter directly
  const typeFilter = activeTab === 'All' ? 'all' : activeTab.toLowerCase();
  
  const { 
    data, 
    isLoading: isTxLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    refetch,
    isRefetching
  } = useTransactionsInfinite(typeFilter);
  
  const { data: categories, isLoading: isCatLoading, refetch: refetchCats } = useCategories();

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchCats();
    }, [refetch, refetchCats])
  );

  const sections = useMemo(() => {
    const allTransactions = data?.pages.flatMap(page => page.data) || [];
    
    // Filter by search query (client side)
    const filtered = allTransactions.filter(t => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayGroup: UITransaction[] = [];
    const yesterdayGroup: UITransaction[] = [];
    const olderGroup: UITransaction[] = [];

    filtered.forEach(t => {
      const category = categories?.find(c => c.id === t.category_id);
      
      let iconName = t.type === 'income' ? 'cash' : 'receipt';
      let iconBgColor = t.type === 'income' ? 'bg-green-500' : 'bg-slate-500';
      let subtitle = t.type === 'income' ? 'Income' : 'Expense';

      if (category) {
        iconName = category.iconName || category.icon_name;
        subtitle = category.name;
        // In reality, we'd apply category.color, but we stick to existing UI for now
      }

      const uiTx: UITransaction = {
        id: t.id.toString(),
        title: t.title,
        subtitle: subtitle,
        amount: parseFloat(t.amount.toString()),
        type: t.type,
        date: t.date.split('T')[0],
        iconName: iconName,
        iconBgColor: iconBgColor,
      };

      if (uiTx.date === todayStr) {
        todayGroup.push(uiTx);
      } else if (uiTx.date === yesterdayStr) {
        yesterdayGroup.push(uiTx);
      } else {
        olderGroup.push(uiTx);
      }
    });

    const result = [];
    if (todayGroup.length > 0) result.push({ title: 'Today', data: todayGroup });
    if (yesterdayGroup.length > 0) result.push({ title: 'Yesterday', data: yesterdayGroup });
    if (olderGroup.length > 0) result.push({ title: 'Older', data: olderGroup });
    
    return result;
  }, [data, categories, searchQuery]);

  const isLoading = isTxLoading || isCatLoading;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Top Search & Filter Bar */}
      <View className="flex-row items-center px-5 pt-4 pb-2">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search transactions" 
          style={{ flex: 1 }}
        />
      </View>

      {/* Tabs */}
      <View className="flex-row justify-between px-5 pt-4 pb-2 border-b border-slate-100">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              className="items-center justify-center pb-2 px-2"
            >
              <Text className={`font-bold text-sm ${isActive ? 'text-text' : 'text-textMuted'}`}>
                {tab}
              </Text>
              {isActive && (
                <View className="absolute bottom-[-2] w-6 h-[3px] bg-primary rounded-t-full" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Transaction List */}
      {isLoading && !isRefetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6BCB77" />
        </View>
      ) : (
        <SectionList
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <Text className="text-sm font-extrabold text-text mb-2 mt-4">{title}</Text>
          )}
          renderItem={({ item }) => (
            <TransactionCard transaction={item} />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color="#6BCB77" className="my-4" />
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
              <Text className="text-textMuted font-medium mt-4">No transactions found</Text>
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
