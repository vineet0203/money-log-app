import { Tabs, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Header from '../../components/common/Header';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  const TabIcon = ({ name, focused, color }: { name: any, focused: boolean, color: string }) => (
    <View className="items-center justify-center w-16 h-full">
      {focused && (
        <View className="absolute top-[-8] w-8 h-[3px] bg-[#159A1D] rounded-b-md" />
      )}
      <Ionicons name={focused ? name : `${name}-outline`} size={24} color={color} />
    </View>
  );

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        backBehavior="history"
        screenOptions={{
        headerShown: true,
        header: ({ options }) => <Header title={options.title || 'App'} />,
        tabBarActiveTintColor: '#159A1D',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
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
        name="transactions"
        options={{
          title: 'Income & Expenses',
          tabBarIcon: (props) => <TabIcon name="wallet" {...props} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Subscriptions',
          tabBarIcon: (props) => <TabIcon name="repeat" {...props} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: (props) => <TabIcon name="menu" {...props} />,
        }}
      />
    </Tabs>
    </>
  );
}
