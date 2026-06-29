import { Tabs, Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Header from '../../components/common/Header';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isProfileComplete = useAuthStore((state) => state.isProfileComplete);
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  if (!isProfileComplete) {
    return <Redirect href="/(auth)/complete-profile" />;
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
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
        headerShown: true,
        header: ({ options }) => <Header title={options.title || 'App'} />,
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
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: (props) => <TabIcon name="list" {...props} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ focused }) => (
            <View className="absolute top-[-24] bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-primary/40 border-4 border-white">
              <Ionicons name="add" size={32} color="#FFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: (props) => <TabIcon name="pie-chart" {...props} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: (props) => <TabIcon name="settings" {...props} />,
        }}
      />
    </Tabs>
    </>
  );
}
