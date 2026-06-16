import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import CustomSwitch from '../components/common/CustomSwitch';

export default function NotificationsScreen() {
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

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
                <Text className="text-xs font-medium text-slate-400 mt-1">Receive text messages for bills</Text>
              </View>
            </View>
            <CustomSwitch 
              value={smsEnabled} 
              onValueChange={setSmsEnabled} 
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
                <Text className="text-xs font-medium text-slate-400 mt-1">Weekly summaries & statements</Text>
              </View>
            </View>
            <CustomSwitch 
              value={emailEnabled} 
              onValueChange={setEmailEnabled} 
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
                <Text className="text-xs font-medium text-slate-400 mt-1">Real-time alerts on your device</Text>
              </View>
            </View>
            <CustomSwitch 
              value={pushEnabled} 
              onValueChange={setPushEnabled} 
            />
          </View>

        </View>

        <Text className="text-xs text-slate-400 font-medium text-center px-4 leading-5">
          By enabling SMS and Email alerts, you agree to receive automated notifications regarding your accounts and subscriptions. Carrier rates may apply.
        </Text>

      </ScrollView>
    </View>
  );
}
