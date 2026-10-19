import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import dayjs from 'dayjs';
import {
  useTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '../../api/transactions';
import { useCategories } from '../../api/categories';
import { getBackendUrl } from '../../store/authStore';

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: transaction, isLoading, isError, refetch } = useTransaction(id as string);
  const { data: categories } = useCategories();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  // Modal States
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isReceiptModalVisible, setReceiptModalVisible] = useState(false);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const openEditModal = () => {
    if (!transaction) return;
    setEditTitle(transaction.title || '');
    setEditAmount(transaction.amount ? String(Math.abs(parseFloat(transaction.amount))) : '');
    setEditType((transaction.type as 'income' | 'expense') || 'expense');
    setEditCategoryId(transaction.category_id || null);
    setEditNotes(transaction.description || '');
    setConfirmModalVisible(false);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a transaction title.');
      return;
    }
    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0.');
      return;
    }

    setConfirmModalVisible(true);
  };

  const handleConfirmSave = async () => {
    const parsedAmount = parseFloat(editAmount);
    try {
      await updateMutation.mutateAsync({
        id: id as string,
        data: {
          title: editTitle.trim(),
          amount: parsedAmount,
          type: editType,
          category_id: editCategoryId,
          description: editNotes.trim(),
        },
      });

      Toast.show({
        type: 'success',
        text1: 'Updated',
        text2: 'Transaction updated successfully.',
      });
      setConfirmModalVisible(false);
      setEditModalVisible(false);
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update transaction';
      Alert.alert('Update Failed', msg);
      setConfirmModalVisible(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/transactions');
    }
  };

  const handleDelete = () => {
    if (!transaction) return;

    const isLinked = Boolean(transaction.subscription_id);

    Alert.alert(
      'Delete Transaction',
      isLinked
        ? `This transaction is linked to recurring payment "${transaction.subscription_name || 'Recurring'}". Are you sure you want to delete this record?`
        : `Are you sure you want to delete "${transaction.title}" ($${parseFloat(transaction.amount).toFixed(2)})? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id as string);
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Transaction removed successfully.',
              });
              handleBack();
            } catch (err: any) {
              const msg = err?.response?.data?.error || err?.message || 'Failed to delete transaction';
              Alert.alert('Delete Failed', msg);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#159A1D" />
        <Text className="text-slate-400 font-semibold text-xs mt-3">Loading details...</Text>
      </View>
    );
  }

  if (isError || !transaction) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-3xl bg-red-50 items-center justify-center mb-3">
          <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        </View>
        <Text className="text-lg font-bold text-slate-900 mb-1">Transaction Not Found</Text>
        <Text className="text-xs text-slate-500 text-center mb-5">
          This transaction may have been removed or does not exist.
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          className="bg-slate-900 px-6 py-2.5 rounded-full"
        >
          <Text className="text-white font-bold text-xs">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const amountStr = `${isExpense ? '-' : '+'}$${Math.abs(parseFloat(transaction.amount)).toFixed(2)}`;
  const isLinkedSubscription = Boolean(transaction.subscription_id);

  // Colors & Icons
  const categoryColor = transaction.category_color || (isIncome ? '#159A1D' : '#64748B');
  const categoryIcon = transaction.category_icon || (isIncome ? 'arrow-down' : 'arrow-up');
  const iconBg = `${categoryColor}18`;

  // Receipt URL resolution
  let receiptUrl = transaction.receipt_url || null;
  if (receiptUrl && !receiptUrl.startsWith('http')) {
    const base = getBackendUrl().replace(/\/api\/?$/, '');
    receiptUrl = `${base}${receiptUrl.startsWith('/') ? '' : '/'}${receiptUrl}`;
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Top Navigation Header */}
      <View
        className="flex-row items-center justify-between px-5 pb-3.5 bg-white border-b border-slate-100"
        style={{ paddingTop: insets.top + (Platform.OS === 'ios' ? 8 : 12) }}
      >
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-base font-extrabold text-slate-900">Transaction Details</Text>

        <View className="flex-row items-center space-x-2">
          {/* Edit Icon Button */}
          <TouchableOpacity
            onPress={openEditModal}
            className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mr-2"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={17} color="#0F172A" />
          </TouchableOpacity>

          {/* Delete Icon Button */}
          <TouchableOpacity
            onPress={handleDelete}
            className="w-10 h-10 rounded-full bg-rose-50 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}
      >
        {/* Hero Card */}
        <View className="bg-white rounded-3xl p-6 items-center border border-slate-100 shadow-sm shadow-slate-100 mb-4">
          {/* Icon with Direction Indicator */}
          <View className="relative mb-3">
            <View
              className="w-16 h-16 rounded-3xl items-center justify-center border border-slate-100"
              style={{ backgroundColor: iconBg }}
            >
              <Ionicons name={categoryIcon as any} size={30} color={categoryColor} />
            </View>

            <View
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-white ${
                isIncome ? 'bg-[#159A1D]' : 'bg-slate-400'
              }`}
            >
              <Ionicons
                name={isIncome ? 'arrow-down' : 'arrow-up'}
                size={11}
                color="#FFFFFF"
              />
            </View>
          </View>

          {/* Amount */}
          <Text
            className={`text-4xl font-black tracking-tight mb-1 ${
              isIncome ? 'text-[#159A1D]' : 'text-slate-900'
            }`}
          >
            {amountStr}
          </Text>

          {/* Title */}
          <Text className="text-lg font-extrabold text-slate-800 text-center mb-2">
            {transaction.title}
          </Text>

          {/* Category Pill */}
          <View className="flex-row items-center bg-slate-100 px-3 py-1 rounded-full">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: categoryColor }}
            />
            <Text className="text-xs font-bold text-slate-700">
              {transaction.category_name || (isIncome ? 'Income' : 'Expense')}
            </Text>
            <Text className="text-slate-400 text-xs mx-1.5">•</Text>
            <Text className="text-xs font-semibold text-slate-500 capitalize">
              {transaction.type}
            </Text>
          </View>
        </View>

        {/* Linked Recurring Payment Card (if subscription linked) */}
        {isLinkedSubscription && (
          <TouchableOpacity
            onPress={() => router.push(`/subscription/${transaction.subscription_id}`)}
            activeOpacity={0.8}
            className="bg-purple-50/80 rounded-2xl p-4 border border-purple-100 mb-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-10 h-10 rounded-xl bg-purple-100 items-center justify-center mr-3">
                <Ionicons name="repeat" size={20} color="#7C3AED" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-xs font-extrabold text-purple-900 uppercase tracking-wider">
                    Linked Recurring Rule
                  </Text>
                </View>
                <Text className="text-sm font-bold text-purple-950 mt-0.5">
                  {transaction.subscription_name || 'Recurring Subscription'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
          </TouchableOpacity>
        )}

        {/* Transaction Information Details */}
        <Text className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 ml-1">
          Information
        </Text>
        <View className="bg-white rounded-2xl border border-slate-100 shadow-xs shadow-slate-100 mb-4 overflow-hidden">
          {/* Date Row */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={18} color="#94A3B8" className="mr-3" />
              <Text className="text-sm font-semibold text-slate-500">Date</Text>
            </View>
            <Text className="text-sm font-bold text-slate-900">
              {dayjs(transaction.date).format('MMMM D, YYYY')}
            </Text>
          </View>

          {/* Time Row */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={18} color="#94A3B8" className="mr-3" />
              <Text className="text-sm font-semibold text-slate-500">Recorded At</Text>
            </View>
            <Text className="text-sm font-bold text-slate-900">
              {dayjs(transaction.created_at || transaction.date).format('h:mm A')}
            </Text>
          </View>

          {/* Category Row */}
          <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
            <View className="flex-row items-center">
              <Ionicons name="folder-outline" size={18} color="#94A3B8" className="mr-3" />
              <Text className="text-sm font-semibold text-slate-500">Category</Text>
            </View>
            <View className="flex-row items-center">
              <View
                className="w-2.5 h-2.5 rounded-full mr-2"
                style={{ backgroundColor: categoryColor }}
              />
              <Text className="text-sm font-bold text-slate-900">
                {transaction.category_name || 'Uncategorized'}
              </Text>
            </View>
          </View>

          {/* Reference ID Row */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Ionicons name="barcode-outline" size={18} color="#94A3B8" className="mr-3" />
              <Text className="text-sm font-semibold text-slate-500">Reference ID</Text>
            </View>
            <Text className="text-sm font-mono font-bold text-slate-600">
              #TX-{transaction.id}
            </Text>
          </View>
        </View>

        {/* Notes / Description Section */}
        <Text className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 ml-1">
          Note / Memo
        </Text>
        <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs shadow-slate-100 mb-4">
          <Text
            className={`text-sm leading-relaxed ${
              transaction.description ? 'text-slate-800 font-medium' : 'text-slate-400 italic'
            }`}
          >
            {transaction.description || 'No notes added for this transaction.'}
          </Text>
        </View>

        {/* Receipt Section */}
        <Text className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2 ml-1">
          Receipt Attachment
        </Text>
        <View className="bg-white rounded-2xl border border-slate-100 shadow-xs shadow-slate-100 overflow-hidden mb-6">
          {receiptUrl ? (
            <TouchableOpacity
              onPress={() => setReceiptModalVisible(true)}
              activeOpacity={0.85}
              className="relative"
            >
              <Image
                source={{ uri: receiptUrl }}
                className="w-full h-56 bg-slate-100"
                resizeMode="cover"
              />
              <View className="absolute bottom-3 right-3 bg-slate-900/80 px-3 py-1.5 rounded-full flex-row items-center">
                <Ionicons name="expand-outline" size={14} color="#FFF" />
                <Text className="text-white text-xs font-bold ml-1.5">View Full</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="py-8 items-center justify-center">
              <View className="w-12 h-12 rounded-full bg-slate-50 items-center justify-center mb-2 border border-slate-100">
                <Ionicons name="receipt-outline" size={22} color="#94A3B8" />
              </View>
              <Text className="text-xs font-semibold text-slate-400">No receipt uploaded</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center space-x-3 gap-3">
          <TouchableOpacity
            onPress={openEditModal}
            className="flex-1 bg-[#159A1D] py-3.5 rounded-2xl items-center justify-center flex-row shadow-sm shadow-[#159A1D]/20"
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={16} color="#FFF" />
            <Text className="text-white font-extrabold text-sm ml-2">Edit Transaction</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            className="w-14 py-3.5 rounded-2xl bg-rose-50 border border-rose-100 items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Fullscreen Receipt Lightbox Modal */}
      <Modal
        visible={isReceiptModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReceiptModalVisible(false)}
      >
        <View className="flex-1 bg-black/95 justify-between">
          <View
            className="flex-row justify-between items-center px-5 pb-3"
            style={{ paddingTop: insets.top + 10 }}
          >
            <Text className="text-white font-bold text-base">Receipt Preview</Text>
            <TouchableOpacity
              onPress={() => setReceiptModalVisible(false)}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Ionicons name="close" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-center items-center px-4">
            {receiptUrl && (
              <Image
                source={{ uri: receiptUrl }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View
            className="flex-row justify-between items-center px-5 py-4 border-b border-slate-100"
            style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 12 : 8) }}
          >
            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              className="py-1 pr-3"
              activeOpacity={0.7}
            >
              <Text className="text-slate-500 font-bold text-sm">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-base font-extrabold text-slate-900">Edit Transaction</Text>
            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator size="small" color="#159A1D" />
              ) : (
                <Text className="text-[#159A1D] font-extrabold text-sm">Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 px-5 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Type Selector (Income vs Expense) */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Type
            </Text>
            <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-4">
              <TouchableOpacity
                onPress={() => setEditType('expense')}
                className={`flex-1 py-2.5 items-center justify-center rounded-xl flex-row ${
                  editType === 'expense' ? 'bg-white shadow-xs' : ''
                }`}
              >
                <Ionicons
                  name="arrow-up"
                  size={14}
                  color={editType === 'expense' ? '#EF4444' : '#64748B'}
                  className="mr-1"
                />
                <Text
                  className={`text-xs ${
                    editType === 'expense'
                      ? 'text-slate-900 font-extrabold'
                      : 'text-slate-500 font-medium'
                  }`}
                >
                  Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEditType('income')}
                className={`flex-1 py-2.5 items-center justify-center rounded-xl flex-row ${
                  editType === 'income' ? 'bg-white shadow-xs' : ''
                }`}
              >
                <Ionicons
                  name="arrow-down"
                  size={14}
                  color={editType === 'income' ? '#159A1D' : '#64748B'}
                  className="mr-1"
                />
                <Text
                  className={`text-xs ${
                    editType === 'income'
                      ? 'text-slate-900 font-extrabold'
                      : 'text-slate-500 font-medium'
                  }`}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title Input */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Title
            </Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="e.g. Salary, Grocery, Rent"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[15px] font-semibold text-slate-900 mb-4"
            />

            {/* Amount Input */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Amount ($)
            </Text>
            <TextInput
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-lg font-black text-slate-900 mb-4"
            />

            {/* Category Selector */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row mb-4"
            >
              {categories?.map((cat) => {
                const isSelected = editCategoryId === Number(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setEditCategoryId(Number(cat.id))}
                    className={`mr-2 px-3 py-2 rounded-xl flex-row items-center border ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <View
                      className="w-2.5 h-2.5 rounded-full mr-2"
                      style={{ backgroundColor: cat.color || '#3B82F6' }}
                    />
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Description Notes */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Note
            </Text>
            <TextInput
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Add any additional details or notes..."
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-800 min-h-[100px] mb-6"
            />

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={updateMutation.isPending}
              className="w-full bg-[#159A1D] py-4 rounded-2xl items-center justify-center flex-row shadow-sm shadow-[#159A1D]/20 mb-6"
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-white font-extrabold text-sm">Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>

          {/* Confirm Save Changes Modal Overlay */}
          {isConfirmModalVisible && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.45)',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 24,
                zIndex: 999,
              }}
            >
              <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100">
                {/* Header Icon */}
                <View className="w-12 h-12 rounded-2xl bg-emerald-50 items-center justify-center mx-auto mb-3 border border-emerald-100">
                  <Ionicons name="checkmark-done" size={24} color="#159A1D" />
                </View>

                <Text className="text-lg font-black text-slate-900 text-center mb-1">
                  Save Changes?
                </Text>
                <Text className="text-xs text-slate-500 font-medium text-center mb-4 leading-relaxed">
                  Are you sure you want to update this transaction with the new details?
                </Text>

                {/* Change Summary Card */}
                <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5">
                  <View className="flex-row justify-between items-center py-1.5 border-b border-slate-200/60">
                    <Text className="text-xs font-semibold text-slate-400">Title</Text>
                    <Text className="text-xs font-bold text-slate-800" numberOfLines={1}>
                      {editTitle.trim()}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center py-1.5 border-b border-slate-200/60">
                    <Text className="text-xs font-semibold text-slate-400">Type</Text>
                    <Text
                      className={`text-xs font-bold capitalize ${
                        editType === 'income' ? 'text-emerald-600' : 'text-slate-800'
                      }`}
                    >
                      {editType}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center py-1.5 border-b border-slate-200/60">
                    <Text className="text-xs font-semibold text-slate-400">Amount</Text>
                    <Text
                      className={`text-sm font-black ${
                        editType === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {editType === 'income' ? '+' : '-'}${parseFloat(editAmount || '0').toFixed(2)}
                    </Text>
                  </View>

                  {categories?.find((c) => Number(c.id) === editCategoryId)?.name && (
                    <View className="flex-row justify-between items-center py-1.5">
                      <Text className="text-xs font-semibold text-slate-400">Category</Text>
                      <Text className="text-xs font-bold text-slate-800">
                        {categories.find((c) => Number(c.id) === editCategoryId)?.name}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setConfirmModalVisible(false)}
                    disabled={updateMutation.isPending}
                    className="flex-1 py-3.5 rounded-xl bg-slate-100 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-xs font-bold text-slate-600">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleConfirmSave}
                    disabled={updateMutation.isPending}
                    className="flex-1 py-3.5 rounded-xl bg-[#159A1D] items-center justify-center flex-row shadow-sm shadow-[#159A1D]/30"
                    activeOpacity={0.7}
                  >
                    {updateMutation.isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text className="text-xs font-extrabold text-white">Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
