import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 16 }} className="flex-row items-center px-5 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 items-center justify-center rounded-full bg-slate-100">
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text">Subscription</Text>
      </View>

      <View className="px-5 pt-6 items-center">
        <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-4">
          <Ionicons name="tv" size={40} color="#EF4444" />
        </View>
        <Text className="text-2xl font-extrabold text-text mb-1">Netflix Premium</Text>
        <Text className="text-emerald-500 text-sm mb-8 font-bold">Active Subscription</Text>
      </View>

      <View className="px-5">
        <View className="bg-white p-5 rounded-3xl shadow-sm shadow-slate-100 border border-slate-50 mb-8">
          <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-50">
            <Text className="text-textMuted font-medium">Cost</Text>
            <Text className="text-text font-bold">$19.99 <Text className="font-normal text-textMuted">/ month</Text></Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-50">
            <Text className="text-textMuted font-medium">Next Billing</Text>
            <Text className="text-text font-bold">Oct 15, 2024</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-50">
            <Text className="text-textMuted font-medium">Payment Method</Text>
            <Text className="text-text font-bold">Credit Card (...9988)</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-textMuted font-medium">Total Spent (YTD)</Text>
            <Text className="text-text font-bold">$179.91</Text>
          </View>
        </View>

        <TouchableOpacity className="bg-red-50 border border-red-100 py-4 rounded-2xl items-center shadow-sm shadow-red-50">
          <Text className="text-red-500 font-bold text-lg">Unsubscribe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
