import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import { useNotificationsInfinite, useMarkNotificationRead, useMarkAllNotificationsRead } from '../api/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function NotificationsScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = useNotificationsInfinite();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const notifications = data?.pages.flatMap((page) => page.data) || [];

  const handleMarkRead = (id: number, isRead: boolean) => {
    if (!isRead) {
      markRead(id);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Header 
        title="Notifications" 
        showBack={true} 
        rightIcon="checkmark-done"
        onRightPress={() => markAllRead()}
      />
      
      {isLoading && !isRefetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6BCB77" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="notifications-off-outline" size={64} color="#CBD5E1" />
          <Text className="text-lg font-bold text-slate-800 mt-4">No Notifications</Text>
          <Text className="text-sm text-slate-500 text-center mt-2">You don't have any notifications at the moment.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#6BCB77']} />
          }
          onEndReached={() => {
            if (hasNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color="#6BCB77" className="my-4" />
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => handleMarkRead(item.id, !!item.is_read)}
              className={`flex-row p-4 mb-3 rounded-2xl border ${item.is_read ? 'bg-white border-slate-100' : 'bg-primary/5 border-primary/20'}`}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                item.type === 'success' ? 'bg-green-100' : 
                item.type === 'warning' ? 'bg-orange-100' : 
                item.type === 'info' ? 'bg-blue-100' :
                'bg-red-100'
              }`}>
                <Ionicons 
                  name={
                    item.type === 'success' ? 'checkmark-circle' : 
                    item.type === 'warning' ? 'warning' : 
                    item.type === 'info' ? 'information-circle' :
                    'alert-circle'
                  } 
                  size={24} 
                  color={
                    item.type === 'success' ? '#10B981' : 
                    item.type === 'warning' ? '#F59E0B' : 
                    item.type === 'info' ? '#3B82F6' :
                    '#EF4444'
                  } 
                />
              </View>
              <View className="flex-1 justify-center">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className={`font-extrabold flex-1 ${item.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{item.title}</Text>
                  <Text className="text-xs text-slate-400 ml-2">{dayjs(item.created_at).fromNow(true)}</Text>
                </View>
                <Text className={`text-sm leading-5 ${item.is_read ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>{item.message}</Text>
              </View>
              {!item.is_read && (
                <View className="absolute top-4 right-4 w-3 h-3 rounded-full bg-primary" />
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
