import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useDataStore } from '../../store/dataStore';
import TransactionCard from '../cards/TransactionCard';
import EmptyState from '../common/EmptyState';

export default function RecentTransactions() {
  const transactionsData = useDataStore((state) => state.transactions);

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4 px-2">
        <Text className="text-xl font-bold text-text">Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/transactions')}>
          <Text className="text-primary font-semibold text-sm">See all</Text>
        </TouchableOpacity>
      </View>
      
      {transactionsData.length === 0 ? (
        <EmptyState 
          iconName="receipt-outline" 
          title="No Transactions" 
          message="You have no recent transactions. They will appear here once you spend or receive money." 
        />
      ) : (
        transactionsData.slice(0, 3).map((tx) => (
          <TransactionCard key={tx.id} tx={tx} />
        ))
      )}
    </View>
  );
}
