import { Tabs, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  const TabIcon = ({ name, focused, color }: { name: any, focused: boolean, color: string }) => (
    <View className="items-center justify-center w-16 h-full">
      {focused && (
        <View className="absolute top-[-8] w-8 h-[3px] bg-primary rounded-b-md" />
      )}
      <Ionicons name={focused ? name : `${name}-outline`} size={24} color={color} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6BCB77',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F8FAFC',
          height: 65 + insets.bottom,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: (props) => <TabIcon name="home" {...props} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: (props) => <TabIcon name="business" {...props} />,
        }}
      />
      <Tabs.Screen
        name="pay"
        options={{
          title: 'Pay',
          tabBarIcon: ({ focused }) => (
            <View className="absolute top-[-24] bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-primary/40 border-4 border-white">
              <Ionicons name="qr-code-outline" size={28} color="#FFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: (props) => <TabIcon name="pie-chart" {...props} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: (props) => <TabIcon name="grid" {...props} />,
        }}
      />
    </Tabs>
  );
}
