import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import dayjs from 'dayjs';
import Header from '../components/common/Header';
import { useUser, useUpdateUser } from '../api/users';
import { getBackendUrl } from '../store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { data: user, isLoading: isUserLoading } = useUser();
  const updateUser = useUpdateUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfileImageUri(null);
      setIsPhotoRemoved(false);
    }
  }, [user]);

  const isDirty =
    Boolean(user) &&
    (name !== (user?.name || '') ||
      email !== (user?.email || '') ||
      profileImageUri !== null ||
      isPhotoRemoved);

  const getInitials = (nameStr?: string | null) => {
    if (!nameStr || !nameStr.trim()) return 'U';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  const handlePickImage = async () => {
    Alert.alert('Profile Photo', 'Choose an option', [
      {
        text: 'Choose from Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow photo library access to upload a picture.');
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
            setIsPhotoRemoved(false);
          }
        },
      },
      {
        text: 'Take Photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            setProfileImageUri(result.assets[0].uri);
            setIsPhotoRemoved(false);
          }
        },
      },
      ...(user?.profile_image_url || profileImageUri
        ? [
            {
              text: 'Remove Photo',
              style: 'destructive' as const,
              onPress: () => {
                setProfileImageUri(null);
                setIsPhotoRemoved(true);
              },
            },
          ]
        : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleReset = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfileImageUri(null);
      setIsPhotoRemoved(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Name cannot be empty.');
      return;
    }

    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
    }

    try {
      if (profileImageUri) {
        const formData = new FormData() as any;
        formData.append('name', name.trim());
        formData.append('email', email.trim());

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
        const payload: any = {
          name: name.trim(),
          email: email.trim(),
        };
        if (isPhotoRemoved) {
          payload.remove_profile_image = true;
        }
        await updateUser.mutateAsync(payload);
      }

      setProfileImageUri(null);
      setIsPhotoRemoved(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile.');
    }
  };

  if (isUserLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#159A1D" />
        <Text className="text-slate-400 font-medium text-xs mt-3">Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-slate-800 font-bold text-base mt-3">Failed to load profile</Text>
      </View>
    );
  }

  const memberSince = (user as any).created_at
    ? dayjs((user as any).created_at).format('MMMM D, YYYY')
    : null;

  const currentDisplayImage = !isPhotoRemoved
    ? profileImageUri || (user.profile_image_url ? `${getBackendUrl()}${user.profile_image_url}` : null)
    : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      className="flex-1 bg-slate-50"
    >
      <Header title="My Profile" showBack={true} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: isDirty ? 160 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TOP IDENTITY HERO CARD (Aligned with Web) */}
        <View className="bg-white rounded-3xl p-6 mb-5 border border-slate-100 shadow-sm shadow-slate-100 items-center">
          {/* Avatar with Camera Overlay */}
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.8}
            className="relative mb-3"
          >
            <View className="w-24 h-24 rounded-full bg-[#159A1D] items-center justify-center overflow-hidden border-4 border-white shadow-sm ring-2 ring-slate-100">
              {currentDisplayImage ? (
                <Image
                  source={{ uri: currentDisplayImage }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-3xl font-black text-white tracking-wider">
                  {getInitials(name || user.name)}
                </Text>
              )}
            </View>

            {/* Camera Badge */}
            <View className="absolute bottom-0 right-0 bg-[#159A1D] w-7 h-7 rounded-full items-center justify-center border-2 border-white shadow-sm">
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7} className="mb-2">
            <Text className="text-xs font-bold text-[#159A1D]">Change Photo</Text>
          </TouchableOpacity>

          {/* User Name & Verified Badge */}
          <View className="flex-row items-center gap-2 mb-1">
            <Text className="text-xl font-extrabold text-slate-900">
              {name || user.name || 'User'}
            </Text>
            <View className="flex-row items-center bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Ionicons name="shield-checkmark" size={11} color="#159A1D" />
              <Text className="text-[10px] font-bold text-[#159A1D] ml-1">Verified</Text>
            </View>
          </View>

          {/* Email / Phone Subtitle */}
          <Text className="text-xs text-slate-500 font-medium mb-1">
            {email || user.email || 'No email registered'} • {user.phone_number}
          </Text>

          {/* Member Since Date */}
          {memberSince && (
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
              <Text className="text-[11px] text-slate-400 font-medium">
                Member since {memberSince}
              </Text>
            </View>
          )}
        </View>

        {/* 2. PERSONAL INFORMATION FORM (Matching Web) */}
        <View className="mb-5">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
            Personal Information
          </Text>

          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-100 space-y-4">
            {/* Full Name Field */}
            <View>
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="person-outline" size={14} color="#64748B" />
                <Text className="text-xs font-bold text-slate-700 ml-1.5">Full Name</Text>
              </View>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
              />
              <Text className="text-[10px] text-slate-400 mt-1 pl-1">
                Your name as displayed across your reports and transactions.
              </Text>
            </View>

            {/* Email Address Field */}
            <View className="pt-2 border-t border-slate-50">
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="mail-outline" size={14} color="#64748B" />
                <Text className="text-xs font-bold text-slate-700 ml-1.5">Email Address</Text>
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
              />
              <Text className="text-[10px] text-slate-400 mt-1 pl-1">
                Used for notification summaries and renewal reminders.
              </Text>
            </View>

            {/* Phone Number Field (Verified Identity - Locked) */}
            <View className="pt-2 border-t border-slate-50">
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center flex-1 mr-2">
                  <Ionicons name="call-outline" size={14} color="#64748B" />
                  <Text className="text-xs font-bold text-slate-700 ml-1.5" numberOfLines={1}>
                    Phone Number
                  </Text>
                </View>
                <View className="flex-row items-center shrink-0">
                  <Ionicons name="checkmark-circle" size={12} color="#159A1D" />
                  <Text className="text-[10px] font-bold text-[#159A1D] ml-1">
                    OTP Primary ID
                  </Text>
                </View>
              </View>
              <View className="bg-slate-100/70 border border-slate-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
                <Text className="text-sm font-bold text-slate-600 font-mono flex-1 mr-2" numberOfLines={1}>
                  {user.phone_number}
                </Text>
                <Ionicons name="lock-closed" size={14} color="#94A3B8" className="shrink-0" />
              </View>
              <Text className="text-[10px] text-slate-400 mt-1 pl-1">
                Your phone number is your secure login credential.
              </Text>
            </View>

            {/* Timezone Preference */}
            <View className="pt-2 border-t border-slate-50">
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="globe-outline" size={14} color="#64748B" />
                <Text className="text-xs font-bold text-slate-700 ml-1.5">Timezone</Text>
              </View>
              <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-slate-800 flex-1 mr-2" numberOfLines={1}>
                  {(user as any).timezone || 'Asia/Kolkata (IST, GMT+05:30)'}
                </Text>
                <Ionicons name="time-outline" size={16} color="#64748B" className="shrink-0" />
              </View>
              <Text className="text-[10px] text-slate-400 mt-1 pl-1">
                Used to evaluate midnight bill schedules and recurring reminders.
              </Text>
            </View>
          </View>
        </View>

        {/* 3. ACCOUNT SECURITY & PREFERENCES CARD (Matching Web) */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
            Account Security & Preferences
          </Text>

          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-100 space-y-3">
            <View className="flex-row items-center justify-between py-2 border-b border-slate-50">
              <Text className="text-xs font-semibold text-slate-500 shrink-0 mr-3">Account Type</Text>
              <Text className="text-xs font-extrabold text-slate-800 text-right flex-1" numberOfLines={1}>
                Single-Tenant Owner
              </Text>
            </View>
            <View className="flex-row items-center justify-between py-2 border-b border-slate-50">
              <Text className="text-xs font-semibold text-slate-500 shrink-0 mr-3">Authentication</Text>
              <Text className="text-xs font-extrabold text-slate-800 text-right flex-1" numberOfLines={1}>
                Two-Factor SMS OTP
              </Text>
            </View>
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-xs font-semibold text-slate-500 shrink-0 mr-3">Account ID</Text>
              <Text className="text-xs font-mono font-bold text-slate-800 text-right flex-1" numberOfLines={1}>
                USR-{String(user.id).padStart(4, '0')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 4. DOCKED SAVE / RESET ACTION ROW (Responsive, smooth, doesn't cause content jump) */}
      {isDirty && (
        <View 
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 22, paddingTop: 14 }}
          className="px-5 bg-white border-t border-slate-200/90 shadow-lg shadow-slate-300 flex-row items-center gap-3"
        >
          <TouchableOpacity
            onPress={handleReset}
            disabled={updateUser.isPending}
            activeOpacity={0.7}
            className="flex-1 bg-slate-100 border border-slate-200 py-3.5 rounded-2xl items-center justify-center flex-row shadow-xs"
          >
            <Ionicons name="refresh-outline" size={16} color="#64748B" />
            <Text className="text-sm font-bold text-slate-600 ml-1.5">Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            disabled={updateUser.isPending}
            activeOpacity={0.8}
            className="flex-2 bg-[#159A1D] py-3.5 rounded-2xl items-center justify-center flex-row shadow-sm shadow-[#159A1D]/30"
          >
            {updateUser.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
                <Text className="text-sm font-extrabold text-white ml-1.5">Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
