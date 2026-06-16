import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import BillCard from '../components/cards/BillCard';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { Bill } from '../types';

const DUMMY_BILLS: Bill[] = [
  {
    id: '1',
    name: 'Electricity Bill',
    amount: 145.20,
    dueDate: 'Oct 28',
    status: 'upcoming',
    iconName: 'flash',
    iconBgColor: 'bg-orange-500'
  },
  {
    id: '2',
    name: 'Internet (Comcast)',
    amount: 89.99,
    dueDate: 'Oct 30',
    status: 'upcoming',
    iconName: 'wifi',
    iconBgColor: 'bg-blue-500'
  },
  {
    id: '3',
    name: 'Car Insurance',
    amount: 210.00,
    dueDate: 'Nov 05',
    status: 'upcoming',
    iconName: 'car',
    iconBgColor: 'bg-red-600'
  },
  {
    id: '4',
    name: 'Water Utility',
    amount: 45.50,
    dueDate: 'Nov 12',
    status: 'upcoming',
    iconName: 'water',
    iconBgColor: 'bg-cyan-500'
  },
  {
    id: '5',
    name: 'Mortgage Payment',
    amount: 1850.00,
    dueDate: 'Nov 15',
    status: 'upcoming',
    iconName: 'home',
    iconBgColor: 'bg-emerald-600'
  },
  {
    id: '6',
    name: 'Phone Bill (AT&T)',
    amount: 120.00,
    dueDate: 'Oct 05',
    status: 'paid',
    iconName: 'call',
    iconBgColor: 'bg-indigo-500'
  },
  {
    id: '7',
    name: 'Gas Bill',
    amount: 65.40,
    dueDate: 'Oct 10',
    status: 'paid',
    iconName: 'flame',
    iconBgColor: 'bg-orange-700'
  },
  {
    id: '8',
    name: 'Gym Membership',
    amount: 45.00,
    dueDate: 'Oct 15',
    status: 'paid',
    iconName: 'barbell',
    iconBgColor: 'bg-slate-800'
  }
];

export default function BillsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter bills based on search query
  const filteredBills = DUMMY_BILLS.filter(bill => 
    bill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const upcomingBills = filteredBills.filter(b => b.status === 'upcoming');
  const paidBills = filteredBills.filter(b => b.status === 'paid');

  return (
    <View className="flex-1 bg-white">
      <Header title="Bills & Reminders" showBack={true} />

      {/* Search Bar */}
      <View className="px-5 pt-4 pb-2">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search bills..." 
        />
      </View>

      {/* Bills List */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        {filteredBills.length > 0 ? (
          <>
            {/* Upcoming Section */}
            {upcomingBills.length > 0 && (
              <View className="mt-4">
                <Text className="text-sm font-extrabold text-text mb-2">Upcoming Bills</Text>
                {upcomingBills.map(bill => (
                  <BillCard key={bill.id} bill={bill} />
                ))}
              </View>
            )}

            {/* Paid Section */}
            {paidBills.length > 0 && (
              <View className="mt-8">
                <Text className="text-sm font-extrabold text-text mb-2">Paid This Month</Text>
                {paidBills.map(bill => (
                  <BillCard key={bill.id} bill={bill} />
                ))}
              </View>
            )}
          </>
        ) : (
          <View className="flex-1 items-center justify-center mt-20">
            <Ionicons name="search-outline" size={64} color="#CBD5E1" />
            <Text className="text-textMuted font-medium mt-4 text-center">
              No bills found matching "{searchQuery}"
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingActionButton 
        label="Add Bill" 
        onPress={() => console.log('Add Bill')} 
      />
    </View>
  );
}
