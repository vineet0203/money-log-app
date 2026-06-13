import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TransactionCard({ tx }: { tx: any }) {
  return (
    <TouchableOpacity 
      onPress={() => router.push(`/transaction/${tx.id}`)}
      className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100 border border-slate-50"
    >
      <View className={`w-12 h-12 rounded-full ${tx.bg} items-center justify-center mr-4`}>
        <Ionicons name={tx.icon as any} size={22} color={tx.color} />
      </View>
      <View className="flex-1">
        <Text className="text-text font-bold text-base mb-0.5">{tx.name}</Text>
        <Text className="text-textMuted text-xs">{tx.date}</Text>
      </View>
      <View className="items-end">
        <Text className={`font-bold text-base ${tx.isPositive ? 'text-emerald-500' : 'text-text'}`}>
          {tx.amount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
