import { View, Text } from 'react-native';

export default function BudgetProgressCard() {
  return (
    <View className="bg-white p-5 rounded-3xl shadow-sm shadow-slate-100 border border-slate-50 mb-8">
      <View className="flex-row justify-between items-end mb-3">
        <View>
          <Text className="text-textMuted font-bold text-xs mb-1 uppercase tracking-wider">Monthly Budget</Text>
          <Text className="text-text font-extrabold text-xl">$2,150.80 <Text className="text-textMuted text-sm font-semibold">/ $3,000</Text></Text>
        </View>
        <View className="bg-primary/10 px-2 py-1 rounded-md">
          <Text className="text-primary font-bold text-xs">71% Used</Text>
        </View>
      </View>
      
      {/* Progress Bar Background */}
      <View className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
        {/* Progress Fill */}
        <View className="h-full bg-primary rounded-full" style={{ width: '71%' }} />
      </View>
      <Text className="text-textMuted text-xs mt-3 font-medium">$849.20 remaining this month</Text>
    </View>
  );
}
