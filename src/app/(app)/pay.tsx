import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../store/dataStore';
import TransactionCard from '../../components/cards/TransactionCard';
import EmptyState from '../../components/common/EmptyState';
import Header from '../../components/common/Header';

export default function PayHub() {
  const router = useRouter();
  const transactionsData = useDataStore((state) => state.transactions);

  return (
    <View className="flex-1 bg-background">
      <Header title="Payment Hub" />
      
      <View className="px-5 pb-6 bg-white shadow-sm shadow-slate-100 z-10 border-b border-slate-100 pt-6">
        
        <View className="flex-row justify-between">
          <Pressable 
            onPress={() => router.push('/send-payment')}
            className="flex-1 bg-primary py-4 rounded-2xl items-center mr-2 shadow-sm shadow-primary/30 flex-row justify-center"
          >
            <Ionicons name="arrow-up" size={20} color="#FFF" className="mr-2" />
            <Text className="font-bold text-white ml-2 text-base">Pay Someone</Text>
          </Pressable>
          
          <Pressable 
            onPress={() => router.push('/receive-payment')}
            className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl items-center ml-2 shadow-sm shadow-slate-100 flex-row justify-center"
          >
            <Ionicons name="qr-code-outline" size={20} color="#0F172A" className="mr-2" />
            <Text className="font-bold text-text ml-2 text-base">Receive</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-text mb-4">Recent Transactions</Text>
        
        {transactionsData.length === 0 ? (
          <EmptyState 
            iconName="receipt-outline" 
            title="No Transactions" 
            message="Send or receive money to see your history here." 
          />
        ) : (
          transactionsData.slice(0, 5).map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
          ))
        )}
        
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
