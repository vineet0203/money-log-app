import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';
import CustomSwitch from '../common/CustomSwitch';
import {
  useAddSubscription,
  useUpdateSubscription,
  useGetRecurrencePreview,
  RecurrenceFrequency,
  RecurrenceEndMode,
} from '../../api/subscriptions';
import { useCategories } from '../../api/categories';

interface SubscriptionFormProps {
  initialValues?: {
    id?: number;
    name?: string;
    amount?: string;
    type?: 'expense' | 'income';
    billingCycle?: 'monthly' | 'yearly';
    frequency?: RecurrenceFrequency;
    intervalCount?: number;
    byMonthDay?: number;
    byWeekday?: number;
    endMode?: RecurrenceEndMode;
    endDate?: string;
    occurrencesTotal?: number;
    autoPost?: boolean;
    startDate?: string;
    categoryId?: number | null;
  };
}

const FREQUENCY_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly (Every 2 wks)' },
  { value: 'quarterly', label: 'Quarterly (3 mos)' },
  { value: 'half_yearly', label: 'Half-yearly (6 mos)' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'daily', label: 'Daily' },
];

const END_MODE_OPTIONS: { value: RecurrenceEndMode; label: string }[] = [
  { value: 'never', label: 'Never (Ongoing)' },
  { value: 'on_date', label: 'On specific date' },
  { value: 'after_n', label: 'After N payments' },
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SubscriptionForm({ initialValues = {} }: SubscriptionFormProps) {
  const router = useRouter();
  const editingId = initialValues.id || null;

  const { data: categories, isLoading: isLoadingCats } = useCategories();
  const addSub = useAddSubscription();
  const updateSub = useUpdateSubscription();

  // Basic Details
  const [type, setType] = useState<'expense' | 'income'>(initialValues.type || 'expense');
  const [name, setName] = useState(initialValues.name || '');
  const [amount, setAmount] = useState(initialValues.amount || '');
  const [categoryId, setCategoryId] = useState<number | null>(initialValues.categoryId || null);
  const [startDate, setStartDate] = useState(
    initialValues.startDate || dayjs().format('YYYY-MM-DD')
  );

  // Recurrence Cadence Parameters matching Web
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    initialValues.frequency || initialValues.billingCycle || 'monthly'
  );
  const [intervalCount, setIntervalCount] = useState<number>(initialValues.intervalCount || 1);
  const [byMonthDay, setByMonthDay] = useState<number>(
    initialValues.byMonthDay !== undefined
      ? initialValues.byMonthDay
      : dayjs(startDate).isValid()
      ? dayjs(startDate).date()
      : 1
  );
  const [byWeekday, setByWeekday] = useState<number>(
    initialValues.byWeekday !== undefined
      ? initialValues.byWeekday
      : dayjs(startDate).isValid()
      ? dayjs(startDate).day()
      : 1
  );
  const [endMode, setEndMode] = useState<RecurrenceEndMode>(initialValues.endMode || 'never');
  const [endDate, setEndDate] = useState<string>(initialValues.endDate || '');
  const [occurrencesTotal, setOccurrencesTotal] = useState<string>(
    initialValues.occurrencesTotal ? initialValues.occurrencesTotal.toString() : ''
  );
  const [autoPost, setAutoPost] = useState<boolean>(Boolean(initialValues.autoPost));

  // Category modal picker
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  // Live Recurrence Preview Query
  const { data: previewDates = [], isLoading: isLoadingPreview } = useGetRecurrencePreview(
    {
      start_date: startDate,
      frequency,
      interval_count: intervalCount,
      by_month_day: ['monthly', 'quarterly', 'half_yearly', 'yearly'].includes(frequency)
        ? byMonthDay
        : undefined,
      by_weekday: ['weekly', 'biweekly'].includes(frequency) ? byWeekday : undefined,
      end_mode: endMode,
      end_date: endMode === 'on_date' ? endDate : undefined,
      occurrences_total:
        endMode === 'after_n' && occurrencesTotal ? parseInt(occurrencesTotal, 10) : undefined,
      count: 3,
    },
    Boolean(startDate)
  );

  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate);
    const dt = dayjs(newDate);
    if (dt.isValid()) {
      setByMonthDay(dt.date());
      setByWeekday(dt.day());
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a name or title.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount.');
      return;
    }
    if (!startDate) {
      Alert.alert('Validation Error', 'Please select a first payment start date.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Validation Error', 'Please select a category.');
      return;
    }
    if (endMode === 'on_date' && !endDate) {
      Alert.alert('Validation Error', 'Please enter an end date.');
      return;
    }
    if (endMode === 'after_n' && (!occurrencesTotal || parseInt(occurrencesTotal, 10) <= 0)) {
      Alert.alert('Validation Error', 'Please enter total number of occurrences.');
      return;
    }

    const payload = {
      name: name.trim(),
      amount: numericAmount,
      type,
      billing_cycle: (frequency === 'yearly' ? 'yearly' : 'monthly') as 'monthly' | 'yearly',
      frequency,
      interval_count: intervalCount,
      by_month_day: ['monthly', 'quarterly', 'half_yearly', 'yearly'].includes(frequency)
        ? byMonthDay
        : null,
      by_weekday: ['weekly', 'biweekly'].includes(frequency) ? byWeekday : null,
      end_mode: endMode,
      end_date: endMode === 'on_date' ? endDate : null,
      occurrences_total:
        endMode === 'after_n' && occurrencesTotal ? parseInt(occurrencesTotal, 10) : null,
      auto_post: autoPost,
      start_date: startDate,
      category_id: categoryId,
      status: 'active' as const,
      source: 'Manual Added',
    };

    try {
      if (editingId) {
        await updateSub.mutateAsync({
          id: editingId,
          ...payload,
        });
        Toast.show({
          type: 'success',
          text1: 'Updated Successfully',
          text2: `Saved changes to "${name}".`,
        });
      } else {
        await addSub.mutateAsync(payload);
        Toast.show({
          type: 'success',
          text1: 'Recurring Rule Created',
          text2: `Successfully added "${name}".`,
        });
      }
      router.back();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to save recurring payment';
      Alert.alert('Error', msg);
    }
  };

  const selectedCategory = categories?.find(
    (c) => parseInt(c.id.toString()) === categoryId
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type Toggle matching Web (Expense vs Income) */}
        <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-5">
          <TouchableOpacity
            onPress={() => setType('expense')}
            activeOpacity={0.7}
            className={`flex-1 py-2.5 items-center justify-center rounded-xl border ${
              type === 'expense'
                ? 'bg-rose-50 border-rose-200 shadow-xs'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                type === 'expense' ? 'text-rose-600 font-black' : 'text-slate-500'
              }`}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setType('income')}
            activeOpacity={0.7}
            className={`flex-1 py-2.5 items-center justify-center rounded-xl border ${
              type === 'income'
                ? 'bg-emerald-50 border-emerald-200 shadow-xs'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                type === 'income' ? 'text-[#159A1D] font-black' : 'text-slate-500'
              }`}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Name / Title Input */}
        <View className="mb-4">
          <Text className="text-xs font-bold text-slate-700 mb-1.5">Name / Title *</Text>
          <TextInput
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900"
            placeholder="e.g. Netflix, Apartment Rent, Salary"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Amount Input */}
        <View className="mb-4">
          <Text className="text-xs font-bold text-slate-700 mb-1.5">Amount ($) *</Text>
          <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
            <Text className="text-base font-extrabold text-slate-400 mr-1.5">$</Text>
            <TextInput
              className="flex-1 text-base font-bold text-slate-900 p-0"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* Category Selector */}
        <View className="mb-4">
          <Text className="text-xs font-bold text-slate-700 mb-1.5">Category *</Text>
          <TouchableOpacity
            onPress={() => setCategoryPickerVisible(true)}
            activeOpacity={0.7}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex-row items-center justify-between"
          >
            {selectedCategory ? (
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: `${selectedCategory.color || '#159A1D'}20` }}
                  className="w-7 h-7 rounded-lg items-center justify-center mr-2.5"
                >
                  <Ionicons
                    name={(selectedCategory.iconName as any) || 'folder-outline'}
                    size={16}
                    color={selectedCategory.color || '#159A1D'}
                  />
                </View>
                <Text className="text-sm font-bold text-slate-900">{selectedCategory.name}</Text>
              </View>
            ) : (
              <Text className="text-sm font-medium text-slate-400">Select a category</Text>
            )}
            <Ionicons name="chevron-down" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* First Payment / Start Date */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className="text-xs font-bold text-slate-700">First Payment / Start Date *</Text>
            {Boolean(editingId) ? (
              <View className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex-row items-center">
                <Ionicons name="lock-closed" size={10} color="#D97706" className="mr-1" />
                <Text className="text-[10px] font-bold text-amber-700">Locked on Edit</Text>
              </View>
            ) : (
              <Text className="text-[10px] text-slate-400 font-medium">YYYY-MM-DD</Text>
            )}
          </View>
          <View
            className={`flex-row items-center rounded-2xl px-4 py-3 border ${
              Boolean(editingId)
                ? 'bg-slate-100 border-slate-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <Ionicons
              name={Boolean(editingId) ? 'lock-closed-outline' : 'calendar-outline'}
              size={17}
              color={Boolean(editingId) ? '#94A3B8' : '#64748B'}
              className="mr-2.5"
            />
            <TextInput
              className={`flex-1 text-sm font-semibold p-0 ${
                Boolean(editingId) ? 'text-slate-500' : 'text-slate-900'
              }`}
              placeholder="YYYY-MM-DD"
              value={startDate}
              editable={!editingId}
              onChangeText={handleStartDateChange}
            />
          </View>
          {Boolean(editingId) && (
            <Text className="text-[11px] font-medium text-slate-400 mt-1.5">
              Start date cannot be modified once a recurring schedule has materialized occurrences.
            </Text>
          )}
        </View>

        {/* Recurrence Cadence Section matching Web */}
        <View className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/60 mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Recurrence Cadence
            </Text>
            <View className="flex-row items-center bg-slate-200/60 px-2 py-0.5 rounded-md">
              <Ionicons name="repeat" size={12} color="#475569" className="mr-1" />
              <Text className="text-[10.5px] font-bold text-slate-700 capitalize">
                {frequency.replace('_', ' ')}
              </Text>
            </View>
          </View>

          {/* Frequency Horizontal Pills */}
          <View className="mb-3.5">
            <Text className="text-xs font-bold text-slate-600 mb-2">Frequency</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}
              className="flex-row"
            >
              {FREQUENCY_OPTIONS.map((opt) => {
                const isSelected = frequency === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setFrequency(opt.value)}
                    activeOpacity={0.7}
                    className={`px-3 py-2 rounded-xl border ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        isSelected ? 'text-white font-extrabold' : 'text-slate-700 font-semibold'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Interval Stepper */}
          <View className="flex-row justify-between items-center py-2.5 border-t border-slate-200/60 mb-3">
            <View className="flex-1 mr-3">
              <Text className="text-xs font-bold text-slate-700">Repeat Interval</Text>
              <Text className="text-[11px] text-slate-400 mt-0.5">
                Every {intervalCount} {frequency.replace('_', ' ')}
                {intervalCount > 1 ? 's' : ''}
              </Text>
            </View>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-full px-2 py-1">
              <TouchableOpacity
                onPress={() => setIntervalCount(Math.max(1, intervalCount - 1))}
                className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={14} color="#0F172A" />
              </TouchableOpacity>
              <Text className="text-xs font-bold mx-3 text-slate-900 min-w-[20px] text-center">
                {intervalCount}
              </Text>
              <TouchableOpacity
                onPress={() => setIntervalCount(Math.min(365, intervalCount + 1))}
                className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={14} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Anchor Day of Month for Monthly/Quarterly/Half-Yearly/Yearly */}
          {['monthly', 'quarterly', 'half_yearly', 'yearly'].includes(frequency) && (
            <View className="py-2.5 border-t border-slate-200/60 mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-bold text-slate-700">
                  {type === 'income' ? 'Expected Day of Month' : 'Due Day of Month'}
                </Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-full px-2 py-1">
                  <TouchableOpacity
                    onPress={() => setByMonthDay(Math.max(1, byMonthDay - 1))}
                    className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={14} color="#0F172A" />
                  </TouchableOpacity>
                  <Text className="text-xs font-bold mx-3 text-slate-900 min-w-[24px] text-center">
                    {byMonthDay}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setByMonthDay(Math.min(31, byMonthDay + 1))}
                    className="w-7 h-7 rounded-full bg-slate-100 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color="#0F172A" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text className="text-[10.5px] text-slate-400 mt-1">
                Day of each month on which this {type === 'income' ? 'income is expected' : 'bill is due'} (clamped on shorter months).
              </Text>
            </View>
          )}

          {/* Anchor Day of Week for Weekly/Biweekly */}
          {['weekly', 'biweekly'].includes(frequency) && (
            <View className="py-2.5 border-t border-slate-200/60 mb-3">
              <Text className="text-xs font-bold text-slate-700 mb-2">
                {type === 'income' ? 'Expected Day of Week' : 'Due Day of Week'}
              </Text>
              <View className="flex-row justify-between gap-1">
                {WEEKDAY_NAMES.map((dayName, idx) => {
                  const isSelected = byWeekday === idx;
                  return (
                    <TouchableOpacity
                      key={dayName}
                      onPress={() => setByWeekday(idx)}
                      activeOpacity={0.7}
                      className={`flex-1 py-2 items-center justify-center rounded-xl border ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          isSelected ? 'text-white' : 'text-slate-600'
                        }`}
                      >
                        {dayName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* End Condition */}
          <View className="py-2.5 border-t border-slate-200/60">
            <Text className="text-xs font-bold text-slate-700 mb-2">End Condition</Text>
            <View className="flex-row gap-1.5 mb-2.5">
              {END_MODE_OPTIONS.map((opt) => {
                const isSelected = endMode === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setEndMode(opt.value)}
                    activeOpacity={0.7}
                    className={`flex-1 py-2 items-center justify-center rounded-xl border ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-[11px] text-center ${
                        isSelected ? 'text-white font-extrabold' : 'text-slate-600 font-semibold'
                      }`}
                      numberOfLines={1}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {endMode === 'on_date' && (
              <View className="mt-2">
                <Text className="text-[11px] font-bold text-slate-600 mb-1">End Date (YYYY-MM-DD)</Text>
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold"
                />
              </View>
            )}

            {endMode === 'after_n' && (
              <View className="mt-2">
                <Text className="text-[11px] font-bold text-slate-600 mb-1">Total Occurrences</Text>
                <TextInput
                  value={occurrencesTotal}
                  onChangeText={setOccurrencesTotal}
                  placeholder="e.g. 12"
                  keyboardType="numeric"
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold"
                />
              </View>
            )}
          </View>
        </View>

        {/* Live Materialization Preview Card matching Web RecurrencePreview */}
        <View className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 mb-5 space-y-2">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="calendar" size={14} color="#0284C7" />
              <Text className="text-xs font-bold text-sky-900">
                Next 3 Scheduled Dates Preview
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={12} color="#0284C7" className="mr-1" />
              <Text className="text-[10px] font-semibold text-sky-700">Auto-calculated</Text>
            </View>
          </View>

          {isLoadingPreview ? (
            <View className="py-2 flex-row items-center">
              <ActivityIndicator size="small" color="#0284C7" className="mr-2" />
              <Text className="text-xs text-sky-700 font-medium">Calculating schedule dates...</Text>
            </View>
          ) : previewDates.length === 0 ? (
            <Text className="text-xs text-slate-500 italic py-1">
              No upcoming occurrences within selected schedule parameters.
            </Text>
          ) : (
            <View className="flex-row flex-wrap gap-2 pt-1">
              {previewDates.map((d, index) => (
                <View
                  key={d}
                  className="flex-row items-center bg-white border border-sky-200 px-2.5 py-1.5 rounded-xl shadow-2xs"
                >
                  <View className="w-4 h-4 rounded-full bg-sky-100 items-center justify-center mr-1.5">
                    <Text className="text-[9.5px] font-black text-sky-700">{index + 1}</Text>
                  </View>
                  <Text className="text-xs font-bold text-slate-800">
                    {dayjs(d).format('ddd, MMM D, YYYY')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Automation Options (Auto-Post) matching Web */}
        <View className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/60 mb-6 flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-1">
              <Ionicons name="flash" size={13} color="#0284C7" className="mr-1" />
              <Text className="text-sm font-bold text-slate-900">
                Automatic Posting
              </Text>
            </View>
            <Text className="text-xs text-slate-500 leading-relaxed">
              Automatically creates a ledger transaction on each due date in your local timezone without waiting for manual confirmation.
            </Text>
          </View>
          <CustomSwitch value={autoPost} onValueChange={setAutoPost} />
        </View>

        {/* Submit Action Button */}
        <TouchableOpacity
          className="bg-[#159A1D] py-4 rounded-2xl items-center shadow-md shadow-[#159A1D]/30 flex-row justify-center"
          onPress={handleSave}
          disabled={addSub.isPending || updateSub.isPending}
          activeOpacity={0.8}
        >
          {addSub.isPending || updateSub.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" className="mr-1.5" />
              <Text className="text-white font-extrabold text-base tracking-wide">
                {editingId ? 'Save Changes' : 'Create Recurring Rule'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={categoryPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[75%] p-6">
            <View className="flex-row justify-between items-center pb-4 border-b border-slate-100">
              <Text className="text-lg font-black text-slate-900">Select Category</Text>
              <TouchableOpacity
                onPress={() => setCategoryPickerVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {isLoadingCats ? (
              <ActivityIndicator color="#159A1D" className="mt-10" />
            ) : (
              <FlatList
                data={categories || []}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingVertical: 12 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = categoryId === parseInt(item.id.toString());
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setCategoryId(parseInt(item.id.toString()));
                        setCategoryPickerVisible(false);
                      }}
                      activeOpacity={0.7}
                      className={`flex-row items-center p-3.5 mb-2 rounded-2xl border ${
                        isSelected
                          ? 'border-[#159A1D] bg-emerald-50/50'
                          : 'border-slate-100 bg-white'
                      }`}
                    >
                      <View
                        style={{ backgroundColor: `${item.color || '#159A1D'}20` }}
                        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      >
                        <Ionicons
                          name={(item.iconName as any) || 'folder-outline'}
                          size={20}
                          color={item.color || '#159A1D'}
                        />
                      </View>
                      <Text
                        className={`text-sm font-bold flex-1 ${
                          isSelected ? 'text-[#159A1D]' : 'text-slate-800'
                        }`}
                      >
                        {item.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#159A1D" />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
