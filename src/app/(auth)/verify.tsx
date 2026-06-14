import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function Verify() {
  const router = useRouter();
  const { verifyOtp, phoneNumber, resetOtpState } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setError("");
    setLoading(true);
    const success = await verifyOtp(otp);
    setLoading(false);
    if (!success) {
      setError("Invalid OTP. Try 123456 for testing.");
    } else {
      router.replace('/(app)');
    }
  };

  const handleChangePhone = () => {
    resetOtpState();
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header / Logo Section */}
        <View className="items-center mb-8 mt-4">
          <View className="shadow-lg shadow-primary/30 rounded-3xl mb-4 bg-white">
            <Image 
              source={require('../../../assets/images/logo.png')} 
              className="w-28 h-28 rounded-3xl"
              resizeMode="contain"
            />
          </View>
          <View className="flex-row items-center mb-4 h-12 w-64 mt-2">
            <Image 
              source={require('../../../assets/images/logo_text.jpeg')} 
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
          <Text className="text-textMuted text-sm text-center font-medium">
            Code sent to {phoneNumber}
          </Text>
        </View>

        {/* Form Section */}
        <View className="w-full">
          <TextInput
            className={`w-full bg-[#F8FAFC] rounded-2xl p-5 text-3xl tracking-[12px] text-center font-bold text-text mb-2 border-2 ${error ? 'border-red-500' : 'border-[#F1F5F9] focus:border-primary'}`}
            placeholder="------"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(text) => { setOtp(text); setError(""); }}
            autoFocus
          />
          {error ? <Text className="text-red-500 text-sm mb-4 text-center font-medium">{error}</Text> : null}
          
          <TouchableOpacity 
            onPress={handleVerifyOtp}
            disabled={loading}
            className={`w-full bg-primary py-4 rounded-full items-center mt-4 shadow-md shadow-primary/30 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Verify Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleChangePhone}
            className="w-full py-4 items-center mt-4"
          >
            <Text className="text-textMuted font-medium text-base">Change Phone Number</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </KeyboardAvoidingView>
  );
}
