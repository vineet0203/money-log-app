import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAddSubscription, useUpdateSubscription } from '../../api/subscriptions';
import { useCategories } from '../../api/categories';

interface SubscriptionFormProps {
  initialValues?: {
    id?: number;
    name?: string;
    amount?: string;
    billingCycle?: 'monthly' | 'yearly';
    startDate?: string;
    categoryId?: number | null;
  };
}

export default function SubscriptionForm({ initialValues = {} }: SubscriptionFormProps) {
  const router = useRouter();
  const editingId = initialValues.id || null;

  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const addSub = useAddSubscription();
  const updateSub = useUpdateSubscription();

  const [name, setName] = useState(initialValues.name || '');
  const [amount, setAmount] = useState(initialValues.amount || '');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialValues.billingCycle || 'monthly');
  const [startDate, setStartDate] = useState(initialValues.startDate || new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<number | null>(initialValues.categoryId || null);

  const [pickerVisible, setPickerVisible] = useState(false);

  const handleSave = () => {
    if (!name || !amount || !startDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    if (editingId) {
      updateSub.mutate({
        id: editingId,
        name,
        amount: parseFloat(amount),
        billing_cycle: billingCycle,
        start_date: startDate,
        status: 'active',
        category_id: categoryId
      }, {
        onSuccess: () => router.back(),
        onError: () => Alert.alert('Error', 'Failed to update subscription')
      });
    } else {
      addSub.mutate({
        name,
        amount: parseFloat(amount),
        billing_cycle: billingCycle,
        start_date: startDate,
        status: 'active',
        source: 'Manual',
        category_id: categoryId
      }, {
        onSuccess: () => router.back(),
        onError: () => Alert.alert('Error', 'Failed to add subscription')
      });
    }
  };

  const selectedCategory = categories?.find(c => parseInt(c.id.toString()) === categoryId);

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text className="text-gray-600 mb-2 font-semibold">Name</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
          placeholder="e.g. Netflix, Spotify"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-gray-600 mb-2 font-semibold">Rate ($)</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
          placeholder="15.99"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />

        <Text className="text-gray-600 mb-2 font-semibold">Billing Cycle</Text>
        <View className="flex-row mb-4">
          <TouchableOpacity 
            onPress={() => setBillingCycle('monthly')}
            className={`flex-1 p-3 items-center justify-center border border-gray-200 rounded-l-xl ${billingCycle === 'monthly' ? 'bg-primary border-primary' : 'bg-gray-50'}`}
          >
            <Text className={`font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-600'}`}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setBillingCycle('yearly')}
            className={`flex-1 p-3 items-center justify-center border border-gray-200 border-l-0 rounded-r-xl ${billingCycle === 'yearly' ? 'bg-primary border-primary' : 'bg-gray-50'}`}
          >
            <Text className={`font-bold ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-600'}`}>Yearly</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-600 mb-2 font-semibold">Category</Text>
        <TouchableOpacity 
          onPress={() => setPickerVisible(true)}
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 flex-row items-center justify-between"
        >
          {selectedCategory ? (
            <View className="flex-row items-center">
              <View style={{ backgroundColor: `${selectedCategory.color}20` }} className="p-2 rounded-lg mr-3">
                <Ionicons name={selectedCategory.iconName as any} size={18} color={selectedCategory.color} />
              </View>
              <Text className="text-gray-800 font-bold">{selectedCategory.name}</Text>
            </View>
          ) : (
            <Text className="text-gray-400">Tap to select a category</Text>
          )}
          <Ionicons name="chevron-down" size={20} color="#94A3B8" />
        </TouchableOpacity>

        <Text className="text-gray-600 mb-2 font-semibold">Start Date (YYYY-MM-DD)</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-10 text-gray-800"
          placeholder="2024-10-25"
          value={startDate}
          onChangeText={setStartDate}
        />

        <TouchableOpacity 
          className="bg-primary py-4 rounded-xl items-center shadow-sm shadow-primary/30"
          onPress={handleSave}
          disabled={addSub.isPending || updateSub.isPending}
        >
          {addSub.isPending || updateSub.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-extrabold text-lg tracking-wide">
              {editingId ? "Save Changes" : "Create Subscription"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={pickerVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl h-[70%]">
            <View className="flex-row justify-between items-center p-6 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-800">Select Category</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {isLoadingCats ? (
              <ActivityIndicator color="#6BCB77" className="mt-10" />
            ) : (
              <FlatList
                data={[{ id: null, name: 'None', color: '#94A3B8', iconName: 'folder-outline' } as any, ...(categories || [])]}
                keyExtractor={(item) => item.id ? item.id.toString() : 'none'}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setCategoryId(item.id ? parseInt(item.id.toString()) : null);
                      setPickerVisible(false);
                    }}
                    className={`flex-row items-center p-4 mb-2 rounded-2xl border ${categoryId === (item.id ? parseInt(item.id.toString()) : null) ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white'}`}
                  >
                    <View style={{ backgroundColor: `${item.color}20` }} className="w-12 h-12 rounded-xl items-center justify-center mr-4">
                      <Ionicons name={item.iconName} size={24} color={item.color} />
                    </View>
                    <Text className={`font-bold text-lg ${categoryId === (item.id ? parseInt(item.id.toString()) : null) ? 'text-primary' : 'text-gray-800'}`}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
