import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AccountCard({ account }: { account: any }) {
  return (
    <TouchableOpacity 
      onPress={() => router.push(`/account/${account.id}`)}
      className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100 border border-slate-50"
    >
      <View className={`w-12 h-12 rounded-full ${account.bg || 'bg-slate-50'} items-center justify-center mr-4`}>
        <Ionicons name={account.icon as any} size={22} color={account.color} />
      </View>
      <View className="flex-1">
        <Text className="text-text font-bold text-base mb-0.5">{account.name}</Text>
        <Text className="text-textMuted text-xs">{account.bank}</Text>
      </View>
      <View className="items-end">
        <Text className={`font-bold text-base ${account.isNegative ? 'text-text' : 'text-text'}`}>
          {account.amount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
