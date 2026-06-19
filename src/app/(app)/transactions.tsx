import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../../components/common/SearchBar';
import TransactionCard from '../../components/cards/TransactionCard';
import { useTransactions } from '../../api/transactions';
import { useCategories } from '../../api/categories';
import { Transaction as UITransaction } from '../../types';

const TABS = ['All', 'Income', 'Expense'];

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: transactions, isLoading: isTxLoading } = useTransactions();
  const { data: categories, isLoading: isCatLoading } = useCategories();

  // Filter Logic
  const filteredTransactions = (transactions || []).filter(t => {
    // Tab filter
    if (activeTab !== 'All' && t.type !== activeTab.toLowerCase()) {
      return false;
    }
    // Search filter
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Group by Date (Today vs Yesterday vs Older)
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const todayGroup: UITransaction[] = [];
  const yesterdayGroup: UITransaction[] = [];
  const olderGroup: UITransaction[] = [];

  filteredTransactions.forEach(t => {
    // Map DB transaction to UI Transaction
    const category = categories?.find(c => c.id === t.category_id);
    
    // Default styles for income/expense if no category
    let iconName = t.type === 'income' ? 'cash' : 'receipt';
    let iconBgColor = t.type === 'income' ? 'bg-green-500' : 'bg-slate-500';
    let subtitle = t.type === 'income' ? 'Income' : 'Expense';

    if (category) {
      iconName = category.iconName;
      // We stored tailwind color as string, or hex. Assuming tailwind for iconBgColor is expected.
      // We will construct it safely. The db stores hex color, so let's pass it via inline style in the card?
      // Wait, TransactionCard uses className={iconBgColor}, so we must adapt it. Let's look at TransactionCard.
      // Let's pass bg-blue-500 or something if category has it, else use inline style in TransactionCard later.
      subtitle = category.name;
    }

    const uiTx: UITransaction = {
      id: t.id.toString(),
      title: t.title,
      subtitle: subtitle,
      amount: parseFloat(t.amount.toString()),
      type: t.type,
      date: t.date.split('T')[0],
      iconName: iconName,
      iconBgColor: iconBgColor, // We'll patch TransactionCard to support custom hex bg
    };

    if (uiTx.date === todayStr) {
      todayGroup.push(uiTx);
    } else if (uiTx.date === yesterdayStr) {
      yesterdayGroup.push(uiTx);
    } else {
      olderGroup.push(uiTx);
    }
  });

  const isLoading = isTxLoading || isCatLoading;

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
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6BCB77" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Today Group */}
          {todayGroup.length > 0 && (
            <View className="mt-6 px-5">
              <Text className="text-sm font-extrabold text-text mb-2">Today</Text>
              {todayGroup.map(t => (
                <TransactionCard key={t.id} transaction={t} />
              ))}
            </View>
          )}

          {/* Yesterday Group */}
          {yesterdayGroup.length > 0 && (
            <View className="mt-6 px-5">
              <Text className="text-sm font-extrabold text-text mb-2">Yesterday</Text>
              {yesterdayGroup.map(t => (
                <TransactionCard key={t.id} transaction={t} />
              ))}
            </View>
          )}

          {/* Older Group */}
          {olderGroup.length > 0 && (
            <View className="mt-6 px-5">
              <Text className="text-sm font-extrabold text-text mb-2">Older</Text>
              {olderGroup.map(t => (
                <TransactionCard key={t.id} transaction={t} />
              ))}
            </View>
          )}

          {/* Empty State */}
          {todayGroup.length === 0 && yesterdayGroup.length === 0 && olderGroup.length === 0 && (
            <View className="flex-1 items-center justify-center mt-20">
              <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
              <Text className="text-textMuted font-medium mt-4">No transactions found</Text>
            </View>
          )}

        </ScrollView>
      )}
    </View>
  );
}
