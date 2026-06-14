import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataStore } from '../store/dataStore';
import SubscriptionCard from '../components/cards/SubscriptionCard';
import EmptyState from '../components/common/EmptyState';

export default function SubscriptionsList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const subscriptionsData = useDataStore((state) => state.subscriptions);

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
        <Text className="font-bold text-lg text-text">Subscriptions</Text>
        <TouchableOpacity className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
          <Ionicons name="add" size={24} color="#6BCB77" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {subscriptionsData.length === 0 ? (
          <EmptyState 
            iconName="repeat-outline" 
            title="No Subscriptions" 
            message="You aren't tracking any active subscriptions. Add one to see it here." 
          />
        ) : (
          subscriptionsData.map((sub) => (
            <SubscriptionCard key={sub.id} sub={sub} />
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
