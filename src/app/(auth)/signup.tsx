import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/authStore";
import PhoneInputField, {
  PhoneInputFieldRef,
} from "../../components/fields/PhoneInputField";
import { signupSchema } from "../../validations/auth";
import AuthScreenLayout from "../../components/auth/AuthScreenLayout";

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuthStore();
  const phoneInputRef = useRef<PhoneInputFieldRef>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const handleSignup = async () => {
    setErrors({});

    // 1. Zod Validation
    const validation = signupSchema.safeParse({
      name,
      email,
      phone,
      password,
      confirmPassword,
    });

    const newErrors: typeof errors = {};

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof typeof errors;
        if (!newErrors[fieldName]) {
          newErrors[fieldName] = issue.message;
        }
      });
    }

    // 2. Validate Phone Number with country validator
    if (phone && !phoneInputRef.current?.isValidNumber(phone)) {
      newErrors.phone =
        "Please enter a valid phone number for the selected country";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 3. API Registration Call
    setLoading(true);
    const result = await signup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone_number: formattedPhone || phone,
      password,
    });
    setLoading(false);

    if (result.success) {
      router.push("/(auth)/verify-email");
    } else {
      const apiErrors: typeof errors = {
        general: result.error || "Registration failed. Please try again.",
      };

      if (result.fields?.email) {
        apiErrors.email = result.fields.email;
      }
      if (result.fields?.phone) {
        apiErrors.phone = result.fields.phone;
      }

      // Context-aware fallback if specific field errors weren't in payload
      const errLower = (result.error || "").toLowerCase();
      if (!apiErrors.email && errLower.includes("email")) {
        apiErrors.email = "This email address is already registered.";
      }
      if (
        !apiErrors.phone &&
        (errLower.includes("phone") || errLower.includes("mobile"))
      ) {
        apiErrors.phone = "This mobile number is already registered.";
      }

      setErrors(apiErrors);

      // Prominent UI notification banner & floating toast
      Toast.show({
        type: "error",
        text1: "Registration Error",
        text2: result.error || "Please check your entered details.",
        visibilityTime: 5000,
      });
    }
  };

  return (
    <AuthScreenLayout
      title="Create Account"
      subtitle="Complete your profile to start tracking your finances."
      showBack={true}
      onBack={() => router.back()}
      actionTitle="Create Account"
      actionSubtitle={
        <TouchableOpacity
          onPress={() => router.replace("/(auth)")}
          activeOpacity={0.7}
        >
          <Text className="text-slate-500 text-sm font-medium">
            Already have an account?{" "}
            <Text className="text-[#159A1D] font-bold">Sign In</Text>
          </Text>
        </TouchableOpacity>
      }
      onAction={handleSignup}
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

      {/* 1. Full Name */}
      <View className="mb-4">
        <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
          Full Name *
        </Text>
        <View
          className={`flex-row items-center bg-slate-50 border rounded-2xl px-4 h-14 ${
            errors.name ? "border-red-400 bg-red-50/20" : "border-slate-200"
          }`}
        >
          <TextInput
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name)
                setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Robert Fox"
            placeholderTextColor="#94A3B8"
            autoCapitalize="words"
            className="flex-1 text-base font-semibold text-slate-900 py-0"
          />
          <Ionicons name="person-outline" size={20} color="#94A3B8" />
        </View>
        {errors.name ? (
          <Text className="text-red-500 text-xs font-medium mt-1.5 ml-2">
            {errors.name}
          </Text>
        ) : null}
      </View>

      {/* 2. Email Address */}
      <View className="mb-4">
        <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
          Email Address *
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
              if (errors.email || errors.general)
                setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
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

      {/* 3. Phone Number (Placed before Password as requested) */}
      <View className="mb-4">
        <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
          Phone Number *
        </Text>
        <PhoneInputField
          ref={phoneInputRef}
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (errors.phone || errors.general)
              setErrors((prev) => ({ ...prev, phone: undefined, general: undefined }));
          }}
          onChangeFormattedText={setFormattedPhone}
          error={errors.phone}
        />
      </View>

      {/* 4. Password with Eye */}
      <View className="mb-4">
        <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
          Password *
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

      {/* 5. Confirm Password with Eye */}
      <View className="mb-2">
        <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">
          Confirm Password *
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
    </AuthScreenLayout>
  );
}
