import { useEffect } from 'react';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';
import Constants, { ExecutionEnvironment } from 'expo-constants';

let Notifications: any = null;
try {
  const isExpoGoAndroid = Constants.executionEnvironment === ExecutionEnvironment.StoreClient && Platform.OS === 'android';
  if (!isExpoGoAndroid) {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } else {
    console.log('Skipping expo-notifications import on Expo Go (Android) due to SDK 53 limitation.');
  }
} catch (e) {
  console.warn('Could not initialize expo-notifications:', e);
}

export function usePushNotifications() {
  const { token: authToken } = useAuthStore();

  useEffect(() => {
    if (!authToken) return; // Only register if user is logged in

    // 1. Register for push notifications
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        await AsyncStorage.setItem("pushToken", token);
        apiClient.put('users/push-token', { token }).catch(console.error);
      }
    });

    // 2. Sync local timezone to backend
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      apiClient.put('users/profile', { timezone: tz }).catch(console.error);
    } catch (err) {
      console.error('Error fetching timezone', err);
    }

  }, [authToken]);

  async function registerForPushNotificationsAsync() {
    let token;

    if (!Notifications) {
      console.log('Push notifications are not supported in this environment.');
      return;
    }

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
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      ).catch((e: any) => {
        return Notifications.getExpoPushTokenAsync();
      });
      
      token = tokenData?.data;
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }
}
