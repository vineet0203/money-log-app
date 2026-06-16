import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import WelcomeCard from '../../components/homescreen/WelcomeCard';
import StatsCard from '../../components/homescreen/StatsCard';
import SubscriptionCard from '../../components/cards/SubscriptionCard';
import AccountCard from '../../components/cards/AccountCard';
import BillCard from '../../components/cards/BillCard';
import { Subscription, Account, Bill } from '../../types';

const DUMMY_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    price: 15.99,
    billingCycle: 'monthly',
    iconName: 'play',
    iconBgColor: 'bg-red-600',
    nextBillingDate: 'Oct 24'
  },
  {
    id: '2',
    name: 'Spotify',
    price: 9.99,
    billingCycle: 'monthly',
    iconName: 'musical-notes',
    iconBgColor: 'bg-green-500',
    nextBillingDate: 'Oct 28'
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    price: 54.99,
    billingCycle: 'monthly',
    iconName: 'color-palette',
    iconBgColor: 'bg-blue-600',
    nextBillingDate: 'Nov 02'
  }
];

const DUMMY_ACCOUNTS: Account[] = [
  {
    id: '1',
    name: 'Chase Checking',
    last4: '4589',
    balance: 5420.50,
    logoName: 'card',
    logoBgColor: 'bg-blue-700'
  },
  {
    id: '2',
    name: 'Wells Fargo Savings',
    last4: '1102',
    balance: 12500.00,
    logoName: 'business',
    logoBgColor: 'bg-red-700'
  },
  {
    id: '3',
    name: 'PayPal Wallet',
    last4: 'paypal',
    balance: 340.25,
    logoName: 'logo-paypal',
    logoBgColor: 'bg-blue-600'
  }
];

const DUMMY_BILLS: Bill[] = [
  {
    id: '1',
    name: 'Electricity Bill',
    amount: 145.20,
    dueDate: 'Oct 28',
    status: 'upcoming',
    iconName: 'flash',
    iconBgColor: 'bg-orange-500'
  },
  {
    id: '2',
    name: 'Internet (Comcast)',
    amount: 89.99,
    dueDate: 'Oct 30',
    status: 'upcoming',
    iconName: 'wifi',
    iconBgColor: 'bg-blue-500'
  },
  {
    id: '3',
    name: 'Car Insurance',
    amount: 210.00,
    dueDate: 'Nov 05',
    status: 'upcoming',
    iconName: 'car',
    iconBgColor: 'bg-red-600'
  }
];

export default function Home() {
  const { phoneNumber } = useAuthStore();
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeCard name={phoneNumber || "User"} />
        
        <StatsCard 
          balance={18260.75} 
          income={3200.00} 
          expense={1450.75} 
        />
        
        {/* My Accounts Section */}
        <View className="flex-row justify-between items-end mt-6 mb-3">
          <Text className="text-lg font-extrabold text-text">My Accounts</Text>
          <TouchableOpacity onPress={() => router.push('/accounts')}>
            <Text className="text-primary font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {DUMMY_ACCOUNTS.slice(0, 3).map(account => (
          <AccountCard 
            key={account.id} 
            account={account} 
            onPress={(acc) => router.push(`/account/${acc.id}`)}
          />
        ))}

        {/* Upcoming Bills Section */}
        <View className="flex-row justify-between items-end mt-6 mb-3">
          <Text className="text-lg font-extrabold text-text">Upcoming Bills</Text>
          <TouchableOpacity onPress={() => router.push('/bills')}>
            <Text className="text-primary font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {DUMMY_BILLS.map(bill => (
          <BillCard key={bill.id} bill={bill} />
        ))}
        
        {/* Subscriptions Section Header */}
        <View className="flex-row justify-between items-end mt-6 mb-3">
          <Text className="text-lg font-extrabold text-text">Active Subscriptions</Text>
          <TouchableOpacity onPress={() => router.push('/subscriptions')}>
            <Text className="text-primary font-bold text-sm">See All</Text>
          </TouchableOpacity>
        </View>

        {/* Subscriptions List (Top 3) */}
        {DUMMY_SUBSCRIPTIONS.slice(0, 3).map((sub) => (
          <SubscriptionCard 
            key={sub.id} 
            subscription={sub} 
            onPress={(s) => router.push(`/subscription/${s.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
