import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { useAuthStore } from "../../store/authStore";
import { verifyEmailOtpSchema } from "../../validations/auth";
import AuthScreenLayout from "../../components/auth/AuthScreenLayout";

const CELL_COUNT = 6;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { verifyEmailOtp, resendEmailOtp, pendingEmail, logout } =
    useAuthStore();

  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      ref.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleVerify = async () => {
    setError("");
    setResendSuccess(false);

    // 1. Zod Validation
    const validation = verifyEmailOtpSchema.safeParse({ code: value });
    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message || "Please enter all 6 digits"
      );
      return;
    }

    setLoading(true);
    const result = await verifyEmailOtp(value);
    setLoading(false);

    if (result.success) {
      router.replace("/(app)");
    } else {
      setError(result.error || "Invalid verification code. Please try again.");
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || resending) return;

    setError("");
    setResendSuccess(false);
    setResending(true);
    const result = await resendEmailOtp();
    setResending(false);

    if (result.success) {
      setResendSuccess(true);
      setTimeLeft(60);
    } else {
      setError(result.error || "Failed to resend code. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <AuthScreenLayout
      title="Verification"
      subtitle={`Code is sent to ${pendingEmail || "your email"}`}
      showBack={true}
      onBack={() => router.replace("/(auth)")}
      actionTitle="Verify & Continue"
      actionSubtitle={
        <TouchableOpacity
          onPress={() => {
            logout();
            router.replace("/(auth)");
          }}
          activeOpacity={0.7}
        >
          <Text className="text-slate-500 text-sm font-medium">
            Wrong email? <Text className="text-[#159A1D] font-bold">Change</Text>
          </Text>
        </TouchableOpacity>
      }
      onAction={handleVerify}
      loading={loading}
      disableAction={value.length !== CELL_COUNT}
    >
      {/* Resend Success Banner */}
      {resendSuccess ? (
        <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-5 flex-row items-center">
          <Ionicons name="checkmark-circle" size={18} color="#159A1D" />
          <Text className="text-emerald-800 text-xs font-semibold ml-2 flex-1">
            A fresh verification code has been dispatched to your email!
          </Text>
        </View>
      ) : null}

      {/* Error Banner */}
      {error ? (
        <View className="bg-red-50 border border-red-200 rounded-2xl p-3.5 mb-5 flex-row items-center">
          <Ionicons name="alert-circle" size={18} color="#DC2626" />
          <Text className="text-red-700 text-xs font-semibold ml-2 flex-1">
            {error}
          </Text>
        </View>
      ) : null}

      {/* Code Input Fields */}
      <View className="my-6">
        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={(text) => {
            const numeric = text.replace(/[^0-9]/g, "");
            setValue(numeric);
            if (error) setError("");
          }}
          cellCount={CELL_COUNT}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          rootStyle={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
          renderCell={({ index, symbol, isFocused }) => (
            <View
              key={index}
              style={{
                width: 48,
                height: 56,
                backgroundColor: error
                  ? "#FEF2F2"
                  : isFocused || symbol
                  ? "#FFFFFF"
                  : "#F8FAFC",
                borderWidth: 2,
                borderColor: error
                  ? "#F87171"
                  : isFocused || symbol
                  ? "#159A1D"
                  : "#E2E8F0",
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: isFocused || symbol ? "#159A1D" : "transparent",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isFocused || symbol ? 0.15 : 0,
                shadowRadius: 6,
                elevation: isFocused || symbol ? 2 : 0,
              }}
              onLayout={getCellOnLayoutHandler(index)}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: "#0F172A",
                }}
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />

        {/* Didn't receive code? Resend */}
        <View className="flex-row justify-center items-center mt-3">
          <Text className="text-slate-500 font-medium text-xs">
            Didn't receive code?{" "}
          </Text>
          {resending ? (
            <ActivityIndicator size="small" color="#159A1D" className="ml-2" />
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={timeLeft > 0}>
              <Text
                className={`text-xs font-bold ${
                  timeLeft > 0 ? "text-slate-400" : "text-[#159A1D]"
                }`}
              >
                {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : "Resend"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </AuthScreenLayout>
  );
}
