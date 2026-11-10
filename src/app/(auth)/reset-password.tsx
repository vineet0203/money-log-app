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
import { resetPasswordSchema } from "../../validations/auth";
import AuthScreenLayout from "../../components/auth/AuthScreenLayout";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuthStore();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    token?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const handleReset = async () => {
    setErrors({});

    // 1. Zod Validation
    const validation = resetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors: typeof errors = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof typeof errors;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const result = await resetPassword(token.trim(), password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setErrors({
        general:
          result.error ||
          "Failed to reset password. The link or code may have expired.",
      });
    }
  };

  return (
    <AuthScreenLayout
      title={success ? "Success" : "New Password"}
      subtitle={
        success
          ? "Your password has been changed."
          : "Enter the code from your email and set a new password."
      }
      showBack={true}
      onBack={() => router.back()}
      actionTitle={success ? "Sign In" : "Reset Password"}
      actionSubtitle={
        <TouchableOpacity
          onPress={() => router.replace("/(auth)")}
          activeOpacity={0.7}
        >
          <Text className="text-slate-500 text-sm font-medium">
            Back to <Text className="text-[#159A1D] font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      }
      onAction={success ? () => router.replace("/(auth)") : handleReset}
      loading={loading}
    >
      {success ? (
        // Success Card
        <View className="py-4">
          <View className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 mb-4 items-center">
            <View className="w-14 h-14 bg-[#159A1D] rounded-full items-center justify-center mb-3 shadow-md shadow-emerald-700/20">
              <Ionicons name="checkmark-done" size={28} color="#FFFFFF" />
            </View>
            <Text className="text-lg font-black text-slate-900 mb-1 text-center">
              Password Updated!
            </Text>
            <Text className="text-slate-600 text-xs font-medium text-center leading-5">
              Your password has been reset successfully. Tap the button below to proceed to Sign In.
            </Text>
          </View>
        </View>
      ) : (
        // Form Fields
        <View>
          {errors.general ? (
            <View className="bg-red-50 border border-red-200 rounded-2xl p-3.5 mb-5 flex-row items-center">
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text className="text-red-700 text-xs font-semibold ml-2 flex-1">
                {errors.general}
              </Text>
            </View>
          ) : null}

          {/* Reset Code or Token */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
              Reset Code *
            </Text>
            <View
              className={`flex-row items-center bg-slate-50 border rounded-2xl px-4 h-14 ${
                errors.token ? "border-red-400 bg-red-50/20" : "border-slate-200"
              }`}
            >
              <TextInput
                value={token}
                onChangeText={(text) => {
                  setToken(text);
                  if (errors.token)
                    setErrors((prev) => ({ ...prev, token: undefined }));
                }}
                placeholder="6-digit code or reset token"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-base font-semibold text-slate-900 py-0"
              />
              <Ionicons name="ticket-outline" size={20} color="#94A3B8" />
            </View>
            {errors.token ? (
              <Text className="text-red-500 text-xs font-medium mt-1.5 ml-2">
                {errors.token}
              </Text>
            ) : null}
          </View>

          {/* New Password */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
              New Password *
            </Text>
            <View
              className={`flex-row items-center bg-slate-50 border rounded-2xl px-4 h-14 ${
                errors.password
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-200"
              }`}
            >
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-base font-semibold text-slate-900 py-0"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text className="text-red-500 text-xs font-medium mt-1.5 ml-2">
                {errors.password}
              </Text>
            ) : (
              <Text className="text-slate-400 text-[11px] font-medium mt-1 ml-2">
                Must include 8+ chars, uppercase, lowercase, and a number
              </Text>
            )}
          </View>

          {/* Confirm Password */}
          <View className="mb-4">
            <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
              Confirm New Password *
            </Text>
            <View
              className={`flex-row items-center bg-slate-50 border rounded-2xl px-4 h-14 ${
                errors.confirmPassword
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-200"
              }`}
            >
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                }}
                placeholder="••••••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-base font-semibold text-slate-900 py-0"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text className="text-red-500 text-xs font-medium mt-1.5 ml-2">
                {errors.confirmPassword}
              </Text>
            ) : null}
          </View>
        </View>
      )}
    </AuthScreenLayout>
  );
}
