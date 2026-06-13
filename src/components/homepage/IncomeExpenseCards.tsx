import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function IncomeExpenseCards() {
  return (
    <View className="flex-row justify-between mb-8">
      {/* Income Card */}
      <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm shadow-slate-100 border border-slate-50 mr-2">
        <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-3">
          <Ionicons name="arrow-down" size={20} color="#10B981" />
        </View>
        <Text className="text-textMuted font-medium text-xs mb-1 uppercase tracking-wider">Income</Text>
        <Text className="text-text font-bold text-lg">$5,240.00</Text>
      </View>

      {/* Expense Card */}
      <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm shadow-slate-100 border border-slate-50 ml-2">
        <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mb-3">
          <Ionicons name="arrow-up" size={20} color="#EF4444" />
        </View>
        <Text className="text-textMuted font-medium text-xs mb-1 uppercase tracking-wider">Expenses</Text>
        <Text className="text-text font-bold text-lg">$2,150.80</Text>
      </View>
    </View>
  );
}
