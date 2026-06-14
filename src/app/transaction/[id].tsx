import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TransactionDetails() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 16 }} className="flex-row items-center px-5 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 items-center justify-center rounded-full bg-slate-100">
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text">Transaction</Text>
      </View>

      <View className="px-5 pt-6 items-center">
        <View className="w-20 h-20 rounded-full bg-orange-100 items-center justify-center mb-4">
          <Ionicons name="cart" size={40} color="#F97316" />
        </View>
        <Text className="text-4xl font-extrabold text-text mb-1 tracking-tight">-$84.50</Text>
        <Text className="text-lg font-bold text-text mb-1">Whole Foods Market</Text>
        <Text className="text-textMuted text-sm mb-8 font-medium">Today, 10:45 AM</Text>
      </View>

      <View className="px-5">
        <View className="bg-white p-5 rounded-3xl shadow-sm shadow-slate-100 border border-slate-50">
          <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-50">
            <Text className="text-textMuted font-medium">Category</Text>
            <Text className="text-text font-bold">Groceries</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-50">
            <Text className="text-textMuted font-medium">Account</Text>
            <Text className="text-text font-bold">Checking (...1234)</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-textMuted font-medium">Status</Text>
            <Text className="text-emerald-500 font-bold">Completed</Text>
          </View>
        </View>

        <TouchableOpacity className="flex-row items-center justify-center bg-primary/10 py-4 rounded-2xl mt-8 border border-primary/20">
          <Ionicons name="receipt-outline" size={20} color="#6BCB77" />
          <Text className="text-primary font-bold text-base ml-2">Add Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
