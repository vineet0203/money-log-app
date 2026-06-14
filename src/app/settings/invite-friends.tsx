import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InviteFriends() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-slate-50">
      <View 
        style={{ paddingTop: insets.top + 16 }} 
        className="flex-row items-center justify-between px-5 pb-4 bg-white shadow-sm shadow-slate-100 z-10 border-b border-slate-100"
      >
        <TouchableOpacity 
          onPress={() => router.navigate('/more')}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        
        <Text className="font-bold text-lg text-slate-800">Invite Friends</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-8" showsVerticalScrollIndicator={false}>
        
        <View className="items-center mb-10">
          <View className="w-32 h-32 bg-blue-50 rounded-full items-center justify-center mb-6 border border-blue-100">
            <Ionicons name="gift" size={60} color="#6BCB77" />
          </View>
          <Text className="text-slate-800 font-extrabold text-2xl text-center mb-2">Give $20, Get $20</Text>
          <Text className="text-slate-500 text-center text-base px-4">
            Invite your friends to MoneyLog. Once they sign up and verify their account, you both get a $20 bonus!
          </Text>
        </View>

        <View className="bg-white p-6 rounded-3xl shadow-sm shadow-slate-100 border border-slate-50 mb-8">
          <Text className="text-slate-500 font-medium text-xs uppercase tracking-wider text-center mb-3">Your Referral Code</Text>
          <View className="bg-slate-50 border border-slate-200 py-4 rounded-xl items-center flex-row justify-center mb-4">
            <Text className="text-slate-800 font-bold text-2xl tracking-[0.2em] ml-4">ALEX20ML</Text>
            <TouchableOpacity className="ml-4">
              <Ionicons name="copy-outline" size={20} color="#6BCB77" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/30 flex-row justify-center mb-10">
          <Ionicons name="share-outline" size={22} color="#FFF" className="mr-2" />
          <Text className="text-white font-bold text-lg">Share Link</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
