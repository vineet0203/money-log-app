import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import Header from '../../components/common/Header';

const menuItems = [
  { id: '1', icon: 'person-outline', title: 'Profile', route: '/settings/profile' },
  { id: '2', icon: 'card-outline', title: 'Payment Methods', route: '/settings/payment-methods' },
  { id: '3', icon: 'notifications-outline', title: 'Notifications', route: '/settings/notifications' },
  { id: '4', icon: 'shield-checkmark-outline', title: 'Security', route: '/settings/security' },
  { id: '5', icon: 'help-circle-outline', title: 'Help & Support', route: '/settings/help-support' },
  { id: '6', icon: 'people-outline', title: 'Invite Friends', route: '/settings/invite-friends' },
  { id: '7', icon: 'settings-outline', title: 'Settings', route: '/settings/settings' },
];

export default function More() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(false);
    logout();
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="More" />

      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => router.push(item.route as any)}
            className="flex-row items-center justify-between bg-white p-5 rounded-2xl mb-3 shadow-sm shadow-slate-200 border border-slate-100"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mr-4 border border-slate-100">
                <Ionicons name={item.icon as any} size={20} color="#334155" />
              </View>
              <Text className="text-slate-800 font-bold text-base">{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ))}

        {/* Logout Item */}
        <TouchableOpacity 
          onPress={() => setLogoutModalVisible(true)}
          className="flex-row items-center justify-between bg-white p-5 rounded-2xl mt-4 mb-10 shadow-sm shadow-slate-200 border border-slate-100"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-4 border border-red-100">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text className="text-red-500 font-bold text-base">Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <Pressable className="absolute inset-0" onPress={() => setLogoutModalVisible(false)} />
          <View className="bg-white rounded-3xl p-6 w-full shadow-2xl relative z-10">
            <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center self-center mb-4 border-4 border-white shadow-sm shadow-slate-200">
              <Ionicons name="log-out" size={28} color="#EF4444" />
            </View>
            
            <Text className="text-xl font-bold text-slate-800 text-center mb-2">Log Out</Text>
            <Text className="text-slate-500 text-center mb-8 px-4">
              Are you sure you want to log out of your account? You will need to log back in to access your finances.
            </Text>

            <View className="flex-row items-center justify-between">
              <TouchableOpacity 
                onPress={() => setLogoutModalVisible(false)}
                className="flex-1 bg-slate-100 py-4 rounded-2xl items-center mr-2"
              >
                <Text className="text-slate-600 font-bold text-base">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleLogout}
                className="flex-1 bg-red-500 py-4 rounded-2xl items-center ml-2 shadow-sm shadow-red-200"
              >
                <Text className="text-white font-bold text-base">Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
