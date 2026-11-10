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
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import Header from '../components/common/Header';
import { useUser, useUpdateUser } from '../api/users';
import { getBackendUrl, useAuthStore } from '../store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PhoneInputField, {
  PhoneInputFieldRef,
} from '../components/fields/PhoneInputField';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: user, isLoading: isUserLoading } = useUser();
  const updateUser = useUpdateUser();
  const { deleteAccount } = useAuthStore();
  const phoneInputRef = useRef<PhoneInputFieldRef>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);

  // Account Deletion Flow State (Apple Guideline 5.1.1(v))
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone_number || '');
      setFormattedPhone(user.phone_number || '');
      setProfileImageUri(null);
      setIsPhotoRemoved(false);
    }
  }, [user]);

  const isDirty =
    Boolean(user) &&
    (name !== (user?.name || '') ||
      (formattedPhone || phone) !== (user?.phone_number || '') ||
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
      setPhone(user.phone_number || '');
      setFormattedPhone(user.phone_number || '');
      setProfileImageUri(null);
      setIsPhotoRemoved(false);
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://moneylog.com/privacy-policy');
    } catch (e) {
      Alert.alert('Error', 'Unable to open Privacy Policy browser.');
    }
  };

  const handleOpenDeleteModal = () => {
    setDeleteEmailInput('');
    setDeleteError(null);
    setDeleteStep(1);
    setIsDeleteModalVisible(true);
  };

  const handleProceedToConfirmation = () => {
    const trimmedInput = deleteEmailInput.trim().toLowerCase();
    const userEmail = (user?.email || '').trim().toLowerCase();

    if (!trimmedInput) {
      setDeleteError('Please enter your email address to continue.');
      return;
    }

    if (trimmedInput !== userEmail) {
      setDeleteError('Entered email does not match your registered account email.');
      return;
    }

    setDeleteError(null);
    setDeleteStep(2);
  };

  const handleConfirmPermanentDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      const result = await deleteAccount(deleteEmailInput.trim());

      if (result.success) {
        setIsDeleteModalVisible(false);
        Alert.alert(
          'Account Deleted',
          'Your account and all associated data have been permanently deleted from Money Log.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(auth)');
              },
            },
          ]
        );
      } else {
        setDeleteError(result.error || 'Failed to delete account. Please try again.');
      }
    } catch (error: any) {
      setDeleteError(error?.message || 'An unexpected error occurred during deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Name cannot be empty.');
      return;
    }

    if (phone && phoneInputRef.current && !phoneInputRef.current.isValidNumber(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number for the selected country.');
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
        const payload: any = {
          name: name.trim(),
        };
        if (phoneNumberToSave) {
          payload.phone_number = phoneNumberToSave;
        }
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
            {user.email || 'No email registered'} • {formattedPhone || phone || user.phone_number || 'No phone set'}
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

            {/* Email Address Field (Verified Primary ID - Locked) */}
            <View className="pt-2 border-t border-slate-50">
              <View className="flex-row items-center justify-between mb-1.5">
                <View className="flex-row items-center flex-1 mr-2">
                  <Ionicons name="mail-outline" size={14} color="#64748B" />
                  <Text className="text-xs font-bold text-slate-700 ml-1.5" numberOfLines={1}>
                    Email Address
                  </Text>
                </View>
                <View className="flex-row items-center shrink-0">
                  <Ionicons name="checkmark-circle" size={12} color="#159A1D" />
                  <Text className="text-[10px] font-bold text-[#159A1D] ml-1">
                    Primary ID
                  </Text>
                </View>
              </View>
              <View className="bg-slate-100/70 border border-slate-200 rounded-xl px-4 py-3 flex-row items-center justify-between">
                <Text className="text-sm font-bold text-slate-600 flex-1 mr-2" numberOfLines={1}>
                  {user.email || 'No email registered'}
                </Text>
                <Ionicons name="lock-closed" size={14} color="#94A3B8" className="shrink-0" />
              </View>
              <Text className="text-[10px] text-slate-400 mt-1 pl-1">
                Your email address is your verified primary login ID and cannot be changed.
              </Text>
            </View>

            {/* Phone Number Field (Editable Mobile Number) */}
            <View className="pt-2 border-t border-slate-50">
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="call-outline" size={14} color="#64748B" />
                <Text className="text-xs font-bold text-slate-700 ml-1.5">
                  Mobile Phone Number
                </Text>
              </View>
              <PhoneInputField
                ref={phoneInputRef}
                value={phone}
                onChangeText={setPhone}
                onChangeFormattedText={setFormattedPhone}
              />
              <Text className="text-[10px] text-slate-400 -mt-2 pl-1">
                Used for SMS reminders and urgent account notifications.
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

        {/* 4. PRIVACY & POLICIES */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">
            Privacy & Policies
          </Text>

          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-100">
            <TouchableOpacity
              onPress={handleOpenPrivacyPolicy}
              activeOpacity={0.7}
              className="flex-row items-center justify-between py-1"
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-100 mr-3">
                  <Ionicons name="shield-checkmark-outline" size={18} color="#159A1D" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-800">Privacy Policy</Text>
                  <Text className="text-[11px] text-slate-400 mt-0.5">
                    How Money Log handles and protects your financial data.
                  </Text>
                </View>
              </View>
              <Ionicons name="open-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. DANGER ZONE (Apple Guideline 5.1.1(v) Compliant) */}
        <View className="mb-8">
          <Text className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-2.5 ml-1">
            Danger Zone
          </Text>

          <View className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm shadow-rose-100">
            <View className="flex-row items-start mb-3">
              <View className="w-9 h-9 rounded-xl bg-rose-50 items-center justify-center border border-rose-100 mr-3 mt-0.5">
                <Ionicons name="trash-outline" size={18} color="#E11D48" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-rose-600">Delete Account</Text>
                <Text className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Permanently erase your account and all associated transactions, POS catalog, orders, and connected bank data.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleOpenDeleteModal}
              activeOpacity={0.8}
              className="w-full bg-rose-50 border border-rose-200 py-3 rounded-2xl items-center justify-center flex-row mt-1 active:bg-rose-100"
            >
              <Ionicons name="trash-bin-outline" size={16} color="#DC2626" />
              <Text className="text-xs font-extrabold text-rose-600 ml-2">Delete My Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 6. DOCKED SAVE / RESET ACTION ROW (Responsive, smooth, doesn't cause content jump) */}
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

      {/* 7. ACCOUNT DELETION OVERLAY (In-Tree Modal - No Navigation Context Loss) */}
      {isDeleteModalVisible && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              zIndex: 9999,
              elevation: 9999,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
            },
          ]}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              width: '100%',
              maxWidth: 380,
              maxHeight: '85%',
              borderWidth: 1,
              borderColor: '#F1F5F9',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {deleteStep === 1 ? (
                /* STEP 1: Email Verification Modal */
                <View>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: '#FFF1F2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'center',
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: '#FFE4E6',
                    }}
                  >
                    <Ionicons name="alert-circle-outline" size={30} color="#DC2626" />
                  </View>

                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 6 }}>
                    Delete Account
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500', textAlign: 'center', marginBottom: 16, lineHeight: 18 }}>
                    To protect your account and verify your identity, please enter your registered email address to proceed.
                  </Text>

                  <TextInput
                    value={deleteEmailInput}
                    onChangeText={(txt) => {
                      setDeleteEmailInput(txt);
                      if (deleteError) setDeleteError(null);
                    }}
                    placeholder="Enter your registered email"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{
                      backgroundColor: '#F8FAFC',
                      borderWidth: 1,
                      borderColor: deleteError ? '#EF4444' : '#E2E8F0',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#1E293B',
                    }}
                  />

                  {deleteError && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 4 }}>
                      <Ionicons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#E11D48', marginLeft: 6, flex: 1 }}>
                        {deleteError}
                      </Text>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                    <TouchableOpacity
                      onPress={() => setIsDeleteModalVisible(false)}
                      activeOpacity={0.7}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: '#F1F5F9',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#334155' }}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleProceedToConfirmation}
                      activeOpacity={0.85}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: '#E11D48',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#E11D48',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>Next</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* STEP 2: Permanent Deletion Impact Confirmation */
                <View>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: '#DC2626',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'center',
                      marginBottom: 12,
                      shadowColor: '#DC2626',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Ionicons name="warning-outline" size={30} color="#FFFFFF" />
                  </View>

                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#DC2626', textAlign: 'center', marginBottom: 4 }}>
                    Permanent Deletion
                  </Text>
                  <Text style={{ fontSize: 12, color: '#475569', fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>
                    WARNING: This action is permanent and cannot be undone.
                  </Text>

                  <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 12, lineHeight: 18 }}>
                    Deleting your account will immediately and permanently erase all your data across Money Log:
                  </Text>

                  <View
                    style={{
                      backgroundColor: '#FFF1F2',
                      borderWidth: 1,
                      borderColor: '#FECDD3',
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 16,
                      gap: 8,
                    }}
                  >
                    {[
                      'All Income, Expense & Transfer Transactions',
                      'All POS Orders, Receipts, & Sales Data',
                      'All POS Products, Variants, & Suppliers',
                      'All Recurring Subscriptions & Schedules',
                      'All Linked Bank Accounts & Plaid Items',
                      'All Categories, Budgets, & Analytics',
                      'Your Login Credentials & Profile',
                    ].map((item, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="close-circle" size={14} color="#DC2626" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#1E293B', marginLeft: 8, flex: 1 }}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {deleteError && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
                      <Ionicons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#E11D48', marginLeft: 6, flex: 1 }}>
                        {deleteError}
                      </Text>
                    </View>
                  )}

                  <View style={{ gap: 10 }}>
                    <TouchableOpacity
                      onPress={handleConfirmPermanentDelete}
                      disabled={isDeleting}
                      activeOpacity={0.85}
                      style={{
                        width: '100%',
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: '#DC2626',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        shadowColor: '#DC2626',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      {isDeleting ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Ionicons name="trash" size={16} color="#FFFFFF" />
                          <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF', marginLeft: 8 }}>
                            Permanently Delete Everything
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        if (!isDeleting) {
                          setDeleteStep(1);
                        }
                      }}
                      disabled={isDeleting}
                      activeOpacity={0.7}
                      style={{
                        width: '100%',
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: '#F1F5F9',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155' }}>Go Back</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
