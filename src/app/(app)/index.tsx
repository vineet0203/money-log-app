import { View, ScrollView } from 'react-native';
import Header from '../../components/common/Header';
import BalanceCard from '../../components/homepage/BalanceCard';
import IncomeExpenseCards from '../../components/homepage/IncomeExpenseCards';
import BudgetProgressCard from '../../components/homepage/BudgetProgressCard';
import RecentTransactions from '../../components/homepage/RecentTransactions';
import UpcomingBills from '../../components/homepage/UpcomingBills';
import ActiveSubscriptions from '../../components/homepage/ActiveSubscriptions';

export default function Home() {
  return (
    <View className="flex-1 bg-background">
      <Header title="Hi, Alex 👋" />
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <BalanceCard />
        <IncomeExpenseCards />
        <BudgetProgressCard />
        <RecentTransactions />
        <UpcomingBills />
        <ActiveSubscriptions />
      </ScrollView>
    </View>
  );
}
