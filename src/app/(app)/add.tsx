import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCategories } from '../../api/categories';
import { useAddTransaction } from '../../api/transactions';

export default function AddScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const isSubscriptionPay = params.is_subscription_pay === 'true';
  const subId = params.subscription_id ? parseInt(params.subscription_id as string) : null;

  const { data: categories, isLoading: isCatsLoading } = useCategories();
  const addTransaction = useAddTransaction();

  // Form State
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  
  // Image State
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  // Modal State
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);

  // Pre-fill if coming from Subscription
  useEffect(() => {
    if (isSubscriptionPay) {
      setType('expense');
      if (params.amount) setAmount(params.amount as string);
      if (params.title) setTitle(params.title as string);
      if (params.category_id) setCategoryId(parseInt(params.category_id as string));
      setDescription(`Manual payment for ${params.title}`);
    }
  }, [isSubscriptionPay]);

  const handleAmountChange = (text: string) => {
    if (isSubscriptionPay) return; // Non-editable

    let formattedText = text.replace(/[^0-9.]/g, ''); // strip non-numbers
    
    if (formattedText.startsWith('.')) {
      formattedText = '0' + formattedText;
    }

    const parts = formattedText.split('.');
    if (parts.length > 2) {
      formattedText = parts[0] + '.' + parts.slice(1).join('');
    }

    const splitFormat = formattedText.split('.');
    let whole = splitFormat[0];
    let decimal = splitFormat.length > 1 ? splitFormat[1] : null;

    if (whole.length > 8) whole = whole.substring(0, 8);
    if (decimal !== null && decimal.length > 3) decimal = decimal.substring(0, 3);

    const finalAmount = decimal !== null ? `${whole}.${decimal}` : whole;
    setAmount(finalAmount);
  };

  const handleUploadReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera roll access to upload receipts.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!amount || !title || !categoryId) {
      Alert.alert('Missing Fields', 'Please fill in the amount, title, and category.');
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    try {
      if (receiptUri) {
        // Use FormData
        const formData = new FormData() as any;
        formData.append('title', title);
        formData.append('amount', amount);
        formData.append('type', type);
        formData.append('date', date);
        formData.append('category_id', categoryId.toString());
        if (description) formData.append('description', description);
        if (subId) formData.append('subscription_id', subId.toString());

        // Append file
        const filename = receiptUri.split('/').pop() || 'receipt.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const typeMatch = match ? `image/${match[1]}` : `image`;

        formData.append('receipt', {
          uri: receiptUri,
          name: filename,
          type: typeMatch,
        });

        await addTransaction.mutateAsync(formData);
      } else {
        // JSON payload
        await addTransaction.mutateAsync({
          title,
          amount: parseFloat(amount),
          type,
          date,
          category_id: categoryId,
          description,
          subscription_id: subId
        });
      }

      Alert.alert('Success', 'Transaction saved successfully!');
      
      if (isSubscriptionPay) {
        router.back();
      } else {
        setAmount('');
        setTitle('');
        setDescription('');
        setCategoryId(null);
        setReceiptUri(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  const selectedCategory = categories?.find(c => parseInt(c.id.toString()) === categoryId);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Amount Input */}
        <View className="items-center mt-6 mb-10">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Amount</Text>
          <View className="flex-row items-center justify-center">
            <Text className="text-5xl font-extrabold text-slate-800 mr-2" style={{ includeFontPadding: false }}>$</Text>
            <TextInput 
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor="#CBD5E1"
              keyboardType="decimal-pad"
              editable={!isSubscriptionPay}
              className={`text-5xl font-extrabold p-0 m-0 ${isSubscriptionPay ? 'text-slate-400' : 'text-slate-800'}`}
              style={{ includeFontPadding: false }}
              maxLength={12}
            />
          </View>
        </View>

        {/* Form Fields container */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-100 mb-6">
          
          {/* Title */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Title</Text>
          <View className={`rounded-2xl px-4 py-4 mb-5 border ${isSubscriptionPay ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
            <TextInput 
              value={title}
              onChangeText={setTitle}
              placeholder="What was this for?"
              placeholderTextColor="#94A3B8"
              editable={!isSubscriptionPay}
              className={`text-base font-bold ${isSubscriptionPay ? 'text-slate-500' : 'text-slate-800'}`}
            />
          </View>

          {/* Type Radio Buttons */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Transaction Type</Text>
          <View className="flex-row items-center mb-5 ml-1">
            <TouchableOpacity 
              className="flex-row items-center mr-6"
              onPress={() => !isSubscriptionPay && setType('expense')}
              activeOpacity={isSubscriptionPay ? 1 : 0.7}
            >
              <Ionicons 
                name={type === 'expense' ? 'radio-button-on' : 'radio-button-off'} 
                size={22} 
                color={type === 'expense' ? (isSubscriptionPay ? '#FCA5A5' : '#EF4444') : '#94A3B8'} 
              />
              <Text className={`text-base font-bold ml-2 ${type === 'expense' ? (isSubscriptionPay ? 'text-slate-500' : 'text-slate-800') : 'text-slate-400'}`}>Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => !isSubscriptionPay && setType('income')}
              activeOpacity={isSubscriptionPay ? 1 : 0.7}
            >
              <Ionicons 
                name={type === 'income' ? 'radio-button-on' : 'radio-button-off'} 
                size={22} 
                color={type === 'income' ? (isSubscriptionPay ? '#86EFAC' : '#22C55E') : '#94A3B8'} 
              />
              <Text className={`text-base font-bold ml-2 ${type === 'income' ? (isSubscriptionPay ? 'text-slate-500' : 'text-slate-800') : 'text-slate-400'}`}>Income</Text>
            </TouchableOpacity>
          </View>

          {/* Category Dropdown */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Category</Text>
          <TouchableOpacity 
            onPress={() => !isSubscriptionPay && setCategoryModalVisible(true)}
            activeOpacity={isSubscriptionPay ? 1 : 0.7}
            className={`flex-row items-center justify-between rounded-2xl px-4 py-4 mb-5 border ${isSubscriptionPay ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-100'}`}
          >
            {selectedCategory ? (
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: selectedCategory.color + '20' }}>
                  <Ionicons name={selectedCategory.iconName as any} size={16} color={selectedCategory.color} />
                </View>
                <Text className={`text-base font-bold ${isSubscriptionPay ? 'text-slate-500' : 'text-slate-800'}`}>{selectedCategory.name}</Text>
              </View>
            ) : (
              <Text className="text-base font-bold text-slate-400">Select a category...</Text>
            )}
            {!isSubscriptionPay && <Ionicons name="chevron-down" size={20} color="#94A3B8" />}
          </TouchableOpacity>

          {/* Description */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Description (Optional)</Text>
          <View className="bg-slate-50 rounded-2xl px-4 py-4 border border-slate-100 mb-5 min-h-[100px]">
            <TextInput 
              value={description}
              onChangeText={setDescription}
              placeholder="Add notes..."
              placeholderTextColor="#94A3B8"
              className="text-base font-medium text-slate-800"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ flex: 1 }}
            />
          </View>

          {/* Receipt Upload */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Receipt (Optional)</Text>
          <TouchableOpacity 
            onPress={handleUploadReceipt}
            className={`rounded-2xl border-2 border-dashed items-center justify-center py-6 ${receiptUri ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}
          >
            {receiptUri ? (
              <>
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-2">
                  <Ionicons name="checkmark-circle" size={28} color="#22C55E" />
                </View>
                <Text className="text-base font-bold text-green-700">Receipt Attached</Text>
                <Text className="text-xs text-green-600 mt-1">Tap to change</Text>
              </>
            ) : (
              <>
                <View className="w-12 h-12 rounded-full bg-slate-200 items-center justify-center mb-2">
                  <Ionicons name="camera" size={24} color="#64748B" />
                </View>
                <Text className="text-base font-bold text-slate-600">Upload Receipt Image</Text>
                <Text className="text-xs text-slate-400 mt-1">JPG, PNG</Text>
              </>
            )}
          </TouchableOpacity>

        </View>

        {/* Save Button */}
        <TouchableOpacity 
          onPress={handleSave}
          disabled={addTransaction.isPending}
          activeOpacity={0.8}
          className="bg-primary rounded-full py-4 items-center shadow-sm shadow-primary/30"
        >
          {addTransaction.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white font-extrabold text-lg tracking-wide">
              {isSubscriptionPay ? "Log Payment" : "Save Transaction"}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Category Selection Custom Overlay */}
      <Modal visible={isCategoryModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 z-50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 h-[70%]">
            <View className="flex-row items-center justify-between px-5 pb-4 border-b border-slate-100 mb-4">
              <Text className="text-lg font-extrabold text-slate-800">Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Text className="text-slate-500 font-bold text-base">Close</Text>
              </TouchableOpacity>
            </View>
            
            {isCatsLoading ? (
              <ActivityIndicator color="#6BCB77" />
            ) : (
              <FlatList
                data={categories || []}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => {
                      setCategoryId(item.id);
                      setCategoryModalVisible(false);
                    }}
                    className="flex-row items-center py-4 border-b border-slate-50"
                  >
                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: item.color + '20' }}>
                      <Ionicons name={item.iconName as any} size={20} color={item.color} />
                    </View>
                    <Text className="text-base font-bold text-slate-800">{item.name}</Text>
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
