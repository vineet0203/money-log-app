import { View, Text, Image, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import PhoneInputField from "../../components/fields/PhoneInputField";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Login() {
  const router = useRouter();
  const { sendOtp } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [formattedPhone, setFormattedPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (phone.length < 5) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setLoading(true);
    const success = await sendOtp(formattedPhone);
    setLoading(false);
    
    if (success) {
      router.push('/(auth)/verify');
    } else {
      setError("Mock mode: Use any valid format phone number.");
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
            Enter your phone number to continue
          </Text>
        </View>

        {/* Form Section */}
        <View className="w-full">
          <PhoneInputField 
            value={phone}
            onChangeText={setPhone}
            onChangeFormattedText={setFormattedPhone}
            error={error}
          />
          
          <TouchableOpacity 
            onPress={handleSendOtp}
            disabled={loading}
            className={`w-full bg-primary py-4 rounded-full items-center mt-2 shadow-md shadow-primary/30 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      <StatusBar style="dark" />
    </View>
  );
}
