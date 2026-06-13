import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const accounts = [
  { id: 1, name: 'Checking', bank: 'Chase Bank', amount: '$7,850.25', icon: 'business', color: 'bg-[#1D4ED8]' },
  { id: 2, name: 'Savings', bank: 'Chase Bank', amount: '$12,420.80', icon: 'business', color: 'bg-[#10B981]' },
  { id: 3, name: 'Credit Card', bank: 'Chase Bank', amount: '- $2,250.40', icon: 'card', color: 'bg-[#EF4444]', isNegative: true },
];

export default function AccountsList() {
  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4 px-2">
        <Text className="text-xl font-bold text-text">Accounts</Text>
        <TouchableOpacity>
          <Text className="text-primary font-semibold text-sm">See all</Text>
        </TouchableOpacity>
      </View>
      
      {accounts.map((account) => (
        <TouchableOpacity key={account.id} className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100">
          <View className={`w-12 h-12 rounded-full ${account.color} items-center justify-center mr-4`}>
            <Ionicons name={account.icon as any} size={22} color="#FFF" />
          </View>
          <View className="flex-1">
            <Text className="text-text font-bold text-base mb-0.5">{account.name}</Text>
            <Text className="text-textMuted text-xs">{account.bank}</Text>
          </View>
          <View className="items-center flex-row">
            <Text className={`font-bold text-base mr-2 ${account.isNegative ? 'text-red-500' : 'text-text'}`}>
              {account.amount}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
