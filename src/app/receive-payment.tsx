import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReceivePayment() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleDownload = () => {
    Alert.alert("Downloaded!", "Your QR code has been saved to your photo gallery.");
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View 
        style={{ paddingTop: insets.top + 16 }} 
        className="flex-row items-center justify-between px-5 pb-4 bg-slate-50"
      >
        <TouchableOpacity 
          onPress={() => router.navigate('/pay')}
          className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-200 shadow-sm shadow-slate-100"
        >
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
        
        <Text className="font-bold text-lg text-slate-800">Receive Money</Text>

        <TouchableOpacity className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center border border-blue-100">
          <Ionicons name="share-outline" size={20} color="#6BCB77" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 items-center justify-center pt-4 pb-20">
        
        <Text className="text-slate-500 font-medium text-center mb-8 text-base">
          Show this code to get paid instantly
        </Text>
        
        <View className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 items-center justify-center mb-10 w-full max-w-[320px]">
          {/* Mock QR Code */}
          <Ionicons name="qr-code-outline" size={220} color="#0F172A" />
          
          <View className="absolute bg-white p-3 rounded-2xl shadow-lg shadow-slate-200">
            <View className="w-12 h-12 bg-primary rounded-xl items-center justify-center">
              <Ionicons name="wallet" size={26} color="#FFF" />
            </View>
          </View>
        </View>

        <View className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100 mb-10 flex-row items-center">
          <Ionicons name="person-circle-outline" size={28} color="#94A3B8" />
          <Text className="text-slate-800 font-bold text-lg ml-2">@alex_user</Text>
        </View>

      </View>

      {/* Floating Download Button */}
      <View 
        className="px-5 pt-4 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <TouchableOpacity 
          onPress={handleDownload}
          className="bg-slate-900 py-4 rounded-2xl items-center shadow-lg shadow-slate-900/30 flex-row justify-center"
        >
          <Ionicons name="download-outline" size={22} color="#FFF" className="mr-2" />
          <Text className="font-bold text-lg text-white ml-2">Download QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
