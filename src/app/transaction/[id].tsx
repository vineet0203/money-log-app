import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransaction } from '../../api/transactions';
import Header from '../../components/common/Header';
import { getBackendUrl } from '../../store/authStore';
import dayjs from 'dayjs';

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const { data: transaction, isLoading, isError } = useTransaction(id as string);

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50">
        <Header title="Transaction Details" showBack={true} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6BCB77" />
        </View>
      </View>
    );
  }

  if (isError || !transaction) {
    return (
      <View className="flex-1 bg-slate-50">
        <Header title="Transaction Details" showBack={true} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500 font-bold">Failed to load transaction.</Text>
        </View>
      </View>
    );
  }

  const isExpense = transaction.type === 'expense';
  const amountStr = `${isExpense ? '-' : '+'}$${Math.abs(parseFloat(transaction.amount)).toFixed(2)}`;
  const amountColor = isExpense ? 'text-red-500' : 'text-primary';
  const iconColor = transaction.category_color || '#94A3B8';
  const iconName = transaction.category_icon || (isExpense ? 'cart' : 'cash');
  const receiptUrl = transaction.receipt_url ? `${getBackendUrl()}${transaction.receipt_url}` : null;

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Details" showBack={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header: Amount & Title */}
        <View className="items-center py-8 bg-white border-b border-slate-100 px-5">
          <View 
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: iconColor + '20' }}
          >
            <Ionicons name={iconName as any} size={32} color={iconColor} />
          </View>
          <Text className={`text-4xl font-extrabold mb-2 ${amountColor}`}>{amountStr}</Text>
          <Text className="text-xl font-bold text-slate-800 text-center">{transaction.title}</Text>
          <Text className="text-sm font-medium text-slate-400 mt-1">
            {dayjs(transaction.created_at || transaction.date).format('MMM D, YYYY • h:mm A')}
          </Text>
        </View>

        {/* Info Cards */}
        <View className="px-5 mt-6">
          <Text className="text-sm font-extrabold text-slate-800 mb-3 uppercase tracking-wider">Information</Text>
          
          <View className="bg-white rounded-2xl shadow-sm shadow-slate-100 border border-slate-100 overflow-hidden">
            <View className="flex-row justify-between py-4 px-4 border-b border-slate-50">
              <Text className="text-sm font-medium text-slate-500">Category</Text>
              <Text className="text-sm font-bold text-slate-800">{transaction.category_name || 'Uncategorized'}</Text>
            </View>
            <View className="flex-row justify-between py-4 px-4 border-b border-slate-50">
              <Text className="text-sm font-medium text-slate-500">Type</Text>
              <Text className="text-sm font-bold text-slate-800 capitalize">{transaction.type}</Text>
            </View>
            <View className="py-4 px-4">
              <Text className="text-sm font-medium text-slate-500 mb-1">Note</Text>
              <Text className={`text-sm font-bold leading-5 ${transaction.description ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                {transaction.description || 'No notes added'}
              </Text>
            </View>
          </View>
        </View>

        {/* Receipt Section */}
        <View className="px-5 mt-6">
          <Text className="text-sm font-extrabold text-slate-800 mb-3 uppercase tracking-wider">Receipt</Text>
          <View className="bg-white rounded-2xl shadow-sm shadow-slate-100 border border-slate-100 overflow-hidden">
            {receiptUrl ? (
              <Image 
                source={{ uri: receiptUrl }} 
                className="w-full h-64 bg-slate-100"
                resizeMode="contain"
              />
            ) : (
              <View className="w-full h-32 bg-slate-50 items-center justify-center">
                <Ionicons name="image-outline" size={32} color="#CBD5E1" />
                <Text className="text-sm font-medium text-slate-400 mt-2">No receipt uploaded</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
