import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';

export default function NotificationsScreen() {
  // Placeholder mock data
  const MOCK_NOTIFICATIONS = [
    {
      id: '1',
      title: 'Netflix Subscription Due',
      message: 'Your Netflix subscription of $15.99 is due tomorrow.',
      date: 'Just now',
      type: 'warning',
      read: false,
    },
    {
      id: '2',
      title: 'Salary Received',
      message: 'Awesome! You just received your salary of $4,500.00.',
      date: '2 hours ago',
      type: 'success',
      read: true,
    },
    {
      id: '3',
      title: 'Budget Alert',
      message: "You've used 90% of your Food & Dining budget.",
      date: 'Yesterday',
      type: 'alert',
      read: true,
    }
  ];

  return (
    <View className="flex-1 bg-white">
      <Header title="Notifications" showBack={true} />
      
      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View className={`flex-row p-4 mb-3 rounded-2xl border ${item.read ? 'bg-white border-slate-100' : 'bg-primary/5 border-primary/20'}`}>
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
              item.type === 'success' ? 'bg-green-100' : 
              item.type === 'warning' ? 'bg-orange-100' : 
              'bg-red-100'
            }`}>
              <Ionicons 
                name={
                  item.type === 'success' ? 'cash' : 
                  item.type === 'warning' ? 'calendar' : 
                  'warning'
                } 
                size={24} 
                color={
                  item.type === 'success' ? '#10B981' : 
                  item.type === 'warning' ? '#F59E0B' : 
                  '#EF4444'
                } 
              />
            </View>
            <View className="flex-1 justify-center">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-extrabold text-text flex-1">{item.title}</Text>
                <Text className="text-xs text-textMuted">{item.date}</Text>
              </View>
              <Text className="text-sm text-textMuted leading-5">{item.message}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
