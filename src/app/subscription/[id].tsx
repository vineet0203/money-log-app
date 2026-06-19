import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Subscription } from '../../types';
import CustomSwitch from '../../components/common/CustomSwitch';
import Header from '../../components/common/Header';
import TransactionCard from '../../components/cards/TransactionCard';

import { useSubscriptionDetails, useUpdateSubscription } from '../../api/subscriptions';
import { useCategories } from '../../api/categories';

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [isReminderOn, setIsReminderOn] = useState(false);
  const [reminderDays, setReminderDays] = useState(3);
  const [isSmsEnabled, setIsSmsEnabled] = useState(false);
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);

  const { data, isLoading, isError } = useSubscriptionDetails(id as string);
  const { data: categories } = useCategories();
  const updateSub = useUpdateSubscription();

  useEffect(() => {
    if (data?.subscription) {
      setIsReminderOn(!!data.subscription.is_reminder_on);
      setReminderDays(data.subscription.reminder_days || 3);
      setIsSmsEnabled(!!data.subscription.is_sms_enabled);
      setIsEmailEnabled(data.subscription.is_email_enabled !== undefined ? !!data.subscription.is_email_enabled : true);
    }
  }, [data?.subscription]);

  const handleToggleReminder = async (val: boolean) => {
    setIsReminderOn(val);
    await updateSub.mutateAsync({ id: Number(id), is_reminder_on: val });
  };

  const handleUpdateDays = async (newDays: number) => {
    setReminderDays(newDays);
    await updateSub.mutateAsync({ id: Number(id), reminder_days: newDays });
  };

  const handleToggleSms = async (val: boolean) => {
    setIsSmsEnabled(val);
    await updateSub.mutateAsync({ id: Number(id), is_sms_enabled: val });
  };

  const handleToggleEmail = async (val: boolean) => {
    setIsEmailEnabled(val);
    await updateSub.mutateAsync({ id: Number(id), is_email_enabled: val });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isError || !data?.subscription) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-red-500">Failed to load details.</Text>
      </View>
    );
  }

  const subscription = data.subscription;
  const transactions = data.transactions || [];

  const startedDate = subscription.start_date.split('T')[0];
  const nextBillingDate = subscription.next_billing_date.split('T')[0];
  const source = subscription.source || 'Manual Added';

  const category = categories?.find(c => parseInt(c.id.toString()) === subscription.category_id);
  const categoryName = category ? category.name : 'Uncategorized';

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Subscription Details" showBack={true} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Top Banner / Logo */}
        <View className="items-center bg-white rounded-3xl p-8 mb-6 shadow-sm shadow-slate-100 border border-slate-100">
          <View className={`w-20 h-20 rounded-3xl items-center justify-center mb-4 shadow-sm shadow-slate-300 bg-primary/20`}>
            <Ionicons name="play-circle" size={40} color="#6BCB77" />
          </View>
          <Text className="text-2xl font-extrabold text-slate-800 mb-1">{subscription.name}</Text>
          <Text className="text-3xl font-extrabold text-slate-800 mt-2">
            ${parseFloat(subscription.amount).toFixed(2)}<Text className="text-lg text-slate-400 font-bold">{subscription.billing_cycle === 'monthly' ? '/mo' : '/yr'}</Text>
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
            <Text className="text-sm font-extrabold text-slate-800">{nextBillingDate}</Text>
          </View>

          <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-3">
                <Ionicons name="repeat-outline" size={16} color="#10B981" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Billing Cycle</Text>
            </View>
            <Text className="text-sm font-extrabold text-slate-800 capitalize">{subscription.billing_cycle}</Text>
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

          <View className="flex-row justify-between items-center py-3 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center mr-3">
                <Ionicons name="folder-open-outline" size={16} color="#6366F1" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Category</Text>
            </View>
            <Text className="text-sm font-extrabold text-slate-800">{categoryName}</Text>
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
              onValueChange={handleToggleReminder} 
            />
          </View>

          {/* Configuration inline UI */}
          {isReminderOn && (
            <View className="py-4 bg-slate-50 rounded-2xl px-5 mt-2 border border-slate-100">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-sm font-bold text-slate-700">Days Before Expiry</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity 
                    onPress={() => handleUpdateDays(Math.max(1, reminderDays - 1))} 
                    className="w-8 h-8 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm"
                  >
                    <Ionicons name="remove" size={16} color="#0F172A" />
                  </TouchableOpacity>
                  <Text className="text-base font-extrabold mx-4 w-6 text-center text-slate-800">{reminderDays}</Text>
                  <TouchableOpacity 
                    onPress={() => handleUpdateDays(Math.min(30, reminderDays + 1))} 
                    className="w-8 h-8 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm"
                  >
                    <Ionicons name="add" size={16} color="#0F172A" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row justify-between items-center mb-3 border-t border-slate-200/60 pt-3">
                <View className="flex-row items-center">
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#64748B" className="mr-2" />
                  <Text className="text-sm font-bold text-slate-700">SMS Notification</Text>
                </View>
                <CustomSwitch 
                  value={isSmsEnabled} 
                  onValueChange={handleToggleSms} 
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              </View>
              
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons name="mail-outline" size={16} color="#64748B" className="mr-2" />
                  <Text className="text-sm font-bold text-slate-700">Email Notification</Text>
                </View>
                <CustomSwitch 
                  value={isEmailEnabled} 
                  onValueChange={handleToggleEmail} 
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              </View>
            </View>
          )}

        </View>

        {/* Pay Button */}
        <TouchableOpacity 
          onPress={() => {
            router.push({
              pathname: '/add',
              params: {
                subscription_id: subscription.id,
                title: subscription.name,
                amount: subscription.amount.toString(),
                category_id: subscription.category_id || '',
                is_subscription_pay: 'true'
              }
            });
          }}
          activeOpacity={0.8}
          className="bg-primary rounded-full py-4 items-center shadow-sm shadow-primary/30 mb-8 mx-1"
        >
          <Text className="text-white font-extrabold text-lg tracking-wide">Pay Now</Text>
        </TouchableOpacity>

        {/* Transaction History */}
        <Text className="text-base font-extrabold text-slate-800 mb-4 ml-1">Payment History</Text>
        <View className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-100 border border-slate-100">
          {transactions.length === 0 ? (
            <Text className="text-slate-500 text-center py-4">No transactions yet.</Text>
          ) : (
            transactions.map((tx: any) => (
              <TransactionCard 
                key={tx.id} 
                transaction={{
                  id: tx.id.toString(),
                  title: tx.title,
                  subtitle: tx.subtitle,
                  amount: parseFloat(tx.amount),
                  type: tx.type,
                  date: tx.date.split('T')[0],
                  iconName: 'play-circle',
                  iconBgColor: 'bg-primary/20'
                }} 
              />
            ))
          )}
        </View>

      </ScrollView>

      {/* Floating Edit Button (Bottom Left) */}
      <TouchableOpacity 
        onPress={() => {
          router.push({
            pathname: '/edit-subscription',
            params: {
              id: subscription.id,
              name: subscription.name,
              amount: subscription.amount.toString(),
              billingCycle: subscription.billing_cycle,
              startDate: subscription.start_date.split('T')[0],
              categoryId: subscription.category_id || ''
            }
          });
        }}
        activeOpacity={0.8}
        className="absolute bottom-6 left-6 w-14 h-14 bg-slate-800 rounded-full items-center justify-center shadow-lg shadow-slate-800/40"
      >
        <Ionicons name="pencil" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}
