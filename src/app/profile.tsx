import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '../components/common/Header';
import { useUser } from '../api/users';
import { getBackendUrl } from '../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useUser();

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#6BCB77" />
      </View>
    );
  }

  if (isError || !user) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-red-500 font-bold">Failed to load profile.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="My Profile" showBack={true} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View className="items-center bg-white rounded-3xl p-8 mb-6 shadow-sm shadow-slate-100 border border-slate-100">
          <View className="w-24 h-24 rounded-full bg-slate-100 items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-sm">
            {user.profile_image_url ? (
              <Image 
                source={{ uri: `${getBackendUrl()}${user.profile_image_url}` }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={40} color="#94A3B8" />
            )}
          </View>
          <Text className="text-2xl font-extrabold text-slate-800 mb-1">{user.name || 'User'}</Text>
          <Text className="text-base font-bold text-slate-400">{user.email || 'No email added'}</Text>
        </View>

        {/* Info Grid */}
        <Text className="text-base font-extrabold text-slate-800 mb-4 ml-1">Personal Information</Text>
        <View className="bg-white rounded-3xl p-5 shadow-sm shadow-slate-100 border border-slate-100 mb-8">
          
          <View className="flex-row justify-between items-center py-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-4">
                <Ionicons name="person-outline" size={18} color="#3B82F6" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Full Name</Text>
            </View>
            <Text className="text-base font-extrabold text-slate-800">{user.name}</Text>
          </View>

          <View className="flex-row justify-between items-center py-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-4">
                <Ionicons name="call-outline" size={18} color="#22C55E" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Phone Number</Text>
            </View>
            <Text className="text-base font-extrabold text-slate-800">{user.phone_number}</Text>
          </View>

          <View className="flex-row justify-between items-center py-4">
            <View className="flex-row items-center mr-4">
              <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-4 flex-shrink-0">
                <Ionicons name="mail-outline" size={18} color="#A855F7" />
              </View>
              <Text className="text-sm font-bold text-slate-500">Email Address</Text>
            </View>
            <Text 
              className={`flex-1 text-right text-base font-extrabold ${user.email ? 'text-slate-800' : 'text-slate-400'}`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.email || 'Not set'}
            </Text>
          </View>

        </View>

      </ScrollView>

      {/* Floating Edit Button (Bottom Right) */}
      <TouchableOpacity 
        onPress={() => router.push('/edit-profile')}
        activeOpacity={0.8}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/40"
      >
        <Ionicons name="pencil" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}
