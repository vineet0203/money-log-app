import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Header from '../../components/common/Header';
import BankLogo from '../../components/common/BankLogo';
import LiabilityInfoCard from '../../components/cards/LiabilityInfoCard';

import { useAccountDetails, useAccountTransactions } from '../../api/accounts';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: account, isLoading: isAccountLoading } = useAccountDetails(id as string);

  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  // DatePicker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { data: transactionsData, isLoading: isLoadingTxns, hasNextPage, fetchNextPage, isFetchingNextPage } = useAccountTransactions(account?.id || 0);
  const transactions = transactionsData?.pages.flatMap(p => p.data) || [];
  const totalTxns = transactionsData?.pages[0]?.pagination?.totalItems || 0;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isAccountLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }
  
  if (!account) return null;

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
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '$0.00';
    return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const subtype = account.subtype ? account.subtype.toLowerCase() : '';
  const isCredit = account.type === 'credit' || subtype === 'credit card';
  const displayBalance = account.balance;
  const currentBalance = account.balance;
  const availableBalance = account.available_balance;
  const creditLimit = account.credit_limit;
  
  const balanceLabel = isCredit ? 'Current Balance' : 'Available Balance';
  const currencyCode = (account as any).currency_code || 'USD';
  const officialName = account.holder_name || account.name;

  const renderHeader = () => (
    <View className="px-5 pt-4">
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

      {/* Liability Details */}
      <LiabilityInfoCard accountId={account.id} />

      {/* Transaction History Header */}
      <View className="flex-row justify-between items-center mb-4 px-1">
        <View>
          <Text className="text-base font-extrabold text-slate-800">Recent Transactions</Text>
          {totalTxns > 0 && (
            <Text className="text-xs font-bold text-slate-400 mt-0.5">{totalTxns} total transactions</Text>
          )}
        </View>
      </View>
      
      {isLoadingTxns && (
        <Text className="text-center py-10 text-slate-500">Loading transactions...</Text>
      )}

      {!isLoadingTxns && transactions.length === 0 && (
        <View className="bg-white rounded-3xl p-8 items-center justify-center shadow-sm shadow-slate-100 border border-slate-200 border-dashed mb-6">
          <Ionicons name="receipt-outline" size={48} color="#CBD5E1" />
          <Text className="text-slate-400 font-medium text-center mt-3">No transactions synced yet.</Text>
          <Text className="text-slate-400 text-xs text-center mt-1">Go to Accounts list to Sync Transactions.</Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Header title="Account Details" showBack />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: txn, index }) => (
          <View className="px-5">
            <TouchableOpacity 
              onPress={() => router.push(`/bank-transaction/${txn.id}`)}
              activeOpacity={0.7}
              className={`flex-row items-center bg-white p-4 border-slate-50 ${
                index === 0 ? 'rounded-t-3xl border-b' : 
                index === transactions.length - 1 && !hasNextPage ? 'rounded-b-3xl' : 'border-b'
              }`}
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
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          transactions.length > 0 ? (
            <View className="px-5 pb-10">
              <View className={`bg-white items-center justify-center ${hasNextPage ? 'rounded-b-3xl' : ''}`}>
                {isFetchingNextPage ? (
                  <ActivityIndicator color="#4F46E5" className="my-6" />
                ) : hasNextPage ? (
                  <TouchableOpacity 
                    onPress={handleLoadMore} 
                    className="py-6 w-full items-center justify-center"
                  >
                    <Text className="text-primary font-bold text-sm">Load More</Text>
                  </TouchableOpacity>
                ) : (
                  <Text className="text-center text-slate-400 py-6 text-xs">End of transactions</Text>
                )}
              </View>
            </View>
          ) : <View className="pb-10" />
        }
      />

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
