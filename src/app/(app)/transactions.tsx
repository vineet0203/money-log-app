import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../../components/common/SearchBar';
import TransactionCard from '../../components/cards/TransactionCard';
import { Transaction } from '../../types';

const TABS = ['All', 'Income', 'Expense'];

// Dummy Data
const TODAY_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    title: 'Grocery Store',
    subtitle: 'Cash Wallet',
    amount: -68.50,
    type: 'expense',
    date: '2023-10-27',
    iconName: 'cart',
    iconBgColor: 'bg-red-500'
  },
  {
    id: '2',
    title: 'Salary',
    subtitle: 'Main Account',
    amount: 3200.00,
    type: 'income',
    date: '2023-10-27',
    iconName: 'wallet',
    iconBgColor: 'bg-primary'
  },
  {
    id: '3',
    title: 'Coffee',
    subtitle: 'Cash Wallet',
    amount: -4.50,
    type: 'expense',
    date: '2023-10-27',
    iconName: 'cafe',
    iconBgColor: 'bg-orange-800'
  }
];

const YESTERDAY_TRANSACTIONS: Transaction[] = [
  {
    id: '4',
    title: 'Freelance Payment',
    subtitle: 'Main Account',
    amount: 600.00,
    type: 'income',
    date: '2023-10-26',
    iconName: 'briefcase',
    iconBgColor: 'bg-blue-500'
  },
  {
    id: '5',
    title: 'Electricity Bill',
    subtitle: 'Main Account',
    amount: -120.00,
    type: 'expense',
    date: '2023-10-26',
    iconName: 'flash',
    iconBgColor: 'bg-orange-500'
  }
];

export default function Transactions() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Logic
  const filterTransactions = (transactions: Transaction[]) => {
    return transactions.filter(t => {
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
  };

  const filteredToday = filterTransactions(TODAY_TRANSACTIONS);
  const filteredYesterday = filterTransactions(YESTERDAY_TRANSACTIONS);

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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Today Group */}
        {filteredToday.length > 0 && (
          <View className="mt-6 px-5">
            <Text className="text-sm font-extrabold text-text mb-2">Today</Text>
            {filteredToday.map(t => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
          </View>
        )}

        {/* Yesterday Group */}
        {filteredYesterday.length > 0 && (
          <View className="mt-6 px-5">
            <Text className="text-sm font-extrabold text-text mb-2">Yesterday</Text>
            {filteredYesterday.map(t => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {filteredToday.length === 0 && filteredYesterday.length === 0 && (
          <View className="flex-1 items-center justify-center mt-20">
            <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
            <Text className="text-textMuted font-medium mt-4">No transactions found</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
