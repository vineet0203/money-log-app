import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import Toast from 'react-native-toast-message';
import CustomSwitch from '../../components/common/CustomSwitch';
import TransactionCard from '../../components/cards/TransactionCard';
import OccurrenceTimeline from '../../components/subscriptions/OccurrenceTimeline';
import {
  getInitials,
  getSubscriptionColor,
} from '../../components/cards/SubscriptionCard';
import {
  useSubscriptionDetails,
  useUpdateSubscription,
  useDeleteSubscription,
} from '../../api/subscriptions';
import { useCategories } from '../../api/categories';
import { useUser } from '../../api/users';

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isReminderOn, setIsReminderOn] = useState(false);
  const [reminderDays, setReminderDays] = useState(7);
  const [isSmsEnabled, setIsSmsEnabled] = useState(false);
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);

  const { data: user } = useUser();
  const { data, isLoading, isError, refetch } = useSubscriptionDetails(id as string);
  const { data: categories } = useCategories();
  const updateSub = useUpdateSubscription();
  const deleteSub = useDeleteSubscription();

  useEffect(() => {
    if (data?.subscription) {
      setIsReminderOn(Boolean(data.subscription.is_reminder_on));
      setReminderDays(data.subscription.reminder_days || 7);
      setIsSmsEnabled(Boolean(data.subscription.is_sms_enabled));
      setIsEmailEnabled(
        data.subscription.is_email_enabled !== undefined
          ? Boolean(data.subscription.is_email_enabled)
          : false
      );
    }
  }, [data?.subscription]);

  const handleToggleReminder = async (val: boolean) => {
    setIsReminderOn(val);
    try {
      await updateSub.mutateAsync({ id: Number(id), is_reminder_on: val });
      Toast.show({
        type: 'success',
        text1: val ? 'Reminders Enabled' : 'Reminders Disabled',
        text2: val
          ? `You will be notified ${reminderDays} days before renewal.`
          : 'Reminders turned off.',
      });
    } catch {
      setIsReminderOn(!val);
    }
  };

  const handleUpdateDays = async (newDays: number) => {
    setReminderDays(newDays);
    try {
      await updateSub.mutateAsync({ id: Number(id), reminder_days: newDays });
    } catch {
      refetch();
    }
  };

  const handleToggleSms = async (val: boolean) => {
    setIsSmsEnabled(val);
    try {
      await updateSub.mutateAsync({ id: Number(id), is_sms_enabled: val });
    } catch {
      setIsSmsEnabled(!val);
    }
  };

  const handleToggleEmail = async (val: boolean) => {
    if (val && (!user || !user.email)) {
      Alert.alert(
        'Email Required',
        'You must add an email address to your profile to enable email notifications.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Email', onPress: () => router.push('/edit-profile') },
        ]
      );
      return;
    }

    setIsEmailEnabled(val);
    try {
      await updateSub.mutateAsync({ id: Number(id), is_email_enabled: val });
    } catch {
      setIsEmailEnabled(!val);
    }
  };

  const handleOpenEdit = () => {
    if (!subscription) return;
    router.push({
      pathname: '/add-subscription',
      params: {
        id: subscription.id,
        name: subscription.name,
        amount: subscription.amount.toString(),
        type: subscription.type || 'expense',
        frequency: (subscription as any).frequency || subscription.billing_cycle || 'monthly',
        intervalCount: (subscription as any).interval_count ? (subscription as any).interval_count.toString() : '1',
        byMonthDay: (subscription as any).by_month_day ? (subscription as any).by_month_day.toString() : '',
        byWeekday: (subscription as any).by_weekday !== undefined && (subscription as any).by_weekday !== null ? (subscription as any).by_weekday.toString() : '',
        endMode: (subscription as any).end_mode || 'never',
        endDate: (subscription as any).end_date ? (subscription as any).end_date.split('T')[0] : '',
        occurrencesTotal: (subscription as any).occurrences_total ? (subscription as any).occurrences_total.toString() : '',
        autoPost: subscription.auto_post ? '1' : '0',
        billingCycle: subscription.billing_cycle,
        startDate: subscription.start_date ? subscription.start_date.split('T')[0] : '',
        categoryId: subscription.category_id || '',
      },
    });
  };

  const handleToggleCancel = () => {
    if (!subscription) return;
    const isCancelled = subscription.status === 'cancelled';

    Alert.alert(
      isCancelled ? 'Reactivate Subscription' : 'Cancel Subscription',
      isCancelled
        ? `Are you sure you want to reactivate "${subscription.name}"?`
        : `Are you sure you want to cancel this subscription? This action will mark it as inactive.`,
      [
        { text: 'Back', style: 'cancel' },
        {
          text: isCancelled ? 'Reactivate' : 'Cancel Subscription',
          style: isCancelled ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await updateSub.mutateAsync({
                id: Number(id),
                status: isCancelled ? 'active' : 'cancelled',
              });
              Toast.show({
                type: 'success',
                text1: isCancelled ? 'Reactivated' : 'Cancelled',
                text2: isCancelled
                  ? 'Subscription schedule resumed.'
                  : 'Subscription marked as inactive.',
              });
              refetch();
            } catch (err: any) {
              const msg =
                err?.response?.data?.error || err?.message || 'Failed to update status';
              Alert.alert('Action Failed', msg);
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/subscriptions');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#159A1D" />
        <Text className="text-slate-400 font-semibold text-xs mt-3">Loading details...</Text>
      </View>
    );
  }

  if (isError || !data?.subscription) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-6">
        <View className="w-16 h-16 rounded-3xl bg-red-50 items-center justify-center mb-3">
          <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
        </View>
        <Text className="text-base font-bold text-slate-800 mb-1">Subscription not found</Text>
        <Text className="text-xs text-slate-400 text-center mb-4">
          This subscription may have been removed or does not exist.
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          className="bg-slate-900 px-5 py-2.5 rounded-full"
        >
          <Text className="text-white text-xs font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subscription = data.subscription;
  const transactions = data.transactions || [];

  const startedDate = subscription.start_date
    ? dayjs(subscription.start_date).format('MMM D, YYYY')
    : '—';
  const nextDueDate = subscription.next_billing_date
    ? dayjs(subscription.next_billing_date)
    : null;
  const lastPaidDate = subscription.last_paid_date
    ? dayjs(subscription.last_paid_date).format('MMM D, YYYY')
    : null;

  const category = categories?.find(
    (c) => parseInt(c.id.toString()) === subscription.category_id
  );
  const categoryName = category ? category.name : subscription.category_name || 'Uncategorized';
  const color = getSubscriptionColor(subscription.name, category?.color || subscription.category_color);
  const initials = getInitials(subscription.name);

  const isCancelled = subscription.status === 'cancelled';
  const isIncome = subscription.type === 'income';

  // Calculate due countdown matching Web
  const getDueCountdown = () => {
    if (!nextDueDate || !nextDueDate.isValid()) return null;
    const today = dayjs().startOf('day');
    const diff = nextDueDate.startOf('day').diff(today, 'day');

    if (diff < 0) {
      return {
        label: `${Math.abs(diff)}d overdue`,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-100',
      };
    }
    if (diff === 0) {
      return {
        label: 'Due today',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
      };
    }
    if (diff === 1) {
      return {
        label: 'Due tomorrow',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
      };
    }
    return {
      label: `In ${diff} days`,
      color: 'text-[#159A1D]',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    };
  };

  const dueCountdown = getDueCountdown();

  // Overview row helper matching Web OverviewRow
  const OverviewRow = ({
    icon,
    label,
    value,
    badge,
    iconBg = 'bg-slate-100',
    iconColor = '#64748B',
    isLast = false,
  }: {
    icon: any;
    label: string;
    value: string;
    badge?: React.ReactNode;
    iconBg?: string;
    iconColor?: string;
    isLast?: boolean;
  }) => (
    <View
      className={`flex-row justify-between items-center py-3.5 ${
        isLast ? '' : 'border-b border-slate-100'
      }`}
    >
      <View className="flex-row items-center flex-1 mr-3">
        <View className={`w-8 h-8 rounded-xl ${iconBg} items-center justify-center mr-3`}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text className="text-xs font-medium text-slate-500">{label}</Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Text className="text-xs font-bold text-slate-800 text-right">{value}</Text>
        {badge}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50/70">
      {/* Top Header Bar matching Web Title: #{id} {name} */}
      <View
        className="flex-row justify-between items-center px-5 pb-3 bg-white border-b border-slate-100"
        style={{ paddingTop: insets.top + (Platform.OS === 'android' ? 12 : 8) }}
      >
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 rounded-2xl bg-slate-100 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Text className="text-base font-extrabold text-slate-900" numberOfLines={1}>
          #{subscription.id} {subscription.name}
        </Text>

        <View className="flex-row items-center gap-2">
          {/* Edit Action Button */}
          <TouchableOpacity
            onPress={handleOpenEdit}
            className="w-10 h-10 rounded-2xl bg-slate-100 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="pencil-outline" size={18} color="#0F172A" />
          </TouchableOpacity>

          {/* Cancel/Reactivate Button */}
          <TouchableOpacity
            onPress={handleToggleCancel}
            className={`w-10 h-10 rounded-2xl items-center justify-center ${
              isCancelled ? 'bg-emerald-50' : 'bg-red-50'
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isCancelled ? 'refresh-outline' : 'close-circle-outline'}
              size={18}
              color={isCancelled ? '#159A1D' : '#EF4444'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Card matching Web Top Header Card (§53-73) */}
        <View className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs mb-4">
          <View className="flex-row items-center">
            {/* Subscription Logo matching Web SubscriptionLogo */}
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3.5 shrink-0"
              style={{ backgroundColor: color }}
            >
              <Text className="text-sm font-black text-white uppercase tracking-wider">
                {initials}
              </Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center flex-wrap gap-1.5 mb-1">
                <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>
                  {subscription.name}
                </Text>

                {Boolean(subscription.auto_post) && (
                  <View className="bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 flex-row items-center">
                    <Ionicons name="flash" size={10} color="#0284C7" className="mr-0.5" />
                    <Text className="text-[10px] font-bold text-sky-700">Auto-post</Text>
                  </View>
                )}

                <View
                  className={`px-2 py-0.5 rounded-full border ${
                    isCancelled
                      ? 'bg-slate-100 border-slate-200'
                      : 'bg-emerald-50 border-emerald-100'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold capitalize ${
                      isCancelled ? 'text-slate-500' : 'text-[#159A1D]'
                    }`}
                  >
                    {isCancelled ? 'Inactive' : 'Active'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-baseline gap-1.5">
                <Text className="text-xl font-extrabold font-mono text-[#159A1D]">
                  ${parseFloat(subscription.amount?.toString() || '0').toFixed(2)}
                </Text>
                <Text className="text-xs font-medium text-slate-400 capitalize">
                  · {subscription.billing_cycle || 'monthly'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main Details Card (Overview) matching Web Overview Card (§78-127) */}
        <View className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs mb-4">
          <Text className="text-base font-bold text-slate-800 mb-1">Overview</Text>

          <View className="flex-col">
            <OverviewRow
              icon="calendar-outline"
              label="Start Date"
              value={startedDate}
              iconBg="bg-blue-50"
              iconColor="#3B82F6"
            />

            <OverviewRow
              icon="time-outline"
              label={isIncome ? 'Due / Expected Date' : 'Due Date'}
              value={nextDueDate ? nextDueDate.format('MMM D, YYYY') : '—'}
              badge={
                dueCountdown && !isCancelled ? (
                  <View className={`px-1.5 py-0.2 rounded border ${dueCountdown.bg} ${dueCountdown.border}`}>
                    <Text className={`text-[9.5px] font-bold ${dueCountdown.color}`}>
                      {dueCountdown.label}
                    </Text>
                  </View>
                ) : null
              }
              iconBg="bg-orange-50"
              iconColor="#F97316"
            />

            <OverviewRow
              icon="checkmark-circle-outline"
              label={isIncome ? 'Last Received Date' : 'Last Paid Date'}
              value={lastPaidDate || 'No payments recorded yet'}
              iconBg="bg-emerald-50"
              iconColor="#159A1D"
            />

            <OverviewRow
              icon="repeat-outline"
              label="Frequency"
              value={subscription.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'}
              iconBg="bg-emerald-50"
              iconColor="#10B981"
            />

            <OverviewRow
              icon="flash-outline"
              label="Posting Mode"
              value={
                subscription.auto_post
                  ? 'Automatic on due date'
                  : 'Manual confirmation'
              }
              iconBg="bg-amber-50"
              iconColor="#F59E0B"
            />

            <OverviewRow
              icon="folder-outline"
              label="Category"
              value={categoryName}
              iconBg="bg-indigo-50"
              iconColor="#6366F1"
              isLast={true}
            />
          </View>
        </View>

        {/* Reminders Settings matching Web RemindersSettings Component (§131-141) */}
        <View className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs mb-4">
          <View className="flex-row justify-between items-center mb-1">
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-8 h-8 rounded-xl bg-amber-50 items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={16} color="#D97706" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-800">Due Reminders</Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  Configure reminders before recurring due dates.
                </Text>
              </View>
            </View>
            <CustomSwitch value={isReminderOn} onValueChange={handleToggleReminder} />
          </View>

          {isReminderOn && (
            <View className="mt-3.5 pt-3.5 border-t border-slate-100 space-y-3">
              {/* Days Before Stepper */}
              <View className="flex-row justify-between items-center py-1">
                <Text className="text-xs font-semibold text-slate-600">Notify In Advance</Text>
                <View className="flex-row items-center bg-slate-100 rounded-full px-2 py-1">
                  <TouchableOpacity
                    onPress={() => handleUpdateDays(Math.max(1, reminderDays - 1))}
                    className="w-6 h-6 rounded-full bg-white items-center justify-center shadow-xs"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={14} color="#0F172A" />
                  </TouchableOpacity>
                  <Text className="text-xs font-bold mx-3 text-slate-800">
                    {reminderDays} days before due date
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleUpdateDays(Math.min(30, reminderDays + 1))}
                    className="w-6 h-6 rounded-full bg-white items-center justify-center shadow-xs"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={14} color="#0F172A" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Email Notification Channel */}
              <View className="flex-row justify-between items-center py-1 border-t border-slate-100">
                <View className="flex-row items-center">
                  <Ionicons name="mail-outline" size={15} color="#64748B" className="mr-2" />
                  <Text className="text-xs font-semibold text-slate-700">Email Notification</Text>
                </View>
                <CustomSwitch value={isEmailEnabled} onValueChange={handleToggleEmail} />
              </View>

              {/* SMS Notification Channel */}
              <View className="flex-row justify-between items-center py-1 border-t border-slate-100">
                <View className="flex-row items-center">
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={15}
                    color="#64748B"
                    className="mr-2"
                  />
                  <Text className="text-xs font-semibold text-slate-700">SMS Notification</Text>
                </View>
                <CustomSwitch value={isSmsEnabled} onValueChange={handleToggleSms} />
              </View>
            </View>
          )}
        </View>

        {/* Recurring Occurrences Timeline matching Web (§146-152) */}
        <OccurrenceTimeline
          subscriptionId={subscription.id}
          subscriptionName={subscription.name}
          defaultAmount={subscription.amount}
          defaultCategoryId={subscription.category_id}
        />

        {/* Payment History */}
        <View className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs mb-6">
          <Text className="text-base font-bold text-slate-800 mb-0.5">Payment History</Text>
          <Text className="text-xs text-slate-400 mb-3">
            Materialized payment records and linked transactions.
          </Text>

          {transactions.length === 0 ? (
            <View className="text-center py-8 items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
              <Ionicons name="receipt-outline" size={28} color="#CBD5E1" className="mb-2" />
              <Text className="text-xs font-semibold text-slate-500 mb-0.5">
                No payments recorded yet
              </Text>
              <Text className="text-[11px] font-medium text-slate-400 text-center">
                Payment transactions for this schedule will appear here.
              </Text>
            </View>
          ) : (
            transactions.map((tx: any) => (
              <TransactionCard
                key={tx.id}
                transaction={{
                  id: tx.id.toString(),
                  title: tx.title,
                  subtitle: tx.subtitle || tx.category_name || 'Subscription',
                  amount: parseFloat(tx.amount?.toString() || '0'),
                  type: tx.type || 'expense',
                  date: tx.date ? tx.date.split('T')[0] : '—',
                  categoryName: tx.category_name,
                  categoryColor: tx.category_color,
                  categoryIcon: tx.category_icon || 'repeat',
                }}
                variant="card"
                onPress={(item) => router.push(`/transaction/${item.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
