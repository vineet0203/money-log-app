import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NetWorthCard() {
  return (
    <View className="bg-white rounded-3xl p-6 mb-8 shadow-sm shadow-slate-200 border border-slate-100 relative overflow-hidden">
      {/* Decorative background element */}
      <View className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mt-10 -mr-10 blur-2xl" />
      
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-textMuted font-medium text-sm tracking-wide uppercase">Total Net Worth</Text>
        <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <Text className="text-emerald-500 font-bold text-xs">+12.5%</Text>
        </View>
      </View>
      
      <Text className="text-4xl font-extrabold text-text mb-6 tracking-tight">$18,020.65</Text>
      
      <View className="flex-row justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3 border border-blue-200">
            <Ionicons name="arrow-down" size={16} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-textMuted text-xs">Assets</Text>
            <Text className="text-text font-bold">$20,271.05</Text>
          </View>
        </View>
        
        <View className="w-px bg-slate-200 mx-4" />
        
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3 border border-red-200">
            <Ionicons name="arrow-up" size={16} color="#EF4444" />
          </View>
          <View>
            <Text className="text-textMuted text-xs">Liabilities</Text>
            <Text className="text-text font-bold">$2,250.40</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
