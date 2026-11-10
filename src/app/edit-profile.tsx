import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/common/Header';
import { useUser, useUpdateUser } from '../api/users';
import { getBackendUrl } from '../store/authStore';
import PhoneInputField, {
  PhoneInputFieldRef,
} from '../components/fields/PhoneInputField';

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useUser();
  const updateUser = useUpdateUser();
  const phoneInputRef = useRef<PhoneInputFieldRef>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone_number || '');
      setFormattedPhone(user.phone_number || '');
    }
  }, [user]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow camera roll access to upload a profile picture.'
      );
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

    if (
      phone &&
      phoneInputRef.current &&
      !phoneInputRef.current.isValidNumber(phone)
    ) {
      Alert.alert(
        'Invalid Phone',
        'Please enter a valid phone number for the selected country.'
      );
      return;
    }

    try {
      const phoneNumberToSave = formattedPhone || phone;

      if (profileImageUri) {
        const formData = new FormData() as any;
        formData.append('name', name.trim());
        if (phoneNumberToSave) {
          formData.append('phone_number', phoneNumberToSave);
        }

        const filename = profileImageUri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const typeMatch = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('profile_image', {
          uri: profileImageUri,
          name: filename,
          type: typeMatch,
        });

        await updateUser.mutateAsync(formData);
      } else {
        const payload: any = { name: name.trim() };
        if (phoneNumberToSave) {
          payload.phone_number = phoneNumberToSave;
        }
        await updateUser.mutateAsync(payload);
      }

      router.back();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update profile.'
      );
    }
  };

  if (isUserLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#159A1D" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Header title="Edit Profile" showBack={true} />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image Picker */}
        <View className="items-center mb-8 mt-4">
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.8}
            className="relative"
          >
            <View className="w-28 h-28 rounded-full bg-slate-100 items-center justify-center overflow-hidden border-4 border-slate-50">
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : user?.profile_image_url ? (
                <Image
                  source={{ uri: `${getBackendUrl()}${user.profile_image_url}` }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={48} color="#94A3B8" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-[#159A1D] w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Full Name */}
        <Text className="text-gray-700 mb-2 font-bold ml-1 text-xs uppercase tracking-wider">
          Full Name
        </Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-5 text-gray-800 text-base font-semibold"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
        />

        {/* Email Address (Locked Primary ID) */}
        <View className="flex-row items-center justify-between mb-2 ml-1">
          <Text className="text-gray-700 font-bold text-xs uppercase tracking-wider">
            Email Address
          </Text>
          <View className="flex-row items-center bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Ionicons name="shield-checkmark" size={11} color="#159A1D" />
            <Text className="text-[10px] font-bold text-[#159A1D] ml-1">
              Primary ID
            </Text>
          </View>
        </View>
        <View className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 mb-2 flex-row items-center justify-between">
          <Text className="text-slate-600 text-base font-semibold flex-1 mr-2" numberOfLines={1}>
            {user?.email || 'No email registered'}
          </Text>
          <Ionicons name="lock-closed" size={16} color="#94A3B8" />
        </View>
        <Text className="text-slate-400 text-[11px] mb-5 ml-1">
          Your email address is your verified primary login ID and cannot be changed.
        </Text>

        {/* Mobile Phone Number */}
        <Text className="text-gray-700 mb-2 font-bold ml-1 text-xs uppercase tracking-wider">
          Mobile Phone Number
        </Text>
        <PhoneInputField
          ref={phoneInputRef}
          value={phone}
          onChangeText={setPhone}
          onChangeFormattedText={setFormattedPhone}
        />

        <TouchableOpacity
          className="bg-[#159A1D] py-4 rounded-full items-center shadow-md shadow-emerald-600/30 mt-4"
          onPress={handleSave}
          disabled={updateUser.isPending}
        >
          {updateUser.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-lg tracking-wide">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
