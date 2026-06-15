import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Verify() {
  const router = useRouter();
  const { verifyOtp, phoneNumber } = useAuthStore();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handleChangeText = (text: string, index: number) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);

    if (numericText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);
    const success = await verifyOtp(fullCode);
    setLoading(false);

    if (success) {
      router.replace('/(app)');
    } else {
      setError("Invalid code. Use 123456");
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

        {/* 6 OTP Input Boxes */}
        <View className="flex-row justify-between mb-8">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
              className={`w-12 h-14 bg-slate-50 border-2 rounded-xl text-center text-xl font-bold text-text ${error ? 'border-red-400' : digit ? 'border-primary' : 'border-slate-200'}`}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? (
          <Text className="text-red-500 text-sm font-medium text-center mb-6">{error}</Text>
        ) : null}

        <TouchableOpacity 
          onPress={handleVerify}
          disabled={loading || code.join('').length !== 6}
          className={`w-full bg-primary py-4 rounded-full items-center shadow-md shadow-primary/30 ${(loading || code.join('').length !== 6) ? 'opacity-70' : ''}`}
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
