import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../components/common/Header';
import CustomSwitch from '../components/common/CustomSwitch';
import { useUser, useUpdateUser } from '../api/users';

export default function NotificationSettingsScreen() {
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
    try {
      await updateUser.mutateAsync({ global_sms_enabled: val });
    } catch {
      setSmsEnabled(!val);
      Alert.alert('Error', 'Failed to update SMS notification settings.');
    }
  };

  const handleToggleEmail = async (val: boolean) => {
    if (val && (!user || !user.email)) {
      Alert.alert(
        'Email Required',
        'You must register an email address to your profile to enable email notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Email', onPress: () => router.push('/profile') },
        ]
      );
      return;
    }

    setEmailEnabled(val);
    try {
      await updateUser.mutateAsync({ global_email_enabled: val });
    } catch {
      setEmailEnabled(!val);
      Alert.alert('Error', 'Failed to update Email notification settings.');
    }
  };

  const handleTogglePush = async (val: boolean) => {
    setPushEnabled(val);
    try {
      await updateUser.mutateAsync({ global_push_enabled: val });
    } catch {
      setPushEnabled(!val);
      Alert.alert('Error', 'Failed to update push notification settings.');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#159A1D" />
        <Text className="text-slate-400 font-medium text-xs mt-3">Loading settings...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Notification Settings" showBack={true} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. SYSTEM NOTIFICATIONS BANNER (Matching Web) */}
        <View className="bg-emerald-50/70 rounded-3xl p-4 border border-emerald-200/80 mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-3">
            <View className="w-11 h-11 rounded-2xl bg-[#159A1D]/15 items-center justify-center mr-3">
              <Ionicons name="notifications" size={20} color="#159A1D" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-0.5">
                <Text className="text-sm font-extrabold text-slate-900">
                  System Notifications
                </Text>
                <View className="bg-[#159A1D] px-1.5 py-0.2 rounded-full">
                  <Text className="text-[9px] font-bold text-white uppercase">Active</Text>
                </View>
              </View>
              <Text className="text-[11px] font-medium text-emerald-900/80 leading-snug">
                In-app alerts and renewal notices are always recorded to your Notification Center.
              </Text>
            </View>
          </View>

          <View className="bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
            <Text className="text-[10px] font-extrabold text-[#159A1D]">Always On</Text>
          </View>
        </View>

        {/* 2. EXTERNAL DELIVERY ALERT CHANNELS SECTION */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
            External Delivery Alert Channels
          </Text>

          <View className="bg-white rounded-3xl p-2 border border-slate-100 shadow-sm shadow-slate-100">
            {/* SMS Alerts */}
            <View className="flex-row justify-between items-center py-3.5 px-3 border-b border-slate-50">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-10 h-10 rounded-2xl bg-blue-50 items-center justify-center mr-3">
                  <Ionicons name="chatbubbles-outline" size={18} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">SMS Alerts</Text>
                  <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Real-time SMS alerts to your phone
                  </Text>
                </View>
              </View>
              <CustomSwitch
                value={smsEnabled}
                onValueChange={handleToggleSms}
              />
            </View>

            {/* Email Alerts */}
            <View className="flex-row justify-between items-center py-3.5 px-3 border-b border-slate-50">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-10 h-10 rounded-2xl bg-orange-50 items-center justify-center mr-3">
                  <Ionicons name="mail-outline" size={18} color="#EA580C" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Email Alerts</Text>
                  <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Renewal notices delivered to your inbox
                  </Text>
                </View>
              </View>
              <CustomSwitch
                value={emailEnabled}
                onValueChange={handleToggleEmail}
              />
            </View>

            {/* Push Notifications */}
            <View className="flex-row justify-between items-center py-3.5 px-3">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-10 h-10 rounded-2xl bg-purple-50 items-center justify-center mr-3">
                  <Ionicons name="notifications-outline" size={18} color="#7C3AED" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">Push Notifications</Text>
                  <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Instant alerts on your mobile device
                  </Text>
                </View>
              </View>
              <CustomSwitch
                value={pushEnabled}
                onValueChange={handleTogglePush}
              />
            </View>
          </View>
        </View>

        {/* 3. INFORMATIVE FOOTER NOTE (Matching Web) */}
        <View className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
          <View className="flex-row items-start gap-2">
            <Ionicons name="information-circle-outline" size={16} color="#64748B" className="mt-0.5" />
            <Text className="flex-1 text-xs text-slate-500 font-medium leading-relaxed">
              <Text className="font-bold text-slate-700">Note:</Text> These are global delivery
              settings. In-app notifications are always preserved in your Notification Center
              regardless of external delivery channel toggles.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
