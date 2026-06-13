import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataStore } from '../store/dataStore';
import TransactionCard from '../components/cards/TransactionCard';
import EmptyState from '../components/common/EmptyState';

export default function TransactionsList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const transactionsData = useDataStore((state) => state.transactions);

  return (
    <View className="flex-1 bg-background">
      <View 
        style={{ paddingTop: insets.top + 16 }} 
        className="flex-row items-center justify-between px-5 pb-4 bg-white shadow-sm shadow-slate-100 z-10 border-b border-slate-100"
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text className="font-bold text-lg text-text">Transactions</Text>
        <TouchableOpacity className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100">
          <Ionicons name="search" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {transactionsData.length === 0 ? (
          <EmptyState 
            iconName="receipt-outline" 
            title="No Transactions" 
            message="Your transaction history is empty." 
          />
        ) : (
          transactionsData.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
