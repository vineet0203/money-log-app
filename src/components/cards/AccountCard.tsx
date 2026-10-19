import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../../api/accounts';
import BankLogo from '../common/BankLogo';

interface AccountCardProps {
  account: Account;
  onPress?: (account: Account) => void;
  showActions?: boolean;
  onCancel?: (account: Account) => void;
  onDetails?: (account: Account) => void;
  onReconnect?: (itemId: string) => void;
  isLoading?: boolean;
}

export default function AccountCard({ 
  account, 
  onPress,
  showActions = true,
  onCancel,
  onDetails,
  onReconnect,
  isLoading = false
}: AccountCardProps) {
  const { name, account_number, type, provider, logo, color } = account;
  
  const isPlaid = provider === 'plaid';
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  const last4 = account_number ? account_number.slice(-4) : '****';
  
  let logoName: any = 'business';
  let logoBgColor = 'bg-blue-700';
  let hasImage = false;

  if (isPlaid && logo) {
    hasImage = true;
  } else if (isPlaid) {
    const sub = account.subtype?.toLowerCase() || '';
    if (sub === 'credit card' || type === 'card') {
      logoName = 'card';
      logoBgColor = color ? `bg-[${color}]` : 'bg-indigo-800';
    } else if (sub === 'checking' || sub === 'savings') {
      logoName = 'business';
      logoBgColor = color ? `bg-[${color}]` : 'bg-indigo-600';
    } else {
      logoName = 'link';
      logoBgColor = color ? `bg-[${color}]` : 'bg-indigo-600';
    }
  } else if (type === 'card') {
    logoName = 'card';
    logoBgColor = 'bg-slate-800';
  } else if (type === 'wallet') {
    logoName = 'wallet';
    logoBgColor = 'bg-emerald-600';
  }

  return (
    <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 mb-3">
      <TouchableOpacity 
        activeOpacity={onPress || onDetails ? 0.7 : 1}
        onPress={() => onPress ? onPress(account) : (onDetails && onDetails(account))}
        className="flex-row items-center mb-1"
      >
        
        <BankLogo 
          institutionName={name}
          logoBase64={account.logo}
          color={color}
          size={48}
          fallbackIcon={logoName as any}
          className="mr-4"
        />

        {/* Account Info */}
        <View className="flex-1 justify-center">
          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-gray-800 mb-0.5" numberOfLines={1}>{name}</Text>
          </View>
          <Text className="text-sm font-medium text-gray-500 tracking-wider">
            XXXX-{last4}
          </Text>

          <View className="flex-row items-center mt-2">
            {isBalanceVisible ? (
              <Text className="text-2xl font-extrabold text-primary">
                ${account.balance !== undefined && account.balance !== null ? Number(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </Text>
            ) : (
              <Text className="text-2xl font-extrabold text-gray-400 tracking-widest mt-1">
                ***.**
              </Text>
            )}
          </View>
        </View>

        {/* Visibility Icon */}
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
        </View>

      </TouchableOpacity>

      {/* Actions Area */}
      {showActions && (
        <View className={`border-t border-slate-100 pt-2 mt-2 flex-row items-center justify-evenly ${isLoading ? 'opacity-50' : ''}`}>
          {account.sync_status === 'login_required' && account.item_id && (
            <>
              <TouchableOpacity 
                disabled={isLoading}
                onPress={() => onReconnect && onReconnect(account.item_id!)}
                className="flex-1 flex-row items-center justify-center py-2.5"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#DC2626" className="mr-1.5" />
                ) : (
                  <Ionicons name="alert-circle" size={18} color="#DC2626" className="mr-1.5" />
                )}
                <Text className="text-red-600 font-bold text-sm">Fix Connection</Text>
              </TouchableOpacity>
              
              {/* Divider */}
              <View className="w-px h-8 bg-slate-100" />
            </>
          )}
          <TouchableOpacity 
            disabled={isLoading}
            onPress={() => onCancel && onCancel(account)}
            className="flex-1 flex-row items-center justify-center py-2.5"
          >
            <Ionicons name="close-circle-outline" size={18} color="#64748B" className="mr-1.5" />
            <Text className="text-slate-500 font-bold text-sm">Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}
