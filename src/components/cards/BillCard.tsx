import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BillCard({ bill }: { bill: any }) {
  return (
    <TouchableOpacity 
      onPress={() => router.push(`/bill/${bill.id}`)}
      className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100 border border-slate-50"
    >
      <View className={`w-12 h-12 rounded-full ${bill.bg} items-center justify-center mr-4`}>
        <Ionicons name={bill.icon as any} size={22} color={bill.color} />
      </View>
      <View className="flex-1">
        <Text className="text-text font-bold text-base mb-0.5">{bill.name}</Text>
        <Text className="text-textMuted text-xs">{bill.due}</Text>
      </View>
      <View className="items-end">
        <Text className="font-bold text-base text-text mb-2">
          {bill.amount}
        </Text>
        {bill.status === 'Paid' ? (
          <View className="bg-emerald-100 px-3 py-1 rounded-md">
             <Text className="text-emerald-600 text-xs font-bold">Paid</Text>
          </View>
        ) : (
          <View className="bg-primary px-4 py-1.5 rounded-lg">
            <Text className="text-white font-bold text-xs">Pay Now</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
