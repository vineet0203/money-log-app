import { useEffect } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';
import Constants, { ExecutionEnvironment } from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const { token: authToken } = useAuthStore();

  useEffect(() => {
    if (!authToken) return; // Only register if user is logged in

    // 1. Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        apiClient.put('/api/users/push-token', { token }).catch(console.error);
      }
    });

    // 2. Sync local timezone to backend
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      apiClient.put('/api/users/profile', { timezone: tz }).catch(console.error);
    } catch (err) {
      console.error('Error fetching timezone', err);
    }

  }, [authToken]);

  async function registerForPushNotificationsAsync() {
    let token;

    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (isExpoGo && Platform.OS === 'android') {
      console.log('Skipping push notification registration on Expo Go (Android) as it is no longer supported.');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6BCB77',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      // Get the Expo Push Token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id-from-app-json' // Using default since we didn't setup eas.json strictly yet
      }).catch((e) => {
        // Sometimes projectId requires eas setup. A fallback
        return Notifications.getExpoPushTokenAsync();
      });
      
      token = tokenData?.data;
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }
}
