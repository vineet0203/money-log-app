import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SendPayment() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const insets = useSafeAreaInsets();

  const handleAmountChange = (text: string) => {
    // Basic validation to only allow numbers and one decimal point
    const validated = text.replace(/[^0-9.]/g, '');
    const parts = validated.split('.');
    if (parts.length > 2) return; // Prevent multiple decimal points
    if (parts[1] && parts[1].length > 2) return; // Prevent more than 2 decimal places
    
    setAmount(validated);
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View 
        style={{ paddingTop: insets.top + 16 }} 
        className="flex-row items-center justify-between px-5 pb-4"
      >
        <TouchableOpacity 
          onPress={() => router.navigate('/pay')}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
        >
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
        
        <Text className="font-bold text-lg text-text">Send Money</Text>

        <TouchableOpacity className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center border border-blue-100">
          <Ionicons name="qr-code-outline" size={20} color="#1591DC" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <View className="flex-1 px-5 pt-8">
          
          {/* Recipient Selection Placeholder */}
          <TouchableOpacity className="flex-row items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-12 shadow-sm shadow-slate-100">
            <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mr-4">
              <Ionicons name="search" size={20} color="#1591DC" />
            </View>
            <View className="flex-1">
              <Text className="text-textMuted font-medium text-sm">To</Text>
              <Text className="text-text font-bold text-base">Select Recipient...</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#94A3B8" />
          </TouchableOpacity>

          {/* Massive Amount Input */}
          <View className="items-center justify-center flex-1 pb-20">
            <Text className="text-textMuted font-medium mb-4">Enter Amount</Text>
            <View className="flex-row items-center justify-center w-full">
              <Text className={`text-5xl font-bold mr-2 ${amount ? 'text-text' : 'text-slate-300'}`}>$</Text>
              <TextInput
                className={`text-6xl font-extrabold text-center ${amount ? 'text-text' : 'text-slate-300'} min-w-[150]`}
                keyboardType="decimal-pad"
                autoFocus={true}
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="0.00"
                placeholderTextColor="#CBD5E1"
                selectionColor="#1591DC"
              />
            </View>
          </View>
        </View>

        {/* Floating Action Button */}
        <View 
          className="px-5 pt-4 bg-white border-t border-slate-50 shadow-lg shadow-slate-100"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <TouchableOpacity 
            disabled={!amount || parseFloat(amount) <= 0}
            className={`py-4 rounded-2xl items-center shadow-lg flex-row justify-center ${(!amount || parseFloat(amount) <= 0) ? 'bg-slate-200 shadow-transparent' : 'bg-primary shadow-primary/30'}`}
          >
            <Text className={`font-bold text-lg ${(!amount || parseFloat(amount) <= 0) ? 'text-slate-400' : 'text-white'}`}>
              Review Payment
            </Text>
            {amount && parseFloat(amount) > 0 && (
              <Ionicons name="arrow-forward" size={20} color="#FFF" className="ml-2" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
