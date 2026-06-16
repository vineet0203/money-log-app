import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock Categories
const CATEGORIES = [
  { id: '1', name: 'Food & Dining', iconName: 'fast-food', color: '#F97316' },
  { id: '2', name: 'Housing', iconName: 'home', color: '#3B82F6' },
  { id: '3', name: 'Transportation', iconName: 'car', color: '#A855F7' },
  { id: '4', name: 'Entertainment', iconName: 'game-controller', color: '#10B981' },
  { id: '5', name: 'Salary', iconName: 'cash', color: '#EAB308' },
];

export default function AddScreen() {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);

  const handleAmountChange = (text: string) => {
    let formattedText = text.replace(/[^0-9.]/g, ''); // strip non-numbers
    
    if (formattedText.startsWith('.')) {
      formattedText = '0' + formattedText;
    }

    // Prevent multiple decimals
    const parts = formattedText.split('.');
    if (parts.length > 2) {
      formattedText = parts[0] + '.' + parts.slice(1).join('');
    }

    // Enforce digit limits
    const splitFormat = formattedText.split('.');
    let whole = splitFormat[0];
    let decimal = splitFormat.length > 1 ? splitFormat[1] : null;

    if (whole.length > 8) whole = whole.substring(0, 8);
    if (decimal !== null && decimal.length > 3) decimal = decimal.substring(0, 3);

    const finalAmount = decimal !== null ? `${whole}.${decimal}` : whole;
    setAmount(finalAmount);
  };

  const handleSave = () => {
    if (!amount || !title || !selectedCategory) {
      Alert.alert('Missing Fields', 'Please fill in the amount, title, and category.');
      return;
    }
    Alert.alert('Success', 'Transaction saved successfully!');
    // Reset form
    setAmount('');
    setTitle('');
    setDescription('');
    setSelectedCategory(null);
    setReceiptUploaded(false);
  };

  const handleUploadReceipt = () => {
    Alert.alert('Upload Receipt', 'Image Picker would open here.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mock Upload', onPress: () => setReceiptUploaded(true) }
    ]);
  };

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
              className="text-5xl font-extrabold text-slate-800 p-0 m-0"
              style={{ includeFontPadding: false }}
              maxLength={12}
            />
          </View>
        </View>

        {/* Form Fields container */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-100 mb-6">
          
          {/* Title */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Title</Text>
          <View className="bg-slate-50 rounded-2xl px-4 py-4 mb-5 border border-slate-100">
            <TextInput 
              value={title}
              onChangeText={setTitle}
              placeholder="What was this for?"
              placeholderTextColor="#94A3B8"
              className="text-base font-bold text-slate-800"
            />
          </View>

          {/* Type Radio Buttons */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Transaction Type</Text>
          <View className="flex-row items-center mb-5 ml-1">
            <TouchableOpacity 
              className="flex-row items-center mr-6"
              onPress={() => setType('expense')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={type === 'expense' ? 'radio-button-on' : 'radio-button-off'} 
                size={22} 
                color={type === 'expense' ? '#EF4444' : '#94A3B8'} 
              />
              <Text className={`text-base font-bold ml-2 ${type === 'expense' ? 'text-slate-800' : 'text-slate-500'}`}>Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => setType('income')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={type === 'income' ? 'radio-button-on' : 'radio-button-off'} 
                size={22} 
                color={type === 'income' ? '#22C55E' : '#94A3B8'} 
              />
              <Text className={`text-base font-bold ml-2 ${type === 'income' ? 'text-slate-800' : 'text-slate-500'}`}>Income</Text>
            </TouchableOpacity>
          </View>

          {/* Category Dropdown */}
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Category</Text>
          <TouchableOpacity 
            onPress={() => setCategoryModalVisible(true)}
            className="flex-row items-center justify-between bg-slate-50 rounded-2xl px-4 py-4 mb-5 border border-slate-100"
          >
            {selectedCategory ? (
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: selectedCategory.color + '20' }}>
                  <Ionicons name={selectedCategory.iconName as any} size={16} color={selectedCategory.color} />
                </View>
                <Text className="text-base font-bold text-slate-800">{selectedCategory.name}</Text>
              </View>
            ) : (
              <Text className="text-base font-bold text-slate-400">Select a category...</Text>
            )}
            <Ionicons name="chevron-down" size={20} color="#94A3B8" />
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
            className={`rounded-2xl border-2 border-dashed items-center justify-center py-6 ${receiptUploaded ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}
          >
            {receiptUploaded ? (
              <>
                <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-2">
                  <Ionicons name="checkmark-circle" size={28} color="#22C55E" />
                </View>
                <Text className="text-base font-bold text-green-700">Receipt Attached</Text>
              </>
            ) : (
              <>
                <View className="w-12 h-12 rounded-full bg-slate-200 items-center justify-center mb-2">
                  <Ionicons name="camera" size={24} color="#64748B" />
                </View>
                <Text className="text-base font-bold text-slate-600">Upload Receipt Image</Text>
                <Text className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</Text>
              </>
            )}
          </TouchableOpacity>

        </View>

        {/* Save Button */}
        <TouchableOpacity 
          onPress={handleSave}
          activeOpacity={0.8}
          className="bg-primary rounded-full py-4 items-center shadow-sm shadow-primary/30"
        >
          <Text className="text-white font-extrabold text-lg tracking-wide">Save Transaction</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Category Selection Custom Overlay */}
      {isCategoryModalVisible && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 z-50 justify-end">
          <View className="bg-white rounded-t-3xl pt-6 h-[60%]">
            <View className="flex-row items-center justify-between px-5 pb-4 border-b border-slate-100 mb-4">
              <Text className="text-lg font-extrabold text-slate-800">Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Text className="text-slate-500 font-bold text-base">Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
              {CATEGORIES.filter(c => type === 'income' ? c.name === 'Salary' || c.name === 'Other' : true).map(category => (
                <TouchableOpacity 
                  key={category.id} 
                  onPress={() => {
                    setSelectedCategory(category);
                    setCategoryModalVisible(false);
                  }}
                  className="flex-row items-center py-4 border-b border-slate-50"
                >
                  <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: category.color + '20' }}>
                    <Ionicons name={category.iconName as any} size={20} color={category.color} />
                  </View>
                  <Text className="text-base font-bold text-slate-800">{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

    </View>
  );
}
