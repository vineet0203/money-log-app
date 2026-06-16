import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import AccountCard from '../components/cards/AccountCard';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { Account } from '../types';

const FULL_ACCOUNTS: Account[] = [
  {
    id: '1',
    name: 'Chase Checking',
    last4: '4589',
    balance: 5420.50,
    logoName: 'card',
    logoBgColor: 'bg-blue-700'
  },
  {
    id: '2',
    name: 'Wells Fargo Savings',
    last4: '1102',
    balance: 12500.00,
    logoName: 'business',
    logoBgColor: 'bg-red-700'
  },
  {
    id: '3',
    name: 'PayPal Wallet',
    last4: 'paypal',
    balance: 340.25,
    logoName: 'logo-paypal',
    logoBgColor: 'bg-sky-500'
  },
  {
    id: '4',
    name: 'Apple Card',
    last4: '9901',
    balance: -425.00,
    logoName: 'logo-apple',
    logoBgColor: 'bg-slate-800'
  },
  {
    id: '5',
    name: 'Robinhood Investing',
    last4: 'rob1',
    balance: 8950.40,
    logoName: 'trending-up',
    logoBgColor: 'bg-green-600'
  },
  {
    id: '6',
    name: 'Bank of America',
    last4: '2022',
    balance: 3150.00,
    logoName: 'cash',
    logoBgColor: 'bg-red-600'
  },
  {
    id: '7',
    name: 'Citi Credit Card',
    last4: '8841',
    balance: -1250.75,
    logoName: 'card',
    logoBgColor: 'bg-blue-500'
  },
  {
    id: '8',
    name: 'Discover Savings',
    last4: '9902',
    balance: 15400.00,
    logoName: 'wallet',
    logoBgColor: 'bg-orange-500'
  },
  {
    id: '9',
    name: 'American Express Gold',
    last4: '3001',
    balance: -210.50,
    logoName: 'card',
    logoBgColor: 'bg-slate-700'
  },
  {
    id: '10',
    name: 'Capital One Auto',
    last4: '5566',
    balance: -14200.00,
    logoName: 'car',
    logoBgColor: 'bg-red-800'
  },
  {
    id: '11',
    name: 'Fidelity 401k',
    last4: 'fid4',
    balance: 145000.00,
    logoName: 'pie-chart',
    logoBgColor: 'bg-emerald-700'
  },
  {
    id: '12',
    name: 'Vanguard Index',
    last4: 'van9',
    balance: 62450.00,
    logoName: 'bar-chart',
    logoBgColor: 'bg-red-900'
  },
  {
    id: '13',
    name: 'Cash App',
    last4: 'cash',
    balance: 85.00,
    logoName: 'logo-usd',
    logoBgColor: 'bg-green-500'
  },
  {
    id: '14',
    name: 'Venmo Balance',
    last4: 'venm',
    balance: 120.00,
    logoName: 'logo-venmo',
    logoBgColor: 'bg-blue-400'
  },
  {
    id: '15',
    name: 'Coinbase Crypto',
    last4: 'btc1',
    balance: 4500.00,
    logoName: 'logo-bitcoin',
    logoBgColor: 'bg-blue-600'
  }
];

export default function AccountsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Filter accounts based on search query
  const filteredAccounts = FULL_ACCOUNTS.filter(account => 
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    account.last4.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      <Header title="My Accounts" showBack={true} />

      {/* Search Bar */}
      <View className="px-5 pt-4 pb-2">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search accounts..." 
        />
      </View>

      {/* Accounts List */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        {filteredAccounts.length > 0 ? (
          filteredAccounts.map(account => (
            <AccountCard 
              key={account.id} 
              account={account} 
              onPress={(acc) => router.push(`/account/${acc.id}`)}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center mt-20">
            <Ionicons name="search-outline" size={64} color="#CBD5E1" />
            <Text className="text-textMuted font-medium mt-4 text-center">
              No accounts found matching "{searchQuery}"
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingActionButton 
        label="Add Account" 
        onPress={() => console.log('Add Account')} 
      />
    </View>
  );
}
