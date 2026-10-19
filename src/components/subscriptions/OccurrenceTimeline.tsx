import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';
import {
  useGetOccurrences,
  usePayOccurrence,
  useSkipOccurrence,
  useUnskipOccurrence,
  useUndoSubscriptionPayment,
  RecurringOccurrence,
} from '../../api/subscriptions';
import { useCategories } from '../../api/categories';

interface OccurrenceTimelineProps {
  subscriptionId: string | number;
  subscriptionName: string;
  defaultAmount?: string | number;
  defaultCategoryId?: number | null;
}

const TABS = ['all', 'due', 'paid', 'missed', 'skipped'] as const;

// Helper to generate intelligent description matching Web (§pay/page.tsx, §57-102)
const generateIntelligentDescription = (
  pDate: string,
  dDate: string | null | undefined,
  subName: string,
  status?: string | null,
  skippedAt?: string | null
): string => {
  if (!dDate) {
    return `Manual payment for ${subName}`;
  }

  const cleanDueDateStr = dDate.split('T')[0].split(' ')[0];
  const cleanPayDateStr = pDate.split('T')[0].split(' ')[0];
  const dueDate = dayjs(cleanDueDateStr);
  const payDate = dayjs(cleanPayDateStr);

  const formattedDueDate = dueDate.format('MMM D, YYYY');
  const formattedPayDate = payDate.format('MMM D, YYYY');

  const diffDays = payDate.startOf('day').diff(dueDate.startOf('day'), 'day');
  const wasSkipped = status === 'skipped' || Boolean(skippedAt);

  if (wasSkipped) {
    const skippedDate = skippedAt ? dayjs(skippedAt).format('MMM D, YYYY') : dayjs().format('MMM D, YYYY');
    let lateText = '';
    if (diffDays > 0) {
      lateText = ` (${diffDays} day${diffDays > 1 ? 's' : ''} late)`;
    } else if (diffDays === 0) {
      lateText = ` (on scheduled due date)`;
    } else {
      lateText = ` (${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} early)`;
    }
    return `Originally skipped on ${skippedDate} • Paid on ${formattedPayDate}${lateText} for scheduled due date ${formattedDueDate}`;
  } else {
    let lateText = '';
    if (diffDays > 0) {
      lateText = ` (${diffDays} day${diffDays > 1 ? 's' : ''} late)`;
    } else if (diffDays < 0) {
      lateText = ` (${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} early)`;
    }
    return `Payment for recurring occurrence on ${formattedDueDate}${lateText}`;
  }
};

export default function OccurrenceTimeline({
  subscriptionId,
  subscriptionName,
  defaultAmount,
  defaultCategoryId,
}: OccurrenceTimelineProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pay Modal State
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<RecurringOccurrence | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('');
  const [payCategoryId, setPayCategoryId] = useState<number | null>(
    defaultCategoryId ? Number(defaultCategoryId) : null
  );
  const [payNotes, setPayNotes] = useState<string>('');
  const [isManualNotes, setIsManualNotes] = useState(false);

  const { data: categories = [] } = useCategories();

  const { data, isLoading, refetch } = useGetOccurrences(subscriptionId, {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sort: sortOrder,
    limit: 50,
  });

  const payOccurrence = usePayOccurrence();
  const skipOccurrence = useSkipOccurrence();
  const unskipOccurrence = useUnskipOccurrence();
  const undoPayment = useUndoSubscriptionPayment();

  const occurrences = useMemo(() => data?.data || [], [data]);

  // Identify latest paid occurrence for undo capability matching Web
  const latestPaidOccurrence = useMemo(() => {
    return occurrences
      .filter((o) => o.status === 'paid')
      .sort(
        (a, b) =>
          dayjs(b.due_date).valueOf() - dayjs(a.due_date).valueOf()
      )[0];
  }, [occurrences]);

  const handleOpenPayModal = (occ: RecurringOccurrence) => {
    setSelectedOccurrence(occ);
    setPayAmount(occ.amount ? occ.amount.toString() : defaultAmount ? defaultAmount.toString() : '');
    const todayStr = dayjs().format('YYYY-MM-DD');
    setPayDate(todayStr);
    setPayCategoryId(defaultCategoryId ? Number(defaultCategoryId) : null);

    // Pre-populate intelligent note matching Web
    const intelligentNote = generateIntelligentDescription(
      todayStr,
      occ.due_date,
      subscriptionName,
      occ.status,
      occ.skipped_at
    );
    setPayNotes(intelligentNote);
    setIsManualNotes(false);
    setPayModalVisible(true);
  };

  const handlePayDateChange = (newDate: string) => {
    setPayDate(newDate);
    if (!isManualNotes && selectedOccurrence) {
      const updatedNote = generateIntelligentDescription(
        newDate,
        selectedOccurrence.due_date,
        subscriptionName,
        selectedOccurrence.status,
        selectedOccurrence.skipped_at
      );
      setPayNotes(updatedNote);
    }
  };

  const handleConfirmPay = async () => {
    if (!selectedOccurrence) return;
    const numericAmount = parseFloat(payAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    try {
      await payOccurrence.mutateAsync({
        subscriptionId,
        occurrenceId: selectedOccurrence.id,
        amount: numericAmount,
        date: payDate || dayjs().format('YYYY-MM-DD'),
        category_id: payCategoryId,
        notes: payNotes.trim() || undefined,
      });

      Toast.show({
        type: 'success',
        text1: 'Payment Recorded',
        text2: `Recorded $${numericAmount.toFixed(2)} for ${subscriptionName}.`,
      });

      setPayModalVisible(false);
      setSelectedOccurrence(null);
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to record payment.';
      Alert.alert('Payment Failed', msg);
    }
  };

  const handleConfirmSkip = (occ: RecurringOccurrence) => {
    Alert.alert(
      'Skip Occurrence',
      `Are you sure you want to skip the occurrence for ${dayjs(occ.due_date).format('MMM D, YYYY')} ($${parseFloat(occ.amount?.toString() || '0').toFixed(2)})? This cycle will be marked as skipped without creating a transaction.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Skip',
          style: 'destructive',
          onPress: async () => {
            try {
              await skipOccurrence.mutateAsync({
                subscriptionId,
                occurrenceId: occ.id,
              });
              Toast.show({
                type: 'success',
                text1: 'Occurrence Skipped',
                text2: `Skipped payment for ${dayjs(occ.due_date).format('MMM D, YYYY')}.`,
              });
              refetch();
            } catch (err: any) {
              const msg = err?.response?.data?.error || err?.message || 'Failed to skip occurrence.';
              Alert.alert('Action Failed', msg);
            }
          },
        },
      ]
    );
  };

  const handleConfirmUnskip = async (occ: RecurringOccurrence) => {
    try {
      await unskipOccurrence.mutateAsync({
        subscriptionId,
        occurrenceId: occ.id,
      });
      Toast.show({
        type: 'success',
        text1: 'Occurrence Restored',
        text2: `Unskipped occurrence for ${dayjs(occ.due_date).format('MMM D, YYYY')}.`,
      });
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to restore occurrence.';
      Alert.alert('Action Failed', msg);
    }
  };

  const handleConfirmUndo = () => {
    Alert.alert(
      'Undo Last Payment',
      'Are you sure you want to undo the latest payment? This will revert the occurrence back to due and remove the linked transaction record.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Undo Payment',
          style: 'destructive',
          onPress: async () => {
            try {
              await undoPayment.mutateAsync(subscriptionId);
              Toast.show({
                type: 'success',
                text1: 'Payment Undone',
                text2: 'Transaction removed and occurrence restored to due.',
              });
              refetch();
            } catch (err: any) {
              const msg = err?.response?.data?.error || err?.message || 'Failed to undo payment.';
              Alert.alert('Action Failed', msg);
            }
          },
        },
      ]
    );
  };

  const getStatusPill = (status: RecurringOccurrence['status']) => {
    switch (status) {
      case 'paid':
        return (
          <View className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Text className="text-[10px] font-bold text-[#159A1D] uppercase">Paid</Text>
          </View>
        );
      case 'missed':
        return (
          <View className="bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <Text className="text-[10px] font-bold text-rose-600 uppercase">Missed</Text>
          </View>
        );
      case 'skipped':
        return (
          <View className="bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            <Text className="text-[10px] font-bold text-slate-500 uppercase">Skipped</Text>
          </View>
        );
      case 'due':
      default:
        return (
          <View className="bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Text className="text-[10px] font-bold text-amber-700 uppercase">Due</Text>
          </View>
        );
    }
  };

  return (
    <View className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs mb-6">
      {/* Header and Controls */}
      <View className="flex-row items-center justify-between pb-3.5 border-b border-slate-100">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <Ionicons name="calendar" size={17} color="#159A1D" />
            <Text className="text-base font-bold text-slate-900">
              Recurring Occurrences Timeline
            </Text>
          </View>
          <Text className="text-xs text-slate-400">
            Materialized due dates, payment records, and schedule status.
          </Text>
        </View>

        {/* Sort Toggle matching Web */}
        <TouchableOpacity
          onPress={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          activeOpacity={0.7}
          className="flex-row items-center bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200"
        >
          <Ionicons name="swap-vertical" size={13} color="#475569" className="mr-1" />
          <Text className="text-[11px] font-bold text-slate-700">
            {sortOrder === 'asc' ? 'Nearest' : 'Furthest'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs matching Web (all, due, paid, missed, skipped) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row py-3 border-b border-slate-100"
        contentContainerStyle={{ gap: 6 }}
      >
        {TABS.map((tab) => {
          const isActive = statusFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setStatusFilter(tab)}
              activeOpacity={0.75}
              className={`px-3 py-1.5 rounded-xl ${
                isActive
                  ? 'bg-slate-900 shadow-xs'
                  : 'bg-slate-100'
              }`}
            >
              <Text
                className={`text-xs capitalize ${
                  isActive ? 'text-white font-extrabold' : 'text-slate-600 font-semibold'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Occurrences List */}
      <View className="pt-3">
        {isLoading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#159A1D" />
            <Text className="text-xs text-slate-400 font-medium mt-2">Loading timeline...</Text>
          </View>
        ) : occurrences.length === 0 ? (
          <View className="py-8 items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-5">
            <Ionicons name="calendar-outline" size={26} color="#CBD5E1" className="mb-2" />
            <Text className="text-xs font-semibold text-slate-500 mb-0.5">
              No occurrences found
            </Text>
            <Text className="text-[11px] font-medium text-slate-400 text-center">
              No records match the &quot;{statusFilter}&quot; filter.
            </Text>
          </View>
        ) : (
          occurrences.map((occ) => {
            const isLatestPaid = occ.status === 'paid' && latestPaidOccurrence?.id === occ.id;
            const amountNum = parseFloat(occ.amount?.toString() || '0');
            const hasActions =
              occ.status === 'due' ||
              occ.status === 'missed' ||
              occ.status === 'skipped' ||
              (occ.status === 'paid' && isLatestPaid);

            return (
              <View
                key={occ.id}
                className="p-3.5 mb-2.5 rounded-2xl border border-slate-100 bg-slate-50/60"
              >
                {/* Top Row: Date & Status (Left) + Amount (Right) */}
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-xs font-extrabold text-slate-900">
                      {dayjs(occ.due_date).format('ddd, MMM D, YYYY')}
                    </Text>
                    {getStatusPill(occ.status)}
                  </View>

                  <Text className="text-sm font-extrabold font-mono text-slate-900">
                    ${amountNum.toFixed(2)}
                  </Text>
                </View>

                {/* Sub details: Paid date, Tx link, Skip notes */}
                <View className="flex-row items-center flex-wrap gap-2 mt-0.5">
                  {Boolean(occ.paid_at) && (
                    <Text className="text-[11px] font-medium text-slate-400">
                      Recorded on {dayjs(occ.paid_at).format('MMM D, YYYY')}
                    </Text>
                  )}

                  {Boolean(occ.transaction_id) && (
                    <TouchableOpacity
                      onPress={() => router.push(`/transaction/${occ.transaction_id}`)}
                      activeOpacity={0.7}
                      className="flex-row items-center bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                    >
                      <Text className="text-[10.5px] font-extrabold text-[#159A1D] mr-0.5">
                        Tx #{occ.transaction_id}
                      </Text>
                      <Ionicons name="open-outline" size={11} color="#159A1D" />
                    </TouchableOpacity>
                  )}

                  {occ.status === 'paid' && Boolean(occ.skipped_at) && (
                    <View className="bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      <Text className="text-[9.5px] font-bold text-amber-700">Previously Skipped</Text>
                    </View>
                  )}

                  {occ.status === 'skipped' && Boolean(occ.skipped_at) && (
                    <Text className="text-[11px] font-medium text-slate-400">
                      Skipped on {dayjs(occ.skipped_at).format('MMM D, YYYY')}
                    </Text>
                  )}
                </View>

                {/* Notes & Intelligent Description matching Web (§OccurrenceTimeline.tsx lines 284-288) */}
                {Boolean(occ.transaction_description) && (
                  <View className="mt-1.5 pt-1.5 border-t border-slate-100 flex-row items-start">
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={12}
                      color="#94A3B8"
                      className="mr-1.5 mt-0.5"
                    />
                    <Text className="flex-1 text-[11px] font-medium text-slate-600 leading-tight">
                      {occ.transaction_description}
                    </Text>
                  </View>
                )}

                {/* Bottom Action Buttons (Rendered only when occurrence has actionable buttons) */}
                {hasActions && (
                  <View className="flex-row items-center justify-end gap-2 pt-2.5 mt-2 border-t border-slate-200/60">
                    {/* Due or Missed: Skip & Pay */}
                    {(occ.status === 'due' || occ.status === 'missed') && (
                      <>
                        <TouchableOpacity
                          onPress={() => handleConfirmSkip(occ)}
                          activeOpacity={0.7}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                        >
                          <Text className="text-xs font-bold text-slate-700">Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleOpenPayModal(occ)}
                          activeOpacity={0.75}
                          className="px-3.5 py-1.5 rounded-xl bg-[#159A1D] flex-row items-center shadow-xs"
                        >
                          <Ionicons name="card-outline" size={13} color="#FFFFFF" className="mr-1" />
                          <Text className="text-xs font-bold text-white">Pay</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {/* Skipped: Unskip & Pay */}
                    {occ.status === 'skipped' && (
                      <>
                        <TouchableOpacity
                          onPress={() => handleConfirmUnskip(occ)}
                          activeOpacity={0.7}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white"
                        >
                          <Text className="text-xs font-bold text-slate-700">Unskip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleOpenPayModal(occ)}
                          activeOpacity={0.75}
                          className="px-3.5 py-1.5 rounded-xl bg-[#159A1D] flex-row items-center shadow-xs"
                        >
                          <Ionicons name="card-outline" size={13} color="#FFFFFF" className="mr-1" />
                          <Text className="text-xs font-bold text-white">Pay</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {/* Paid: Undo if latest */}
                    {occ.status === 'paid' && isLatestPaid && (
                      <TouchableOpacity
                        onPress={handleConfirmUndo}
                        activeOpacity={0.7}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 flex-row items-center"
                      >
                        <Ionicons name="refresh" size={12} color="#E11D48" className="mr-1" />
                        <Text className="text-xs font-bold text-rose-600">Undo Payment</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Record Payment Modal matching Web Pay Modal */}
      <Modal
        visible={payModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPayModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 bg-black/50 justify-end"
        >
          <View
            className="bg-white rounded-t-3xl p-6 shadow-xl max-h-[88%]"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <View className="flex-1 mr-3">
                <Text className="text-lg font-black text-slate-900">Record Payment</Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  {subscriptionName} · Due{' '}
                  {selectedOccurrence
                    ? dayjs(selectedOccurrence.due_date).format('MMM D, YYYY')
                    : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPayModalVisible(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="pt-4"
              keyboardShouldPersistTaps="handled"
            >
              {/* Payment Amount */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-700 mb-1.5">Payment Amount ($)</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5">
                  <Text className="text-base font-extrabold text-slate-500 mr-1">$</Text>
                  <TextInput
                    value={payAmount}
                    onChangeText={setPayAmount}
                    keyboardType="numeric"
                    placeholder="0.00"
                    className="flex-1 text-base font-bold text-slate-900 p-0"
                  />
                </View>
              </View>

              {/* Payment Date */}
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-xs font-bold text-slate-700">Payment Date</Text>
                  <Text className="text-[10px] text-slate-400 font-medium">YYYY-MM-DD</Text>
                </View>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5">
                  <Ionicons name="calendar-outline" size={16} color="#64748B" className="mr-2" />
                  <TextInput
                    value={payDate}
                    onChangeText={handlePayDateChange}
                    placeholder="YYYY-MM-DD"
                    className="flex-1 text-sm font-semibold text-slate-900 p-0"
                  />
                </View>
              </View>

              {/* Category Selector */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-slate-700 mb-1.5">Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                  className="flex-row"
                >
                  {categories.map((cat) => {
                    const catIdNum = Number(cat.id);
                    const isSelected = payCategoryId === catIdNum;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setPayCategoryId(catIdNum)}
                        activeOpacity={0.7}
                        className={`px-3 py-2 rounded-xl flex-row items-center border ${
                          isSelected
                            ? 'bg-emerald-50 border-[#159A1D]'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <View
                          className="w-2.5 h-2.5 rounded-full mr-1.5"
                          style={{ backgroundColor: cat.color || '#159A1D' }}
                        />
                        <Text
                          className={`text-xs font-bold ${
                            isSelected ? 'text-[#159A1D]' : 'text-slate-700'
                          }`}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Notes / Description Field with Intelligent Pre-fill matching Web */}
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-xs font-bold text-slate-700">Notes / Memo</Text>
                  <Text className="text-[10px] text-slate-400 font-medium">Maintained with transaction</Text>
                </View>
                <TextInput
                  value={payNotes}
                  onChangeText={(text) => {
                    setPayNotes(text);
                    setIsManualNotes(true);
                  }}
                  multiline={true}
                  numberOfLines={2}
                  placeholder="Payment description or notes"
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 leading-normal"
                  style={{ minHeight: 52 }}
                />
              </View>
            </ScrollView>

            {/* Pinned Action Buttons Footer (Never overlapped by keyboard or system nav bar) */}
            <View className="flex-row items-center gap-3 pt-3 border-t border-slate-100">
              <TouchableOpacity
                onPress={() => setPayModalVisible(false)}
                activeOpacity={0.7}
                className="flex-1 py-3 rounded-2xl bg-slate-100 items-center justify-center"
              >
                <Text className="text-xs font-bold text-slate-600">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmPay}
                disabled={payOccurrence.isPending}
                activeOpacity={0.8}
                className="flex-1 py-3 rounded-2xl bg-[#159A1D] items-center justify-center flex-row shadow-sm shadow-[#159A1D]/30"
              >
                {payOccurrence.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={15} color="#FFFFFF" className="mr-1" />
                    <Text className="text-xs font-bold text-white">Confirm & Pay</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
