import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CompleteProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeProfile = useAuthStore((state) => state.completeProfile);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera roll access to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

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

    let dataToSubmit: any = { name: name.trim(), email: email.trim() };

    if (profileImageUri) {
      const formData = new FormData() as any;
      formData.append('name', name.trim());
      formData.append('email', email.trim());

      const filename = profileImageUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const typeMatch = match ? `image/${match[1]}` : `image`;

      formData.append('profile_image', {
        uri: profileImageUri,
        name: filename,
        type: typeMatch,
      });
      
      dataToSubmit = formData;
    }

    const result = await completeProfile(dataToSubmit);
    setIsLoading(false);

    if (result.success) {
      router.replace('/(app)');
    } else {
      Alert.alert('Error', result.error || 'Failed to save profile. Email might already be in use.');
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white" 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingTop: insets.top, paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header Icon */}
        <View className="items-center mt-10 mb-6">
          <TouchableOpacity 
            onPress={handlePickImage}
            activeOpacity={0.8}
            className="relative"
          >
            <View className="w-28 h-28 bg-primary/10 rounded-full items-center justify-center mb-2 overflow-hidden border-4 border-slate-50">
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Ionicons name="person-add" size={40} color="#6BCB77" />
              )}
            </View>
            <View className="absolute bottom-2 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        <Text className="text-3xl font-extrabold text-slate-800 mb-2 text-center">Complete Profile</Text>
        <Text className="text-base text-slate-500 mb-10 text-center">
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

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
