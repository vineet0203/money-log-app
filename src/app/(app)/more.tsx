import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../../store/authStore';
import { useUser } from '../../api/users';
import UserCard from '../../components/morescreen/UserCard';
import SettingsItem from '../../components/morescreen/SettingsItem';
import { getBackendUrl } from '../../store/authStore';

export default function More() {
  const { logout } = useAuthStore();
  const { data: user } = useUser();
  const router = useRouter();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const profileImageUrl = user?.profile_image_url ? `${getBackendUrl()}${user.profile_image_url}` : undefined;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.push('/profile')}
          className="mt-2 mb-6"
        >
          <UserCard 
            name={user?.name || "User"} 
            email={user?.email || user?.phone_number || "No email"}
            avatarUrl={profileImageUrl}
          />
        </TouchableOpacity>

        {/* Settings List */}
        <View className="bg-white border-y border-slate-100 mb-6">
          <SettingsItem 
            iconName="pie-chart-outline" 
            title="Reports & Analytics" 
            onPress={() => router.push('/reports')}
          />
          <SettingsItem 
            iconName="person-outline" 
            title="My Profile" 
            onPress={() => router.push('/profile')}
          />
          <SettingsItem 
            iconName="calendar-outline" 
            title="Renewal Reminders" 
            onPress={() => router.push('/bills')}
          />
          <SettingsItem 
            iconName="layers-outline" 
            title="Categories & Budgets" 
            onPress={() => router.push('/categories')}
          />
          <SettingsItem 
            iconName="notifications-outline" 
            title="Notification Settings" 
            onPress={() => router.push('/notification-settings')}
          />
          <SettingsItem 
            iconName="shield-checkmark-outline" 
            title="Privacy Policy" 
            onPress={() => WebBrowser.openBrowserAsync('https://moneylog.com/privacy-policy')}
          />
          <SettingsItem 
            iconName="log-out-outline" 
            title="Logout" 
            isDestructive={true} 
            onPress={() => setLogoutModalVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100">
            {/* Header Icon */}
            <View className="w-14 h-14 rounded-2xl bg-rose-50 items-center justify-center mx-auto mb-4 border border-rose-100">
              <Ionicons name="log-out-outline" size={28} color="#E11D48" />
            </View>

            <Text className="text-lg font-black text-slate-900 text-center mb-1.5">
              Log Out?
            </Text>
            <Text className="text-xs text-slate-500 font-medium text-center mb-6 leading-relaxed">
              Are you sure you want to sign out of your account? You will need to sign in again to access your finances.
            </Text>

            {/* Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setLogoutModalVisible(false)}
                className="flex-1 py-3.5 rounded-xl bg-slate-100 items-center justify-center active:bg-slate-200"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-bold text-slate-700">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setLogoutModalVisible(false);
                  logout();
                }}
                className="flex-1 py-3.5 rounded-xl bg-rose-600 items-center justify-center shadow-sm shadow-rose-600/30 active:bg-rose-700"
                activeOpacity={0.85}
              >
                <Text className="text-sm font-bold text-white">Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
