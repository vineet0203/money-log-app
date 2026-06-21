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
  const { verifyOtp, phoneNumber } = useAuthStore();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        router.replace('/(auth)/profile-setup');
      }
    } else {
      setError("Invalid code. Please try again.");
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
          onChangeText={setValue}
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

        <View className="flex-row justify-center mt-6">
          <Text className="text-textMuted font-medium">Didn't receive the code? </Text>
          <TouchableOpacity>
            <Text className="text-primary font-bold">Resend</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <StatusBar style="dark" />
    </View>
  );
}
