import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function ProfileSetup() {
  const router = useRouter();
  const { completeProfile } = useAuthStore();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (name.trim().length < 2) {
      setError("Please enter a valid name");
      return;
    }

    setError("");
    setLoading(true);
    const success = await completeProfile(name, email);
    setLoading(false);

    if (success) {
      router.replace('/(app)');
    } else {
      setError("Failed to save profile. Email might be in use.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAwareScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
      >
        <View className="mb-8 mt-4">
          <Text className="text-3xl font-extrabold text-text mb-2">Complete Profile</Text>
          <Text className="text-textMuted text-base mb-2 leading-6">
            Welcome to Money Log! Let's get to know you better.
          </Text>
        </View>

        <View className="w-full mb-4">
          <Text className="text-sm font-bold text-text mb-2 ml-1">Full Name *</Text>
          <TextInput
            className="w-full h-14 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 text-base font-medium text-text focus:border-primary"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        <View className="w-full mb-6">
          <Text className="text-sm font-bold text-text mb-2 ml-1">Email Address (Optional)</Text>
          <TextInput
            className="w-full h-14 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 text-base font-medium text-text focus:border-primary"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {error ? (
          <Text className="text-red-500 text-sm font-medium text-center mb-6">{error}</Text>
        ) : null}

        <TouchableOpacity 
          onPress={handleSave}
          disabled={loading || name.trim().length < 2}
          className={`w-full bg-primary py-4 rounded-full items-center shadow-md shadow-primary/30 ${(loading || name.trim().length < 2) ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Profile</Text>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
      <StatusBar style="dark" />
    </View>
  );
}
