import { View, Text } from 'react-native';

export default function BalanceCard() {
  return (
    <View className="bg-white p-6 rounded-3xl shadow-sm shadow-slate-200 border border-slate-50 mb-8 mt-2">
      <Text className="text-textMuted font-medium text-sm mb-2">Total Balance</Text>
      <Text className="text-4xl font-extrabold text-text mb-3 tracking-tight">$28,650.50</Text>
      <View className="flex-row items-center">
        <View className="flex-row items-center mr-2">
          <Text className="text-emerald-500 font-bold text-sm">↑ 4.29%</Text>
        </View>
        <Text className="text-textMuted text-sm font-medium">vs last month</Text>
      </View>
    </View>
  );
}
