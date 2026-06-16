import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import { Transaction } from '../../types';

// Mock DB of transactions
const ALL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Grocery Store', subtitle: 'Cash Wallet', amount: -68.50, type: 'expense', date: '2023-10-27', iconName: 'cart', iconBgColor: 'bg-red-500' },
  { id: '2', title: 'Salary', subtitle: 'Main Account', amount: 3200.00, type: 'income', date: '2023-10-27', iconName: 'wallet', iconBgColor: 'bg-primary' },
  { id: '3', title: 'Coffee', subtitle: 'Cash Wallet', amount: -4.50, type: 'expense', date: '2023-10-27', iconName: 'cafe', iconBgColor: 'bg-orange-800' },
  { id: '4', title: 'Freelance Payment', subtitle: 'Main Account', amount: 600.00, type: 'income', date: '2023-10-26', iconName: 'briefcase', iconBgColor: 'bg-blue-500' },
  { id: '5', title: 'Electricity Bill', subtitle: 'Main Account', amount: -120.00, type: 'expense', date: '2023-10-26', iconName: 'flash', iconBgColor: 'bg-orange-500' },
  { id: 'tx1', title: 'Groceries', subtitle: 'Whole Foods Market', amount: -120.50, type: 'expense', date: 'Today', iconName: 'cart', iconBgColor: 'bg-orange-500'},
  { id: 'tx2', title: 'Salary Deposit', subtitle: 'Tech Corp Inc.', amount: 4500.00, type: 'income', date: 'Yesterday', iconName: 'cash', iconBgColor: 'bg-emerald-500'},
  { id: 'tx3', title: 'Coffee Shop', subtitle: 'Starbucks', amount: -6.40, type: 'expense', date: 'Oct 12, 2023', iconName: 'cafe', iconBgColor: 'bg-amber-700'}
];

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const transaction = ALL_TRANSACTIONS.find(t => t.id === id) || ALL_TRANSACTIONS[0];

  const isExpense = transaction.type === 'expense';
  const amountStr = `${isExpense ? '-' : '+'}$${Math.abs(transaction.amount).toFixed(2)}`;
  const amountColor = isExpense ? 'text-red-500' : 'text-primary';

  // Dummy Extended Data mimicking the Add screen
  const description = 'Paid via contactless. This was a necessary transaction covering essential supplies for the upcoming week.';
  const time = '14:35 PM';
  
  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Transaction Details" showBack={true} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Top Header - Amount & Title */}
        <View className="items-center bg-white rounded-3xl p-8 mb-6 shadow-sm shadow-slate-100 border border-slate-100">
          <View className={`w-20 h-20 rounded-3xl items-center justify-center mb-4 shadow-sm shadow-slate-300 ${transaction.iconBgColor}`}>
            <Ionicons name={transaction.iconName as any} size={40} color="#FFF" />
          </View>
          <Text className="text-xl font-bold text-slate-500 mb-1">{transaction.title}</Text>
          <Text className={`text-4xl font-extrabold mt-1 ${amountColor}`}>
            {amountStr}
          </Text>
          <View className={`mt-3 px-3 py-1 rounded-full ${isExpense ? 'bg-red-50' : 'bg-green-50'}`}>
            <Text className={`text-xs font-bold uppercase tracking-wider ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
              {transaction.type}
            </Text>
          </View>
        </View>

        {/* Detailed Information Grid */}
        <Text className="text-base font-extrabold text-slate-800 mb-4 ml-1">Details</Text>
        <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm shadow-slate-100 border border-slate-100">
          
          <View className="flex-row justify-between items-center py-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Date</Text>
            </View>
            <Text className="text-sm font-extrabold text-slate-800">{transaction.date}</Text>
          </View>

          <View className="flex-row justify-between items-center py-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                <Ionicons name="time-outline" size={16} color="#64748B" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Time</Text>
            </View>
            <Text className="text-sm font-extrabold text-slate-800">{time}</Text>
          </View>

          <View className="flex-row justify-between items-center py-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                <Ionicons name="folder-outline" size={16} color="#64748B" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Category</Text>
            </View>
            <Text className="text-sm font-extrabold text-slate-800">{transaction.subtitle}</Text>
          </View>

          <View className="py-4">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                <Ionicons name="document-text-outline" size={16} color="#64748B" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Description</Text>
            </View>
            <Text className="text-sm font-medium text-slate-800 leading-6 pl-11">{description}</Text>
          </View>

        </View>

        {/* Receipt Section */}
        <Text className="text-base font-extrabold text-slate-800 mb-4 ml-1">Receipt</Text>
        <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm shadow-slate-100 border border-slate-100 items-center justify-center h-40 border-dashed border-2 border-slate-200">
          <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mb-2">
            <Ionicons name="image-outline" size={24} color="#94A3B8" />
          </View>
          <Text className="text-sm font-bold text-slate-500">No receipt attached</Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between">
          <TouchableOpacity className="flex-1 bg-white border border-slate-200 rounded-2xl py-4 items-center mr-2 shadow-sm shadow-slate-100">
            <Text className="text-slate-700 font-bold text-base">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-red-50 border border-red-100 rounded-2xl py-4 items-center ml-2 shadow-sm shadow-red-100">
            <Text className="text-red-600 font-bold text-base">Delete</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
