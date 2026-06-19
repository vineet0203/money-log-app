import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../../api/accounts';

interface AccountCardProps {
  account: Account;
  onPress?: (account: Account) => void;
  showActions?: boolean;
  onEdit?: (account: Account) => void;
  onCancel?: (account: Account) => void;
  onDetails?: (account: Account) => void;
}

export default function AccountCard({ 
  account, 
  onPress,
  showActions = true,
  onEdit,
  onCancel,
  onDetails
}: AccountCardProps) {
  const { name, account_number, type } = account;
  
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const last4 = account_number ? account_number.slice(-4) : '****';
  
  let logoName: any = 'business';
  let logoBgColor = 'bg-blue-700';

  if (type === 'card') {
    logoName = 'card';
    logoBgColor = 'bg-slate-800';
  } else if (type === 'wallet') {
    logoName = 'wallet';
    logoBgColor = 'bg-emerald-600';
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate network request until 3rd party sync is built
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 mb-3">
      <TouchableOpacity 
        activeOpacity={onPress || onDetails ? 0.7 : 1}
        onPress={() => onPress ? onPress(account) : (onDetails && onDetails(account))}
        className="flex-row items-center mb-1"
      >
        
        {/* Logo */}
        <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${logoBgColor}`}>
          <Ionicons name={logoName} size={24} color="#FFF" />
        </View>

        {/* Account Info */}
        <View className="flex-1 justify-center">
          <Text className="text-lg font-bold text-gray-800 mb-0.5" numberOfLines={1}>{name}</Text>
          <Text className="text-sm font-medium text-gray-500 tracking-wider">
            XXXX-{last4}
          </Text>

          <View className="flex-row items-center mt-2">
            {isBalanceVisible ? (
              <Text className="text-2xl font-extrabold text-primary">
                $0.00
              </Text>
            ) : (
              <Text className="text-2xl font-extrabold text-gray-400 tracking-widest mt-1">
                ***.**
              </Text>
            )}
          </View>
        </View>

        {/* Visibility and Refresh Icons */}
        <View className="justify-center items-center flex-row ml-2">
          <TouchableOpacity 
            onPress={() => setIsBalanceVisible(!isBalanceVisible)}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 mr-2 border border-slate-100"
          >
            <Ionicons 
              name={isBalanceVisible ? "eye-off" : "eye"} 
              size={18} 
              color="#64748B" 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleRefresh}
            disabled={isRefreshing}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#64748B" />
            ) : (
              <Ionicons name="refresh" size={18} color="#64748B" />
            )}
          </TouchableOpacity>
        </View>

      </TouchableOpacity>

      {/* Actions Area */}
      {showActions && (
        <View className="flex-row items-center border-t border-slate-100 pt-3 mt-3">
          <TouchableOpacity 
            onPress={() => onEdit && onEdit(account)}
            className="flex-1 items-center justify-center py-2 flex-row"
          >
            <Ionicons name="pencil" size={18} color="#3B82F6" className="mr-1" />
            <Text className="text-blue-500 font-bold ml-1">Edit</Text>
          </TouchableOpacity>
          
          <View className="w-[1px] h-6 bg-slate-200 mx-1" />
          
          <TouchableOpacity 
            onPress={() => onCancel && onCancel(account)}
            className="flex-1 items-center justify-center py-2 flex-row"
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" className="mr-1" />
            <Text className="text-red-500 font-bold ml-1">Remove</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}
