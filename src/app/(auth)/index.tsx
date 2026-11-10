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
import { loginSchema } from "../../validations/auth";
import AuthScreenLayout from "../../components/auth/AuthScreenLayout";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const handleLogin = async () => {
    setErrors({});

    // 1. Zod Validation
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as "email" | "password";
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // 2. API Call
    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.success) {
      router.replace("/(app)");
    } else if (result.requiresEmailVerification) {
      router.push("/(auth)/verify-email");
    } else {
      setErrors({
        general:
          result.error || "Login failed. Please check your credentials.",
      });
    }
  };

  return (
    <AuthScreenLayout
      title="Welcome Back"
      subtitle="Sign in with your email and password to access your accounts."
      showBack={false}
      actionTitle="Sign In"
      actionSubtitle={
        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          activeOpacity={0.7}
        >
          <Text className="text-slate-500 text-sm font-medium">
            Don't have an account?{" "}
            <Text className="text-[#159A1D] font-bold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      }
      onAction={handleLogin}
      loading={loading}
    >
      {/* Global Error Banner */}
      {errors.general ? (
        <View className="bg-red-50 border border-red-200 rounded-2xl p-3.5 mb-5 flex-row items-center">
          <Ionicons name="alert-circle" size={18} color="#DC2626" />
          <Text className="text-red-700 text-xs font-semibold ml-2 flex-1">
            {errors.general}
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
            errors.email ? "border-red-400 bg-red-50/20" : "border-slate-200"
          }`}
        >
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
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
        {errors.email ? (
          <Text className="text-red-500 text-xs font-medium mt-1.5 ml-2">
            {errors.email}
          </Text>
        ) : null}
      </View>

      {/* Password Input */}
      <View className="mb-2">
        <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
          Password
        </Text>
        <View
          className={`flex-row items-center bg-slate-50 border rounded-2xl px-4 h-14 ${
            errors.password ? "border-red-400 bg-red-50/20" : "border-slate-200"
          }`}
        >
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="Enter your password"
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
        ) : null}
      </View>

      {/* Forgot Password Link */}
      <View className="flex-row justify-end mb-2">
        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Text className="text-xs font-bold text-[#159A1D]">
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenLayout>
  );
}
