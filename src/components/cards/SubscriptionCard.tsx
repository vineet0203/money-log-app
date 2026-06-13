import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SubscriptionCard({ sub }: { sub: any }) {
  return (
    <TouchableOpacity 
      onPress={() => router.push(`/subscription/${sub.id}`)}
      className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100 border border-slate-50"
    >
      <View className={`w-12 h-12 rounded-full ${sub.bg} items-center justify-center mr-4`}>
        <Ionicons name={sub.icon as any} size={22} color={sub.color} />
      </View>
      <View className="flex-1">
        <Text className="text-text font-bold text-base mb-0.5">{sub.name}</Text>
        <Text className="text-textMuted text-xs font-medium">Next billing: <Text className="text-primary font-bold">{sub.nextBilling}</Text></Text>
      </View>
      <View className="items-end">
        <Text className="font-bold text-base text-text">
          {sub.amount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
