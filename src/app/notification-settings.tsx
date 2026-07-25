import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../components/common/Header';
import CustomSwitch from '../components/common/CustomSwitch';
import { useUser, useUpdateUser } from '../api/users';

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: user, isLoading } = useUser();
  const updateUser = useUpdateUser();

  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      setSmsEnabled(!!user.global_sms_enabled);
      setEmailEnabled(!!user.global_email_enabled);
      setPushEnabled(!!user.global_push_enabled);
    }
  }, [user]);

  const handleToggleSms = async (val: boolean) => {
    setSmsEnabled(val);
    await updateUser.mutateAsync({ global_sms_enabled: val });
  };

  const handleToggleEmail = async (val: boolean) => {
    if (val && (!user || !user.email)) {
      Alert.alert(
        "Email Required", 
        "You must add an email address to your profile to enable global email notifications.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Email", onPress: () => router.push('/edit-profile') }
        ]
      );
      return;
    }
    
    setEmailEnabled(val);
    await updateUser.mutateAsync({ global_email_enabled: val });
  };

  const handleTogglePush = async (val: boolean) => {
    setPushEnabled(val);
    await updateUser.mutateAsync({ global_push_enabled: val });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#6BCB77" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Notification Settings" showBack={true} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        
        <View className="bg-white rounded-3xl p-2 mb-6 shadow-sm shadow-slate-100 border border-slate-100">
          
          {/* SMS Alerts */}
          <View className="flex-row justify-between items-center py-4 px-3 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-base font-bold text-slate-800">SMS Alerts</Text>
                <Text className="text-xs text-slate-400 mt-0.5">Real-time SMS alerts on your device</Text>
              </View>
            </View>
            <CustomSwitch 
              value={smsEnabled} 
              onValueChange={handleToggleSms} 
            />
          </View>

          {/* Email Alerts */}
          <View className="flex-row justify-between items-center py-4 px-3 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mr-3">
                <Ionicons name="mail-outline" size={20} color="#F97316" />
              </View>
              <View>
                <Text className="text-base font-bold text-slate-800">Email Alerts</Text>
                <Text className="text-xs text-slate-400 mt-0.5">Real-time Email alerts to your inbox</Text>
              </View>
            </View>
            <CustomSwitch 
              value={emailEnabled} 
              onValueChange={handleToggleEmail} 
            />
          </View>

          {/* Push Notifications */}
          <View className="flex-row justify-between items-center py-4 px-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={20} color="#A855F7" />
              </View>
              <View>
                <Text className="text-base font-bold text-slate-800">Push Notifications</Text>
                <Text className="text-xs text-slate-400 mt-0.5">Real-time push alerts on your device</Text>
              </View>
            </View>
            <CustomSwitch 
              value={pushEnabled} 
              onValueChange={handleTogglePush} 
            />
          </View>

        </View>

        <View className="px-6 mt-8 mb-8">
          <View className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <Text className="text-xs text-slate-500 text-center leading-relaxed">
              <Text className="font-bold text-slate-600">Note:</Text> These are global settings. Even after enabling them here, you must also configure notification preferences for each individual subscription to receive its alerts. Carrier rates may apply.
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
