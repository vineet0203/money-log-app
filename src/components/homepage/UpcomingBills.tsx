import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useDataStore } from '../../store/dataStore';
import BillCard from '../cards/BillCard';
import EmptyState from '../common/EmptyState';

export default function UpcomingBills() {
  const billsData = useDataStore((state) => state.bills);

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4 px-2">
        <Text className="text-xl font-bold text-text">Upcoming Bills</Text>
        <TouchableOpacity onPress={() => router.push('/bills')}>
          <Text className="text-primary font-semibold text-sm">See all</Text>
        </TouchableOpacity>
      </View>
      
      {billsData.length === 0 ? (
        <EmptyState 
          iconName="calendar-outline" 
          title="No Bills" 
          message="You have no upcoming bills scheduled." 
        />
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="pl-2 pb-4"
        >
          {billsData.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
          <View className="w-4" />
        </ScrollView>
      )}
    </View>
  );
}
