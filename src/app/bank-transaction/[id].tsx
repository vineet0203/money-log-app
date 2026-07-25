import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import BankLogo from '../../components/common/BankLogo';
import { useAccountTransaction } from '../../api/accounts';

export default function BankTransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: txn, isLoading, isError } = useAccountTransaction(id as string);

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

  if (isError || !txn) {
    return (
      <View className="flex-1 bg-slate-50">
        <Header title="Transaction Details" showBack={true} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500 font-bold">Failed to load transaction.</Text>
        </View>
      </View>
    );
  }

  const isExpense = txn.amount > 0;
  const displayAmount = `$${Math.abs(txn.amount).toFixed(2)}`;
  
  let dateStr = txn.date;
  if (txn.datetime) {
    dateStr = new Date(txn.datetime).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } else if (txn.date) {
    dateStr = new Date(txn.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Parse location and meta safely
  let location = null;
  let meta = null;
  try {
    location = typeof txn.location === 'string' ? JSON.parse(txn.location) : txn.location;
  } catch (e) {}
  try {
    meta = typeof txn.payment_meta === 'string' ? JSON.parse(txn.payment_meta) : txn.payment_meta;
  } catch (e) {}

  const hasLocation = location && (location.address || location.city || location.region);
  const hasMeta = meta && (meta.reference_number || meta.payment_processor || meta.payee || meta.payer || txn.payment_channel);

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Transaction Details" showBack={true} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header section with amount and logo */}
        <View className="items-center mb-8 mt-4">
          <View className="mb-4 shadow-sm shadow-slate-200">
            <BankLogo 
              institutionName={txn.merchant_name || txn.name}
              logoUrl={txn.logo_url}
              size={80}
              fallbackIcon="cart"
            />
          </View>
          <Text className="text-2xl font-extrabold text-slate-800 mb-1 text-center px-4">
            {txn.merchant_name || txn.name}
          </Text>
          {txn.detailed_category && (
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
              {txn.detailed_category.replace(/_/g, ' ')}
            </Text>
          )}
          
          <Text className={`text-5xl font-extrabold tracking-tight ${isExpense ? 'text-slate-800' : 'text-emerald-500'}`}>
            {isExpense ? '-' : '+'}{displayAmount}
          </Text>
          {!!txn.pending && (
            <View className="mt-4 bg-amber-100 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="time-outline" size={14} color="#D97706" />
              <Text className="text-amber-700 text-xs font-bold ml-1">PENDING</Text>
            </View>
          )}
        </View>

        {/* General Details Card */}
        <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm shadow-slate-100 border border-slate-100">
          <Text className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Transaction Info</Text>
          
          <View className="flex-row justify-between py-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#64748B" className="mr-3" />
              <Text className="text-slate-500 font-medium text-base">Date & Time</Text>
            </View>
            <Text className="text-slate-800 font-bold text-base">
              {dateStr}
            </Text>
          </View>

          {txn.payment_channel && (
            <View className="flex-row justify-between py-4 border-b border-slate-50">
              <View className="flex-row items-center">
                <Ionicons name="card-outline" size={20} color="#64748B" className="mr-3" />
                <Text className="text-slate-500 font-medium text-base">Channel</Text>
              </View>
              <Text className="text-slate-800 font-bold text-base capitalize">{txn.payment_channel}</Text>
            </View>
          )}

          <View className="flex-row justify-between py-4">
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={20} color="#64748B" className="mr-3" />
              <Text className="text-slate-500 font-medium text-base">Statement</Text>
            </View>
            <Text className="text-slate-800 font-bold max-w-[50%] text-right text-sm leading-tight" numberOfLines={3}>
              {txn.name}
            </Text>
          </View>
        </View>

        {/* Location Card */}
        {hasLocation && (
          <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm shadow-slate-100 border border-slate-100">
            <Text className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Location</Text>
            
            <View className="flex-row items-start">
              <View className="w-12 h-12 rounded-full bg-red-50 border border-red-100 items-center justify-center mr-4">
                <Ionicons name="location" size={24} color="#EF4444" />
              </View>
              <View className="flex-1 justify-center">
                {location.address && <Text className="text-slate-800 font-bold text-base leading-tight">{location.address}</Text>}
                {(location.city || location.region) && (
                  <Text className={`text-slate-500 font-medium ${location.address ? 'text-sm mt-1' : 'text-base'}`}>
                    {[location.city, location.region, location.postal_code].filter(Boolean).join(', ')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Extra Metadata */}
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-100 border border-slate-100 mb-4">
          <Text className="text-sm font-extrabold text-slate-800 mb-4 uppercase tracking-wider">Additional Details</Text>
          
          {!meta?.reference_number && !meta?.payment_processor && !meta?.payee ? (
            <View className="py-2">
              <Text className="text-slate-500 font-medium text-base italic">N/A</Text>
            </View>
          ) : (
            <>
              {meta?.reference_number && (
                <View className="flex-row justify-between py-4 border-b border-slate-50">
                  <View className="flex-row items-center">
                    <Ionicons name="barcode-outline" size={20} color="#64748B" className="mr-3" />
                    <Text className="text-slate-500 font-medium text-base">Ref #</Text>
                  </View>
                  <Text className="text-slate-800 font-bold text-base">{meta.reference_number}</Text>
                </View>
              )}

              {meta?.payment_processor && (
                <View className="flex-row justify-between py-4 border-b border-slate-50">
                  <View className="flex-row items-center">
                    <Ionicons name="cog-outline" size={20} color="#64748B" className="mr-3" />
                    <Text className="text-slate-500 font-medium text-base">Processor</Text>
                  </View>
                  <Text className="text-slate-800 font-bold text-base">{meta.payment_processor}</Text>
                </View>
              )}

              {meta?.payee && (
                <View className="flex-row justify-between py-4">
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={20} color="#64748B" className="mr-3" />
                    <Text className="text-slate-500 font-medium text-base">Payee</Text>
                  </View>
                  <Text className="text-slate-800 font-bold text-base">{meta.payee}</Text>
                </View>
              )}
            </>
          )}
        </View>
        
      </ScrollView>
    </View>
  );
}
