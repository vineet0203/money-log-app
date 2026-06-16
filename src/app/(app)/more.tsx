import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import UserCard from '../../components/morescreen/UserCard';
import SettingsItem from '../../components/morescreen/SettingsItem';

export default function More() {
  const { phoneNumber, logout } = useAuthStore();
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View className="mt-2 mb-6">
          <UserCard 
            name="John Doe" 
            email={phoneNumber || "john.doe@email.com"} 
          />
        </View>

        {/* Settings List */}
        <View className="bg-white border-y border-slate-100 mb-6">
          <SettingsItem iconName="person-outline" title="Profile" />
          <SettingsItem 
            iconName="wallet-outline" 
            title="Accounts" 
            onPress={() => router.push('/accounts')}
          />
          <SettingsItem 
            iconName="repeat-outline" 
            title="Subscriptions" 
            onPress={() => router.push('/subscriptions')}
          />
          <SettingsItem 
            iconName="notifications-outline" 
            title="Notifications" 
            onPress={() => router.push('/notifications')}
          />
          <SettingsItem 
            iconName="calendar-outline" 
            title="Bills & Reminders" 
            onPress={() => router.push('/bills')}
          />
          <SettingsItem 
            iconName="layers-outline" 
            title="Categories and Budgets" 
            onPress={() => router.push('/categories')}
          />
          <SettingsItem iconName="help-circle-outline" title="Help & Support" />
          <SettingsItem 
            iconName="log-out-outline" 
            title="Logout" 
            isDestructive={true} 
            onPress={logout}
          />
        </View>
      </ScrollView>
    </View>
  );
}
