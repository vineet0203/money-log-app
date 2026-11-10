import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { forgotPasswordSchema } from "../../validations/auth";
import AuthScreenLayout from "../../components/auth/AuthScreenLayout";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuthStore();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSendInstructions = async () => {
    setError("");

    // 1. Zod Validation
    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ||
          "Please enter a valid email address"
      );
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email.trim().toLowerCase());
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Failed to process request. Please try again.");
    }
  };

  return (
    <AuthScreenLayout
      title="Reset Password"
      subtitle="Enter your email to receive password reset instructions."
      showBack={true}
      onBack={() => router.back()}
      actionTitle={submitted ? "Enter Reset Code" : "Send Instructions"}
      actionSubtitle={
        <TouchableOpacity
          onPress={() => router.replace("/(auth)")}
          activeOpacity={0.7}
        >
          <Text className="text-slate-500 text-sm font-medium">
            Remember password? <Text className="text-[#159A1D] font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      }
      onAction={
        submitted
          ? () => router.push("/(auth)/reset-password")
          : handleSendInstructions
      }
      loading={loading}
    >
      {submitted ? (
        // Confirmation View
        <View className="py-4">
          <View className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 mb-4">
            <View className="w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center mb-3">
              <Ionicons name="mail" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-lg font-black text-slate-900 mb-1">
              Instructions Sent!
            </Text>
            <Text className="text-slate-600 text-xs font-medium leading-5">
              If an account exists for <Text className="font-bold text-slate-900">{email}</Text>, a 6-digit reset code has been sent to your inbox.
            </Text>
          </View>
          <Text className="text-xs text-slate-400 font-medium text-center mt-2">
            Tap the button below to enter your reset code and set a new password.
          </Text>
        </View>
      ) : (
        // Input View
        <View>
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-2xl p-3.5 mb-5 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text className="text-red-700 text-xs font-semibold ml-2 flex-1">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
              Email Address
            </Text>
            <View
              className={`flex-row items-center bg-slate-50 border rounded-2xl px-4 h-14 ${
                error ? "border-red-400 bg-red-50/20" : "border-slate-200"
              }`}
            >
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError("");
                }}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-base font-semibold text-slate-900 py-0"
              />
              <Ionicons name="mail-outline" size={20} color="#94A3B8" />
            </View>
          </View>
        </View>
      )}
    </AuthScreenLayout>
  );
}
