import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import Header from '../../components/common/Header';
import NetWorthCard from '../../components/accounts/NetWorthCard';
import AccountGroup from '../../components/accounts/AccountGroup';
import EmptyState from '../../components/common/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../store/dataStore';
import RecentTransactions from '../../components/homepage/RecentTransactions';

export default function Accounts() {
  const cashAccountsData = useDataStore((state) => state.cashAccounts);
  const creditAccountsData = useDataStore((state) => state.creditAccounts);

  const hasNoAccounts = cashAccountsData.length === 0 && creditAccountsData.length === 0;

  return (
    <View className="flex-1 bg-background">
      <Header title="Accounts" />
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <NetWorthCard />
        
        {hasNoAccounts ? (
          <EmptyState 
            iconName="wallet-outline" 
            title="No Accounts Linked" 
            message="Add a bank account or manual cash wallet to start tracking your net worth." 
          />
        ) : (
          <>
            {cashAccountsData.length > 0 && <AccountGroup title="Cash" accounts={cashAccountsData} />}
            {creditAccountsData.length > 0 && <AccountGroup title="Credit Cards" accounts={creditAccountsData} />}
          </>
        )}

        <TouchableOpacity className="flex-row items-center justify-center bg-primary/10 py-4 rounded-2xl mt-2 mb-6 border border-primary/20">
          <Ionicons name="add" size={22} color="#6BCB77" />
          <Text className="text-primary font-bold text-base ml-2">Add New Account</Text>
        </TouchableOpacity>

        <RecentTransactions />
      </ScrollView>
    </View>
  );
}
