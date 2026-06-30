import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';

const CELL_COUNT = 6;

export default function Verify() {
  const router = useRouter();
  const { verifyOtp, sendOtp, phoneNumber } = useAuthStore();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);

  const ref = useBlurOnFulfill({value, cellCount: CELL_COUNT});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    setTimeout(() => {
      ref.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleVerify = async () => {
    if (value.length !== CELL_COUNT) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);
    const result = await verifyOtp(value);
    setLoading(false);

    if (result.success) {
      if (result.isProfileComplete) {
        router.replace('/(app)');
      } else {
        router.replace('/(auth)/complete-profile');
      }
    } else {
      setError(result.error || "Invalid code. Please try again.");
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || !phoneNumber) return;
    
    setError("");
    setResending(true);
    const result = await sendOtp(phoneNumber);
    setResending(false);

    if (result.success) {
      setTimeLeft(120); // Reset timer to 2 minutes
    } else {
      setError(result.error || "Failed to resend code. Please try again.");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mb-8"
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-3xl font-extrabold text-text mb-2">Verify Phone</Text>
        <Text className="text-textMuted text-base mb-8 leading-6">
          Enter the 6-digit code we sent to{'\n'}
          <Text className="text-primary font-bold">{phoneNumber || "+1 (555) 000-0000"}</Text>
        </Text>

        <CodeField
          ref={ref}
          {...props}
          value={value}
          onChangeText={(text) => {
            setValue(text.replace(/[^0-9]/g, ''));
          }}
          cellCount={CELL_COUNT}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          rootStyle={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}
          renderCell={({index, symbol, isFocused}) => (
            <View
              key={index}
              className={`w-12 h-14 bg-slate-50 border-2 rounded-xl items-center justify-center ${error ? 'border-red-400' : isFocused || symbol ? 'border-primary' : 'border-slate-200'}`}
              onLayout={getCellOnLayoutHandler(index)}>
              <Text className="text-xl font-bold text-text">
                {symbol || (isFocused ? <Cursor /> : null)}
              </Text>
            </View>
          )}
        />

        {error ? (
          <Text className="text-red-500 text-sm font-medium text-center mb-6">{error}</Text>
        ) : null}

        <TouchableOpacity 
          onPress={handleVerify}
          disabled={loading || value.length !== CELL_COUNT}
          className={`w-full bg-primary py-4 rounded-full items-center shadow-md shadow-primary/30 ${(loading || value.length !== CELL_COUNT) ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Verify</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center items-center mt-6 h-10">
          <Text className="text-textMuted font-medium">Didn't receive the code? </Text>
          {resending ? (
            <ActivityIndicator size="small" color="#6BCB77" className="ml-2" />
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={timeLeft > 0}>
              <Text className={`${timeLeft > 0 ? 'text-slate-400' : 'text-primary'} font-bold`}>
                {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAwareScrollView>
      <StatusBar style="dark" />
    </View>
  );
}
