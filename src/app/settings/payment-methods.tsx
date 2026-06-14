import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataStore } from '../../store/dataStore';
import EmptyState from '../../components/common/EmptyState';

export default function PaymentMethods() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const cashAccounts = useDataStore((state) => state.cashAccounts);
  const creditAccounts = useDataStore((state) => state.creditAccounts);
  const allAccounts = [...cashAccounts, ...creditAccounts];
  
  const [defaultMethodId, setDefaultMethodId] = useState(allAccounts[0]?.id);

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
        
        <Text className="font-bold text-lg text-slate-800">Payment Methods</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-slate-500 font-medium mb-4">Select your default payment method</Text>

        {allAccounts.length === 0 ? (
          <EmptyState 
            iconName="card-outline" 
            title="No Payment Methods" 
            message="Add a bank account or credit card to set a default payment method." 
          />
        ) : (
          allAccounts.map((account) => {
            const isDefault = account.id === defaultMethodId;

            return (
              <TouchableOpacity 
                key={account.id}
                onPress={() => setDefaultMethodId(account.id)}
                className={`flex-row items-center justify-between p-5 rounded-2xl mb-4 border ${isDefault ? 'bg-primary/5 border-primary shadow-sm shadow-primary/10' : 'bg-white border-slate-100 shadow-sm shadow-slate-100'}`}
              >
                <View className="flex-row items-center">
                  <View className={`w-12 h-12 ${account.bg} rounded-2xl items-center justify-center mr-4 border border-slate-50`}>
                    <Ionicons name={account.icon as any} size={22} color={account.color.replace('bg-[', '').replace(']', '') || '#6BCB77'} />
                  </View>
                  <View>
                    <Text className="text-slate-800 font-bold text-base mb-1">{account.name}</Text>
                    <Text className="text-slate-500 font-medium text-xs">{account.bank}</Text>
                  </View>
                </View>

                <View className={`w-6 h-6 rounded-full items-center justify-center border-2 ${isDefault ? 'bg-primary border-primary' : 'border-slate-300 bg-transparent'}`}>
                  {isDefault && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <TouchableOpacity className="flex-row items-center justify-center bg-white border-2 border-dashed border-slate-200 py-5 rounded-2xl mb-10 mt-2">
          <Ionicons name="add" size={22} color="#94A3B8" />
          <Text className="text-slate-500 font-bold text-base ml-2">Add New Method</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
