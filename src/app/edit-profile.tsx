import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/common/Header';
import { useUser, useUpdateUser } from '../api/users';
import { getBackendUrl } from '../store/authStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useUser();
  const updateUser = useUpdateUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

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
    if (!name.trim()) {
      Alert.alert('Required', 'Name cannot be empty.');
      return;
    }

    try {
      if (profileImageUri) {
        // Upload with image
        const formData = new FormData() as any;
        formData.append('name', name);
        formData.append('email', email);

        const filename = profileImageUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const typeMatch = match ? `image/${match[1]}` : `image`;

        formData.append('profile_image', {
          uri: profileImageUri,
          name: filename,
          type: typeMatch,
        });

        await updateUser.mutateAsync(formData);
      } else {
        // Just JSON update
        await updateUser.mutateAsync({ name, email });
      }

      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile.');
    }
  };

  if (isUserLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6BCB77" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header title="Edit Profile" showBack={true} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Profile Image Picker */}
        <View className="items-center mb-8 mt-4">
          <TouchableOpacity 
            onPress={handlePickImage}
            activeOpacity={0.8}
            className="relative"
          >
            <View className="w-28 h-28 rounded-full bg-slate-100 items-center justify-center overflow-hidden border-4 border-slate-50">
              {profileImageUri ? (
                <Image source={{ uri: profileImageUri }} className="w-full h-full" resizeMode="cover" />
              ) : user?.profile_image_url ? (
                <Image source={{ uri: `${getBackendUrl()}${user.profile_image_url}` }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Ionicons name="person" size={48} color="#94A3B8" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-600 mb-2 font-semibold ml-1">Full Name</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-5 text-gray-800 text-base font-bold"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-gray-600 mb-2 font-semibold ml-1">Email Address</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-8 text-gray-800 text-base font-bold"
          placeholder="john@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity 
          className="bg-primary py-4 rounded-full items-center shadow-sm shadow-primary/30"
          onPress={handleSave}
          disabled={updateUser.isPending}
        >
          {updateUser.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-lg tracking-wide">Save Changes</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
