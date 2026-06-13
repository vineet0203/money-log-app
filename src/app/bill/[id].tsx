import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockBillsData: Record<string, any> = {
  '1': { name: 'Electricity Bill', due: 'Due in 2 days', amount: '$120.00', icon: 'flash', bg: 'bg-orange-100', color: '#F97316', biller: 'City Power Co.', autoPay: 'Off', isSubscription: false },
  '2': { name: 'Internet Bill', due: 'Due in 5 days', amount: '$60.00', icon: 'wifi', bg: 'bg-blue-100', color: '#3B82F6', biller: 'Comcast', autoPay: 'On', isSubscription: false },
  '3': { name: 'Netflix Premium', due: 'Due in 2 days', amount: '$19.99', icon: 'tv', bg: 'bg-red-100', color: '#EF4444', biller: 'Netflix', autoPay: 'On', isSubscription: true },
  '6': { name: 'Netflix Premium', due: 'Due in 2 days', amount: '$19.99', icon: 'tv', bg: 'bg-red-100', color: '#EF4444', biller: 'Netflix', autoPay: 'On', isSubscription: true },
};

export default function BillDetails() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  // Default to Electricity if ID not found just for preview purposes
  const bill = mockBillsData[id as string] || mockBillsData['1'];

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: insets.top + 16 }} className="flex-row items-center px-5 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 items-center justify-center rounded-full bg-slate-100">
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text">Bill Details</Text>
      </View>

      <View className="px-5 pt-6 items-center">
        <View className={`w-20 h-20 rounded-full ${bill.bg} items-center justify-center mb-4`}>
          <Ionicons name={bill.icon as any} size={40} color={bill.color} />
        </View>
        <Text className="text-4xl font-extrabold text-text mb-1 tracking-tight">{bill.amount}</Text>
        <Text className="text-lg font-bold text-text mb-2">{bill.name}</Text>
        <View className="bg-amber-100 px-3 py-1 rounded-md mt-1">
          <Text className="text-amber-600 text-xs font-bold">{bill.due}</Text>
        </View>
      </View>

      <View className="px-5 mt-8">
        <View className="bg-white p-5 rounded-3xl shadow-sm shadow-slate-100 border border-slate-50 mb-8">
          <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-50">
            <Text className="text-textMuted font-medium">Biller</Text>
            <Text className="text-text font-bold">{bill.biller}</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-slate-50">
            <Text className="text-textMuted font-medium">Due Date</Text>
            <Text className="text-text font-bold">Oct 12, 2024</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-textMuted font-medium">Auto-Pay</Text>
            <Text className="text-text font-bold">{bill.autoPay}</Text>
          </View>
        </View>

        <TouchableOpacity className="bg-primary shadow-lg shadow-primary/30 py-4 rounded-2xl items-center mb-4">
          <Text className="text-white font-bold text-lg">Pay Now</Text>
        </TouchableOpacity>
        
        {bill.isSubscription && (
          <TouchableOpacity className="bg-red-50 border border-red-100 py-4 rounded-2xl items-center shadow-sm shadow-red-50">
            <Text className="text-red-500 font-bold text-lg">Unsubscribe</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
