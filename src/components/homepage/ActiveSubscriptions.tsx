import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useDataStore } from '../../store/dataStore';
import SubscriptionCard from '../cards/SubscriptionCard';
import EmptyState from '../common/EmptyState';

export default function ActiveSubscriptions() {
  const subscriptionsData = useDataStore((state) => state.subscriptions);

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center mb-4 px-2">
        <Text className="text-xl font-bold text-text">Active Subscriptions</Text>
        <TouchableOpacity onPress={() => router.push('/subscriptions')}>
          <Text className="text-primary font-semibold text-sm">See all</Text>
        </TouchableOpacity>
      </View>
      
      {subscriptionsData.length === 0 ? (
        <EmptyState 
          iconName="repeat-outline" 
          title="No Subscriptions" 
          message="You aren't tracking any active subscriptions right now." 
        />
      ) : (
        subscriptionsData.slice(0, 3).map((sub) => (
          <SubscriptionCard key={sub.id} sub={sub} />
        ))
      )}
    </View>
  );
}
