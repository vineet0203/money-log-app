import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Notifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(true);

  const ToggleRow = ({ title, description, value, onValueChange, icon }: any) => (
    <View className="flex-row items-center justify-between bg-white p-5 rounded-2xl mb-3 shadow-sm shadow-slate-100 border border-slate-50">
      <View className="flex-row items-center flex-1 pr-4">
        <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center mr-4 border border-slate-100">
          <Ionicons name={icon} size={20} color="#334155" />
        </View>
        <View className="flex-1">
          <Text className="text-slate-800 font-bold text-base mb-1">{title}</Text>
          <Text className="text-slate-500 text-xs">{description}</Text>
        </View>
      </View>
      <Switch
        trackColor={{ false: "#E2E8F0", true: "#6BCB77" }}
        thumbColor={"#FFFFFF"}
        ios_backgroundColor="#E2E8F0"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

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
        
        <Text className="font-bold text-lg text-slate-800">Notifications</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-slate-500 font-bold text-sm tracking-wider uppercase mb-4 ml-1">Alert Types</Text>
        
        <ToggleRow 
          title="Push Notifications" 
          description="Receive instant alerts on your device." 
          value={pushEnabled} 
          onValueChange={setPushEnabled} 
          icon="phone-portrait-outline" 
        />
        <ToggleRow 
          title="Email Summaries" 
          description="Get weekly reports sent to your email." 
          value={emailEnabled} 
          onValueChange={setEmailEnabled} 
          icon="mail-outline" 
        />
        <ToggleRow 
          title="SMS Alerts" 
          description="Text messages for critical security events." 
          value={smsEnabled} 
          onValueChange={setSmsEnabled} 
          icon="chatbubble-outline" 
        />
        <ToggleRow 
          title="Promotions" 
          description="Updates on new features and offers." 
          value={promoEnabled} 
          onValueChange={setPromoEnabled} 
          icon="megaphone-outline" 
        />
      </ScrollView>
    </View>
  );
}
