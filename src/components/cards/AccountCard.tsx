import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../../types';

interface AccountCardProps {
  account: Account;
  onPress?: (account: Account) => void;
}

export default function AccountCard({ account, onPress }: AccountCardProps) {
  const { name, last4, balance, logoName, logoBgColor } = account;
  
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate network request
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <TouchableOpacity 
      activeOpacity={onPress ? 0.7 : 1}
      onPress={() => onPress && onPress(account)}
      className="flex-row items-center bg-white p-4 mb-3 border border-slate-100 rounded-3xl shadow-sm shadow-slate-200"
    >
      
      {/* Logo */}
      <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${logoBgColor}`}>
        <Ionicons name={logoName} size={24} color="#FFF" />
      </View>

      {/* Account Info */}
      <View className="flex-1 justify-center">
        <Text className="text-base font-bold text-text mb-1">{name}</Text>
        <Text className="text-sm font-medium text-textMuted tracking-wider">
          XXXX-{last4}
        </Text>
        
        {/* Balance Area */}
        <View className="flex-row items-center mt-2">
          {isBalanceVisible ? (
            <Text className="text-lg font-extrabold text-primary">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          ) : (
            <Text className="text-lg font-extrabold text-textMuted tracking-widest mt-1">
              ***.**
            </Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="justify-center items-center flex-row">
        {/* Visibility Toggle */}
        <TouchableOpacity 
          onPress={() => setIsBalanceVisible(!isBalanceVisible)}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 mr-2"
        >
          <Ionicons 
            name={isBalanceVisible ? "eye-off" : "eye"} 
            size={20} 
            color="#64748B" 
          />
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity 
          onPress={handleRefresh}
          disabled={isRefreshing}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#64748B" />
          ) : (
            <Ionicons name="refresh" size={20} color="#64748B" />
          )}
        </TouchableOpacity>
      </View>

    </TouchableOpacity>
  );
}
