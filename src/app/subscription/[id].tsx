import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Subscription } from '../../types';
import CustomSwitch from '../../components/common/CustomSwitch';
import Header from '../../components/common/Header';
import TransactionCard from '../../components/cards/TransactionCard';

// Dummy data matching subscriptions.tsx
const DUMMY_SUBSCRIPTIONS: Subscription[] = [
  { id: '1', name: 'Netflix', price: 15.99, billingCycle: 'monthly', iconName: 'play', iconBgColor: 'bg-red-600', nextBillingDate: 'Nov 12' },
  { id: '2', name: 'Spotify', price: 9.99, billingCycle: 'monthly', iconName: 'musical-notes', iconBgColor: 'bg-green-500', nextBillingDate: 'Nov 15' },
  { id: '3', name: 'Amazon Prime', price: 139.00, billingCycle: 'yearly', iconName: 'cart', iconBgColor: 'bg-blue-500', nextBillingDate: 'Jan 22, 2024' },
  { id: '4', name: 'Gym Membership', price: 45.00, billingCycle: 'monthly', iconName: 'barbell', iconBgColor: 'bg-slate-800', nextBillingDate: 'Nov 01' },
  { id: '5', name: 'iCloud Storage', price: 2.99, billingCycle: 'monthly', iconName: 'cloud', iconBgColor: 'bg-blue-400', nextBillingDate: 'Nov 05' },
  { id: '6', name: 'Adobe Creative Cloud', price: 54.99, billingCycle: 'monthly', iconName: 'color-palette', iconBgColor: 'bg-red-500', nextBillingDate: 'Nov 18' },
];

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [isReminderOn, setIsReminderOn] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  const [isDaily, setIsDaily] = useState(false);

  const subscription = DUMMY_SUBSCRIPTIONS.find(s => s.id === id) || DUMMY_SUBSCRIPTIONS[0];

  // Dummy Extended Data
  const startedDate = 'March 14, 2022';
  const source = 'Manual Added';

  // Dummy Transactions for this subscription
  const pastTransactions = [
    {
      id: 'tx1',
      title: subscription.name,
      subtitle: 'Auto-Payment',
      amount: -subscription.price,
      type: 'expense' as const,
      date: '2023-10-12',
      iconName: subscription.iconName,
      iconBgColor: subscription.iconBgColor
    },
    {
      id: 'tx2',
      title: subscription.name,
      subtitle: 'Auto-Payment',
      amount: -subscription.price,
      type: 'expense' as const,
      date: '2023-09-12',
      iconName: subscription.iconName,
      iconBgColor: subscription.iconBgColor
    },
    {
      id: 'tx3',
      title: subscription.name,
      subtitle: 'Auto-Payment',
      amount: -subscription.price,
      type: 'expense' as const,
      date: '2023-08-12',
      iconName: subscription.iconName,
      iconBgColor: subscription.iconBgColor
    }
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Subscription Details" showBack={true} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Top Banner / Logo */}
        <View className="items-center bg-white rounded-3xl p-8 mb-6 shadow-sm shadow-slate-100 border border-slate-100">
          <View className={`w-20 h-20 rounded-3xl items-center justify-center mb-4 shadow-sm shadow-slate-300 ${subscription.iconBgColor}`}>
            <Ionicons name={subscription.iconName as any} size={40} color="#FFF" />
          </View>
          <Text className="text-2xl font-extrabold text-slate-800 mb-1">{subscription.name}</Text>
          <Text className="text-3xl font-extrabold text-slate-800 mt-2">
            ${subscription.price.toFixed(2)}<Text className="text-lg text-slate-400 font-bold">{subscription.billingCycle === 'monthly' ? '/mo' : '/yr'}</Text>
          </Text>
        </View>

        {/* Info Grid */}
        <Text className="text-base font-extrabold text-slate-800 mb-4 ml-1">Overview</Text>
        <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm shadow-slate-100 border border-slate-100">
          
          <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Started Date</Text>
            </View>
            <Text className="text-sm font-extrabold text-slate-800">{startedDate}</Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mr-3">
                <Ionicons name="timer-outline" size={16} color="#F97316" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Next Bill</Text>
            </View>
            <Text className="text-sm font-extrabold text-slate-800">{subscription.nextBillingDate}</Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-3">
                <Ionicons name="repeat-outline" size={16} color="#10B981" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Billing Cycle</Text>
            </View>
            <Text className="text-sm font-extrabold text-slate-800 capitalize">{subscription.billingCycle}</Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center mr-3">
                <Ionicons name="create-outline" size={16} color="#A855F7" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Source</Text>
            </View>
            <Text className="text-sm font-extrabold text-slate-800">{source}</Text>
          </View>

          {/* Reminder Toggle */}
          <View className={`flex-row justify-between items-center py-3 ${isReminderOn ? '' : ''}`}>
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-yellow-50 items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={16} color="#EAB308" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Enable Reminders</Text>
            </View>
            <CustomSwitch 
              value={isReminderOn} 
              onValueChange={setIsReminderOn} 
            />
          </View>

          {/* Configuration inline UI */}
          {isReminderOn && (
            <View className="py-4 bg-slate-50 rounded-2xl px-5 mt-2 border border-slate-100">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-sm font-bold text-slate-700">Days Before Expiry</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    onPress={() => setReminderDays(Math.max(1, reminderDays - 1))} 
                    className="w-8 h-8 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm"
                  >
                    <Ionicons name="remove" size={16} color="#0F172A" />
                  </TouchableOpacity>
                  <Text className="text-base font-extrabold mx-4 w-6 text-center text-slate-800">{reminderDays}</Text>
                  <TouchableOpacity 
                    onPress={() => setReminderDays(Math.min(30, reminderDays + 1))} 
                    className="w-8 h-8 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm"
                  >
                    <Ionicons name="add" size={16} color="#0F172A" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-bold text-slate-700">Repeat Daily</Text>
                <CustomSwitch 
                  value={isDaily} 
                  onValueChange={setIsDaily} 
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              </View>
            </View>
          )}

        </View>

        {/* Pay Button */}
        <TouchableOpacity 
          onPress={() => Alert.alert('Pay', `Initiating payment of $${subscription.price.toFixed(2)} for ${subscription.name}...`)}
          activeOpacity={0.8}
          className="bg-primary rounded-full py-4 items-center shadow-sm shadow-primary/30 mb-8 mx-1"
        >
          <Text className="text-white font-extrabold text-lg tracking-wide">Pay Now</Text>
        </TouchableOpacity>

        {/* Transaction History */}
        <Text className="text-base font-extrabold text-slate-800 mb-4 ml-1">Payment History</Text>
        <View className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-100 border border-slate-100">
          {pastTransactions.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}
