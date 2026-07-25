import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account, useSyncBalance } from '../../api/accounts';
import BankLogo from '../common/BankLogo';

interface AccountCardProps {
  account: Account;
  onPress?: (account: Account) => void;
  showActions?: boolean;
  onCancel?: (account: Account) => void;
  onDetails?: (account: Account) => void;
}

export default function AccountCard({ 
  account, 
  onPress,
  showActions = true,
  onCancel,
  onDetails
}: AccountCardProps) {
  const { name, account_number, type, provider, logo, color } = account;
  
  const isPlaid = provider === 'plaid';
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const syncBalance = useSyncBalance();

  useEffect(() => {
    if (!isPlaid) return;
    
    const calculateTimeLeft = () => {
      // Use updated_at, fallback to created_at, or if neither exists assume it's fresh (0)
      const dateString = account.updated_at || account.created_at;
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
  }, [account.updated_at, account.created_at, isPlaid]);

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

  const handleRefresh = async () => {
    if (!isPlaid) return;
    setIsRefreshing(true);
    try {
      await syncBalance.mutateAsync(account.id);
    } catch (err: any) {
      console.error('Failed to sync balance:', err);
      const errorMessage = err.response?.data?.error || 'Failed to fetch latest balance from bank.';
      Alert.alert('Refresh Rate Limit', errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  };

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

          {isPlaid && (
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
                <Ionicons name="refresh" size={18} color="#64748B" />
              )}
            </TouchableOpacity>
          )}
        </View>

      </TouchableOpacity>

      {/* Actions Area */}
      {showActions && (
        <View className="flex-row items-center border-t border-slate-100 pt-3 mt-3">
          <TouchableOpacity 
            onPress={() => onCancel && onCancel(account)}
            className="flex-1 items-center justify-center py-2 flex-row"
          >
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" className="mr-1" />
            <Text className="text-red-500 font-bold ml-1">Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}
