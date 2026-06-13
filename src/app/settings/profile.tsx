import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
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
        
        <Text className="font-bold text-lg text-slate-800">Profile</Text>

        <View className="w-10 h-10" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-5 pt-8" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Avatar Section */}
          <View className="items-center mb-10">
            <View className="w-28 h-28 bg-slate-200 rounded-full items-center justify-center border-4 border-white shadow-sm shadow-slate-200 relative">
              <Ionicons name="person" size={50} color="#94A3B8" />
              <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-white shadow-sm shadow-primary/40">
                <Ionicons name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text className="text-xl font-bold text-slate-800 mt-4">Alex User</Text>
            <Text className="text-slate-500 font-medium mb-1">@alex_user</Text>
            <View className="flex-row items-center bg-slate-100 px-3 py-1.5 rounded-full mt-1 border border-slate-200">
              <Ionicons name="call" size={12} color="#64748B" />
              <Text className="text-slate-600 font-bold text-xs ml-1.5">+1 (555) 123-4567</Text>
            </View>
          </View>

          {/* Form Fields */}
          <View className="bg-white p-5 rounded-3xl shadow-sm shadow-slate-100 border border-slate-50 mb-10">
            
            <View className="mb-6">
              <Text className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-2">Full Name</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <Ionicons name="person-outline" size={20} color="#94A3B8" className="mr-3" />
                <TextInput 
                  className="flex-1 text-slate-800 font-bold text-base"
                  defaultValue="Alex User"
                />
              </View>
            </View>

            <View className="mb-2">
              <Text className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-2">Email Address</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <Ionicons name="mail-outline" size={20} color="#94A3B8" className="mr-3" />
                <TextInput 
                  className="flex-1 text-slate-800 font-bold text-base"
                  defaultValue="alex@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

          </View>

          <TouchableOpacity className="bg-primary py-4 rounded-2xl items-center shadow-lg shadow-primary/30 mb-10">
            <Text className="text-white font-bold text-lg">Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
