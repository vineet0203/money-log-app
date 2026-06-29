import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeProfile = useAuthStore((state) => state.completeProfile);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing Fields', 'Please provide both your name and email to continue.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const success = await completeProfile(name.trim(), email.trim());
    setIsLoading(false);

    if (success) {
      router.replace('/(app)');
    } else {
      Alert.alert('Error', 'Failed to save profile. Email might already be in use.');
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-1 px-6 pt-10">
        
        {/* Header Icon */}
        <View className="w-16 h-16 bg-primary/10 rounded-2xl items-center justify-center mb-6">
          <Ionicons name="person-add" size={32} color="#6BCB77" />
        </View>

        <Text className="text-3xl font-extrabold text-slate-800 mb-2">Complete Profile</Text>
        <Text className="text-base text-slate-500 mb-10">
          Almost there! We just need a few details to finish setting up your account.
        </Text>

        {/* Name Input */}
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name *</Text>
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mb-6">
          <Ionicons name="person-outline" size={20} color="#94A3B8" className="mr-3" />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor="#94A3B8"
            className="flex-1 text-base font-bold text-slate-800 ml-2"
            autoCapitalize="words"
          />
        </View>

        {/* Email Input */}
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address *</Text>
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mb-10">
          <Ionicons name="mail-outline" size={20} color="#94A3B8" className="mr-3" />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="john@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            className="flex-1 text-base font-bold text-slate-800 ml-2"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.8}
          className="bg-primary rounded-full py-4 items-center shadow-sm shadow-primary/30"
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white font-extrabold text-lg tracking-wide">Continue to App</Text>
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
}
