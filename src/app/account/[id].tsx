import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Header from '../../components/common/Header';
import AccountBalanceChart from '../../components/charts/AccountBalanceChart';
import BankLogo from '../../components/common/BankLogo';
import TransactionCard from '../../components/cards/TransactionCard';
import { Account, Transaction } from '../../types';

import { useAccounts, useSyncBalance, useAccountTransactions } from '../../api/accounts';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: accounts } = useAccounts();
  const account = accounts?.find(a => a.id.toString() === id);
  const syncBalance = useSyncBalance();

  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // DatePicker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  React.useEffect(() => {
    if (!account) return;
    if (account.provider !== 'plaid') return;
    
    const calculateTimeLeft = () => {
      const dateString = account.last_balance_sync || account.updated_at || account.created_at;
      if (!dateString) return 0;
      
      const lastUpdated = new Date(dateString).getTime();
      const now = Date.now();
      const diffSeconds = Math.floor((now - lastUpdated) / 1000);
      const remaining = 90 - diffSeconds;
      return remaining > 0 ? remaining : 0;
    };

    setTimeLeft(calculateTimeLeft());
    
    let interval: NodeJS.Timeout;
    if (calculateTimeLeft() > 0) {
      interval = setInterval(() => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [account?.last_balance_sync, account?.updated_at, account?.created_at, account?.provider]);

  const { data: transactionsData, isLoading: isLoadingTxns, hasNextPage, fetchNextPage, isFetchingNextPage } = useAccountTransactions(account?.id || 0);
  const transactions = transactionsData?.pages.flatMap(p => p.data) || [];

  if (!account) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncBalance.mutateAsync(account.id);
    } catch (err: any) {
      console.error('Failed to sync balance:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch latest balance from bank.';
      Alert.alert('Refresh Error', errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    
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

  // Plaid Data Extraction
  let plaidData: any = {};
  if (typeof account.plaid_raw_data === 'string') {
    try {
      plaidData = JSON.parse(account.plaid_raw_data);
    } catch(e) {}
  } else if (account.plaid_raw_data) {
    plaidData = account.plaid_raw_data;
  }
  
  const balances = plaidData.balances || {};
  
  // Use native SQL columns if available, otherwise fallback to parsing JSON
  const availableBalance = account.available_balance !== undefined ? account.available_balance : balances.available;
  const currentBalance = account.balance;
  const creditLimit = account.credit_limit !== undefined ? account.credit_limit : balances.limit;
  
  const currencyCode = account.currency || balances.iso_currency_code || 'USD';
  const officialName = plaidData.official_name || account.name;
  const subtype = account.subtype || plaidData.subtype || account.type;
  
  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(val);
  };

  // Determine display balance (prefer available for checking, current for credit)
  let displayBalance = currentBalance;
  let balanceLabel = 'Current Balance';
  if (account.type === 'depository' && availableBalance !== null && availableBalance !== undefined) {
    displayBalance = availableBalance;
    balanceLabel = 'Available Balance';
  } else if (account.type === 'credit') {
    displayBalance = currentBalance;
    balanceLabel = 'Current Balance';
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Account Details" showBack={true} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Top Banner / Logo */}
        <View className="items-center bg-white rounded-3xl p-8 mb-6 shadow-sm shadow-slate-100 border border-slate-100 relative">
          
          {/* Last Synced (Top Left) */}
          <View className="absolute top-5 left-5">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Synced</Text>
            <Text className="text-xs font-bold text-slate-600 mt-0.5">
              {account.last_balance_sync 
                ? new Date(account.last_balance_sync).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                : (account.updated_at 
                    ? new Date(account.updated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                    : 'Just now'
                  )
              }
            </Text>
          </View>

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
              disabled={isRefreshing || timeLeft > 0}
              className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100"
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#64748B" />
              ) : timeLeft > 0 ? (
                <Text className="text-[10px] font-bold text-gray-400">{timeLeft}s</Text>
              ) : (
                <Ionicons name="refresh" size={20} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>

          {(() => {
            const last4 = account.account_number ? account.account_number.slice(-4) : '****';
            let logoName: any = 'business';
            let logoBgColor = 'bg-blue-700';

            if (subtype === 'credit card' || account.type === 'credit') {
              logoName = 'card';
              logoBgColor = 'bg-slate-800';
            } else if (subtype === 'checking' || subtype === 'savings') {
              logoName = 'wallet';
              logoBgColor = 'bg-emerald-600';
            }

            return (
              <>
                <View className="items-center justify-center mt-6 mb-4">
                  <BankLogo
                    institutionName={account.name}
                    logoBase64={account.logo}
                    color={account.color}
                    size={80}
                    fallbackIcon={logoName}
                  />
                </View>
                <Text className="text-2xl font-extrabold text-slate-800 mb-1 text-center">{account.name}</Text>
                <Text className="text-sm font-medium text-slate-400 tracking-[0.2em] mb-4">**** **** **** {last4}</Text>
              </>
            );
          })()}
          
          {/* Balance */}
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2 text-center">{balanceLabel}</Text>
          {isBalanceVisible ? (
            <Text className="text-4xl font-extrabold text-primary">
              {formatCurrency(displayBalance)}
            </Text>
          ) : (
            <Text className="text-4xl font-extrabold text-slate-400 tracking-widest">
              $***.**
            </Text>
          )}
        </View>

        {/* Account Info Card */}
        <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-100 border border-slate-100">
          <Text className="text-base font-extrabold text-slate-800 mb-4">Account Information</Text>
          
          <View className="flex-row justify-between py-3 border-b border-slate-50">
            <Text className="text-slate-500 font-medium">Official Name</Text>
            <Text className="text-slate-800 font-bold max-w-[60%] text-right">{officialName}</Text>
          </View>
          
          <View className="flex-row justify-between py-3 border-b border-slate-50">
            <Text className="text-slate-500 font-medium">Account Type</Text>
            <Text className="text-slate-800 font-bold capitalize">{subtype}</Text>
          </View>

          {creditLimit !== null && creditLimit !== undefined && (
            <View className="flex-row justify-between py-3 border-b border-slate-50">
              <Text className="text-slate-500 font-medium">Credit Limit</Text>
              <Text className="text-slate-800 font-bold">{formatCurrency(creditLimit)}</Text>
            </View>
          )}

          {currentBalance !== null && currentBalance !== undefined && availableBalance !== null && availableBalance !== undefined && (
            <View className="flex-row justify-between py-3 border-b border-slate-50">
              <Text className="text-slate-500 font-medium">Current Balance</Text>
              <Text className="text-slate-800 font-bold">{formatCurrency(currentBalance)}</Text>
            </View>
          )}

          <View className="flex-row justify-between py-3">
            <Text className="text-slate-500 font-medium">Currency</Text>
            <Text className="text-slate-800 font-bold">{currencyCode}</Text>
          </View>
        </View>

        {/* Transaction History */}
        <View className="flex-row justify-between items-center mb-4 px-1">
          <Text className="text-base font-extrabold text-slate-800">Recent Transactions</Text>
        </View>
        
        {isLoadingTxns ? (
          <Text className="text-center py-10 text-slate-500">Loading transactions...</Text>
        ) : transactions.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center justify-center shadow-sm shadow-slate-100 border border-slate-200 border-dashed">
            <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
            <Text className="text-slate-400 font-medium text-center mt-3">No transactions synced yet.</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">Go to Accounts list to Sync Transactions.</Text>
          </View>
        ) : (
          <View className="bg-white rounded-3xl p-2 shadow-sm shadow-slate-100 border border-slate-100 mb-6">
            {transactions.map((txn, index) => (
              <TouchableOpacity 
                key={txn.id}
                onPress={() => router.push(`/bank-transaction/${txn.id}`)}
                activeOpacity={0.7}
                className={`flex-row items-center p-4 ${index !== transactions.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <View className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 items-center justify-center overflow-hidden mr-3">
                  {txn.logo_url ? (
                    <Image source={{ uri: txn.logo_url }} className="w-8 h-8 rounded-full" resizeMode="cover" />
                  ) : (
                    <Ionicons name="cart" size={20} color="#94A3B8" />
                  )}
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-slate-800 font-bold text-base leading-tight" numberOfLines={1}>
                    {txn.merchant_name || txn.name}
                  </Text>
                  <Text className="text-slate-500 font-medium text-xs mt-1">
                    {new Date(txn.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    {txn.pending ? ' • Pending' : ''}
                  </Text>
                </View>
                <View className="items-end justify-center">
                  <Text className={`font-extrabold text-base ${txn.amount > 0 ? 'text-slate-800' : 'text-emerald-500'}`}>
                    {txn.amount > 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                  </Text>
                  {txn.primary_category && (
                    <Text className="text-slate-400 font-bold text-[9px] mt-1 uppercase tracking-wider">
                      {txn.primary_category.replace(/_/g, ' ')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            {hasNextPage && (
              <TouchableOpacity 
                onPress={() => fetchNextPage()} 
                disabled={isFetchingNextPage}
                className="py-4 mt-2 items-center justify-center border-t border-slate-50"
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color="#6BCB77" />
                ) : (
                  <Text className="text-primary font-bold text-sm">Load More Transactions</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

      </ScrollView>

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
