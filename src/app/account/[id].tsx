import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Header from '../../components/common/Header';
import TransactionCard from '../../components/cards/TransactionCard';
import { Account, Transaction } from '../../types';

import { useAccounts } from '../../api/accounts';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data: accounts } = useAccounts();
  const account = accounts?.find(a => a.id.toString() === id);

  if (!account) return null;

  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // DatePicker State
  const [isDownloadModalVisible, setDownloadModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const openDownloadModal = () => {
    setStartDate(null);
    setEndDate(null);
    setDownloadModalVisible(true);
  };

  const handleFinalDownload = () => {
    if (!startDate || !endDate) {
      Alert.alert('Missing Dates', 'Please select both a start and end date.');
      return;
    }
    setDownloadModalVisible(false);
    setTimeout(() => {
      Alert.alert(
        'Download Started', 
        `Exporting ${account.name} transactions from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} as PDF.`
      );
    }, 500);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS until confirmed, close on Android
    
    if (event.type === 'dismissed' || !selectedDate) {
      setShowDatePicker(false);
      return;
    }

    if (datePickerMode === 'start') {
      setStartDate(selectedDate);
    } else {
      setEndDate(selectedDate);
    }
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  // Mock Transactions
  const pastTransactions: Transaction[] = [
    {
      id: 'tx1',
      title: 'Groceries',
      subtitle: 'Whole Foods Market',
      amount: -120.50,
      type: 'expense',
      date: 'Today',
      iconName: 'cart',
      iconBgColor: 'bg-orange-500'
    },
    {
      id: 'tx2',
      title: 'Salary Deposit',
      subtitle: 'Tech Corp Inc.',
      amount: 4500.00,
      type: 'income',
      date: 'Yesterday',
      iconName: 'cash',
      iconBgColor: 'bg-emerald-500'
    },
    {
      id: 'tx3',
      title: 'Coffee Shop',
      subtitle: 'Starbucks',
      amount: -6.40,
      type: 'expense',
      date: 'Oct 12, 2023',
      iconName: 'cafe',
      iconBgColor: 'bg-amber-700'
    }
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Account Details" showBack={true} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Top Banner / Logo */}
        <View className="items-center bg-white rounded-3xl p-8 mb-6 shadow-sm shadow-slate-100 border border-slate-100 relative">
          
          {/* Action Buttons (Eye & Refresh) top right of card */}
          <View className="absolute top-4 right-4 flex-row">
            <TouchableOpacity 
              onPress={() => setIsBalanceVisible(!isBalanceVisible)}
              className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 mr-2 border border-slate-100"
            >
              <Ionicons name={isBalanceVisible ? "eye-off" : "eye"} size={20} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleRefresh}
              disabled={isRefreshing}
              className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100"
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#64748B" />
              ) : (
                <Ionicons name="refresh" size={20} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>

          {(() => {
            const last4 = account.account_number ? account.account_number.slice(-4) : '****';
            let logoName: any = 'business';
            let logoBgColor = 'bg-blue-700';

            if (account.type === 'card') {
              logoName = 'card';
              logoBgColor = 'bg-slate-800';
            } else if (account.type === 'wallet') {
              logoName = 'wallet';
              logoBgColor = 'bg-emerald-600';
            }

            return (
              <>
                <View className={`w-20 h-20 rounded-3xl items-center justify-center mb-4 shadow-sm shadow-slate-300 mt-6 ${logoBgColor}`}>
                  <Ionicons name={logoName} size={40} color="#FFF" />
                </View>
                <Text className="text-2xl font-extrabold text-slate-800 mb-1 text-center">{account.name}</Text>
                <Text className="text-sm font-medium text-slate-400 tracking-[0.2em] mb-4">**** **** **** {last4}</Text>
              </>
            );
          })()}
          
          {/* Balance */}
          {isBalanceVisible ? (
            <Text className="text-4xl font-extrabold text-primary">
              $0.00
            </Text>
          ) : (
            <Text className="text-4xl font-extrabold text-slate-400 tracking-widest">
              $***.**
            </Text>
          )}
        </View>

        {/* Download Statement Button */}
        <TouchableOpacity 
          onPress={openDownloadModal}
          activeOpacity={0.8}
          className="flex-row items-center justify-center bg-slate-800 rounded-2xl py-4 mb-8 shadow-sm shadow-slate-800/30"
        >
          <Ionicons name="download-outline" size={20} color="#FFF" className="mr-2" />
          <Text className="text-white font-bold text-base ml-2">Download Statement</Text>
        </TouchableOpacity>

        {/* Transaction History */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-base font-extrabold text-slate-800">Recent Transactions</Text>
          <TouchableOpacity className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center">
            <Ionicons name="sync" size={14} color="#6BCB77" />
            <Text className="text-primary font-bold text-xs ml-1">Fetch (30 Days)</Text>
          </TouchableOpacity>
        </View>
        
        <View className="bg-white rounded-3xl p-8 items-center justify-center shadow-sm shadow-slate-100 border border-slate-200 border-dashed">
          <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
          <Text className="text-slate-400 font-medium text-center mt-3">No transactions synced yet.</Text>
          <Text className="text-slate-400 text-xs text-center mt-1">Tap fetch to sync recent history.</Text>
        </View>

      </ScrollView>

      {/* Download Configuration Modal Overlay */}
      {isDownloadModalVisible && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 z-50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 pb-10 px-5">
            <View className="flex-row items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <Text className="text-xl font-extrabold text-slate-800">Export Statement</Text>
              <TouchableOpacity onPress={() => setDownloadModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider ml-1">Start Date</Text>
            <TouchableOpacity 
              onPress={() => { setDatePickerMode('start'); setShowDatePicker(true); }}
              className="flex-row items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4"
            >
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#3B82F6" className="mr-3" />
                <Text className={`text-base font-bold ml-2 ${startDate ? 'text-slate-800' : 'text-slate-400'}`}>
                  {startDate ? startDate.toLocaleDateString() : 'Select Start Date'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <Text className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider ml-1">End Date</Text>
            <TouchableOpacity 
              onPress={() => { setDatePickerMode('end'); setShowDatePicker(true); }}
              className="flex-row items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8"
            >
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#EF4444" className="mr-3" />
                <Text className={`text-base font-bold ml-2 ${endDate ? 'text-slate-800' : 'text-slate-400'}`}>
                  {endDate ? endDate.toLocaleDateString() : 'Select End Date'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleFinalDownload}
              activeOpacity={0.8}
              className={`rounded-full py-4 items-center shadow-sm ${startDate && endDate ? 'bg-primary shadow-primary/30' : 'bg-slate-200'}`}
              disabled={!startDate || !endDate}
            >
              <Text className={`font-extrabold text-lg tracking-wide ${startDate && endDate ? 'text-white' : 'text-slate-400'}`}>
                Download Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date Picker Overlay */}
      {showDatePicker && (
        <View className={Platform.OS === 'ios' ? "absolute bottom-0 left-0 right-0 bg-white p-5 rounded-t-3xl shadow-xl z-[60] border-t border-slate-200" : ""}>
          {Platform.OS === 'ios' && (
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-slate-800">
                Select {datePickerMode === 'start' ? 'Start' : 'End'} Date
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text className="text-primary font-bold">Done</Text>
              </TouchableOpacity>
            </View>
          )}
          <DateTimePicker
            value={datePickerMode === 'start' ? (startDate || new Date()) : (endDate || new Date())}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        </View>
      )}

    </View>
  );
}
