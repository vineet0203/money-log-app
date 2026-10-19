import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import SearchBar from '../../components/common/SearchBar';
import TransactionCard from '../../components/cards/TransactionCard';
import TransactionListSkeleton from '../../components/cards/TransactionSkeleton';
import {
  useTransactionsInfinite,
  useTransactionStats,
} from '../../api/transactions';
import { useCategories } from '../../api/categories';
import { Transaction as UITransaction } from '../../types';

type PeriodPreset = 'this_month' | 'last_30_days' | 'last_month' | 'all';

const PERIOD_PRESETS: { id: PeriodPreset; label: string }[] = [
  { id: 'this_month', label: 'This Month' },
  { id: 'last_30_days', label: 'Last 30 Days' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'all', label: 'All Time' },
];

const TABS = ['All', 'Income', 'Expense'] as const;
type TabType = (typeof TABS)[number];

interface TransactionSection {
  dateKey: string;
  title: string;
  netTotal: number;
  data: UITransaction[];
}

export default function Transactions() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('this_month');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterReceipt, setFilterReceipt] = useState(false);
  const [filterRecurring, setFilterRecurring] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Derive fromDate and toDate bounds based on selected period
  const { fromDate, toDate, dateLabel } = useMemo(() => {
    const today = dayjs();
    if (periodPreset === 'this_month') {
      const start = today.startOf('month');
      const end = today.endOf('month');
      return {
        fromDate: start.format('YYYY-MM-DD'),
        toDate: end.format('YYYY-MM-DD'),
        dateLabel: today.format('MMMM YYYY'),
      };
    }
    if (periodPreset === 'last_30_days') {
      const start = today.subtract(29, 'day');
      return {
        fromDate: start.format('YYYY-MM-DD'),
        toDate: today.format('YYYY-MM-DD'),
        dateLabel: `${start.format('MMM D')} - ${today.format('MMM D')}`,
      };
    }
    if (periodPreset === 'last_month') {
      const prev = today.subtract(1, 'month');
      const start = prev.startOf('month');
      const end = prev.endOf('month');
      return {
        fromDate: start.format('YYYY-MM-DD'),
        toDate: end.format('YYYY-MM-DD'),
        dateLabel: prev.format('MMMM YYYY'),
      };
    }
    return {
      fromDate: undefined,
      toDate: undefined,
      dateLabel: 'All Recorded Data',
    };
  }, [periodPreset]);

  // Backend type filter
  const typeFilter = activeTab === 'All' ? 'all' : activeTab.toLowerCase();

  // 1. Fetch real stats (KPI cards with deltas vs previous period) - 100% backend driven
  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useTransactionStats({
    type: typeFilter === 'all' ? undefined : typeFilter,
    fromDate,
    toDate,
    search: debouncedSearch || undefined,
    has_receipt: filterReceipt ? 'true' : undefined,
    is_recurring: filterRecurring ? 'true' : undefined,
    compare: 'previous',
  });

  // 2. Fetch paginated infinite transactions - 100% backend driven
  const {
    data: txData,
    isLoading: isTxLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchTx,
    isRefetching,
  } = useTransactionsInfinite({
    type: typeFilter === 'all' ? undefined : typeFilter,
    fromDate,
    toDate,
    search: debouncedSearch || undefined,
    has_receipt: filterReceipt ? 'true' : undefined,
    is_recurring: filterRecurring ? 'true' : undefined,
  });

  // 3. Fetch categories for colors and icons
  const { data: categories, isLoading: isCatLoading, refetch: refetchCats } = useCategories();

  useFocusEffect(
    useCallback(() => {
      refetchStats();
      refetchTx();
      refetchCats();
    }, [refetchStats, refetchTx, refetchCats])
  );

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchStats(), refetchTx(), refetchCats()]);
  }, [refetchStats, refetchTx, refetchCats]);

  // Helpers
  const formatCurrency = (val: number) => {
    return Math.abs(val || 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatSign = (val: number) => {
    const sign = val >= 0 ? '+' : '-';
    return `${sign}${formatCurrency(val)}`;
  };

  // Process transaction list & sections (Data is 100% filtered by Backend API)
  const { sections, rawTotalCount } = useMemo(() => {
    const rawList = txData?.pages.flatMap((page) => page.data) || [];

    // Group transactions by date
    const groups: { [key: string]: UITransaction[] } = {};
    const todayStr = dayjs().format('YYYY-MM-DD');
    const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    rawList.forEach((t) => {
      const dateKey = t.date ? t.date.split('T')[0] : todayStr;
      const category = categories?.find((c) => c.id === t.category_id);

      const isIncome = t.type === 'income';
      const categoryColor = category?.color || undefined;
      const categoryIcon = category?.iconName || (category as any)?.icon_name || undefined;
      const categoryName = category?.name || (isIncome ? 'Income' : 'Expense');

      const uiTx: UITransaction = {
        id: t.id.toString(),
        title: t.title,
        subtitle: categoryName,
        amount: parseFloat(t.amount.toString()),
        type: t.type,
        date: dateKey,
        iconName: categoryIcon || (isIncome ? 'cash-outline' : 'receipt-outline'),
        iconBgColor: categoryColor,
        categoryName: categoryName,
        categoryColor: categoryColor,
        categoryIcon: categoryIcon,
        hasReceipt: Boolean(t.receipt_url),
        isRecurring: Boolean(t.subscription_id),
        description: t.description,
        formattedTime: t.created_at ? dayjs(t.created_at).format('h:mm A') : undefined,
      };

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(uiTx);
    });

    // Sort dates descending
    const sortedDateKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    const resultSections: TransactionSection[] = sortedDateKeys.map((dateKey) => {
      let title = dayjs(dateKey).format('dddd, MMM D');
      if (dateKey === todayStr) {
        title = `Today • ${dayjs(dateKey).format('MMM D')}`;
      } else if (dateKey === yesterdayStr) {
        title = `Yesterday • ${dayjs(dateKey).format('MMM D')}`;
      } else if (dayjs(dateKey).year() !== dayjs().year()) {
        title = dayjs(dateKey).format('MMM D, YYYY');
      }

      const dayTransactions = groups[dateKey];
      const netTotal = dayTransactions.reduce((acc, curr) => {
        return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
      }, 0);

      return {
        dateKey,
        title,
        netTotal,
        data: dayTransactions,
      };
    });

    return {
      sections: resultSections,
      rawTotalCount: rawList.length,
    };
  }, [txData, categories]);

  const isLoading = (isTxLoading || isCatLoading) && !isRefetching;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const hasActiveFilters = filterReceipt || filterRecurring || searchQuery.length > 0;

  const clearFilters = () => {
    setSearchQuery('');
    setFilterReceipt(false);
    setFilterRecurring(false);
  };

  // Stat values from backend stats endpoint
  const netCashFlow = Number(stats?.balance || 0);
  const totalIncome = Number(stats?.income || 0);
  const totalExpense = Number(stats?.expense || 0);
  const highestExpense = Number(stats?.highestExpense || 0);
  const averageAmount = Number(stats?.average || 0);
  const largestTx = stats?.largest;

  return (
    <View className="flex-1 bg-slate-50/70">
      {/* 1. TOP SEARCH & PERIOD SELECTOR */}
      <View className="bg-white border-b border-slate-100 pt-3 pb-2.5 px-5">
        <SearchBar onSearch={setSearchQuery} placeholder="Search title, category, note..." />

        {/* Period Preset Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2.5 -mx-1"
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {PERIOD_PRESETS.map((preset) => {
            const isSelected = periodPreset === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                onPress={() => setPeriodPreset(preset.id)}
                activeOpacity={0.7}
                className={`px-3 py-1.5 rounded-full mr-2 border ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    isSelected ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. SEGMENTED TABS & QUICK FILTERS */}
      <View className="bg-white px-5 pt-2 pb-2.5 border-b border-slate-100">
        <View className="flex-row bg-slate-100 p-1 rounded-2xl">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const count =
              tab === 'All'
                ? stats?.count ?? rawTotalCount
                : tab === 'Income'
                ? stats?.incomeCount ?? 0
                : stats?.expenseCount ?? 0;

            let activeTextColor = 'text-slate-900';
            if (isActive) {
              if (tab === 'Income') activeTextColor = 'text-[#159A1D]';
              if (tab === 'Expense') activeTextColor = 'text-rose-600';
            }

            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
                className={`flex-1 py-2 items-center justify-center rounded-xl flex-row ${
                  isActive ? 'bg-white shadow-xs' : ''
                }`}
              >
                <Text className={`text-xs font-extrabold ${activeTextColor}`}>
                  {tab}
                </Text>
                {count > 0 && (
                  <View
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-100' : 'bg-slate-200/60'
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${activeTextColor}`}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Filter Chips (Receipt & Recurring) */}
        <View className="flex-row items-center justify-between mt-2.5">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setFilterReceipt((prev) => !prev)}
              activeOpacity={0.7}
              className={`flex-row items-center px-2.5 py-1 rounded-lg border ${
                filterReceipt
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-slate-50 border-slate-200/70'
              }`}
            >
              <Ionicons
                name="attach-outline"
                size={13}
                color={filterReceipt ? '#159A1D' : '#64748B'}
              />
              <Text
                className={`text-[11px] font-bold ml-1 ${
                  filterReceipt ? 'text-[#159A1D]' : 'text-slate-600'
                }`}
              >
                Has Receipt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterRecurring((prev) => !prev)}
              activeOpacity={0.7}
              className={`flex-row items-center px-2.5 py-1 rounded-lg border ${
                filterRecurring
                  ? 'bg-purple-50 border-purple-300'
                  : 'bg-slate-50 border-slate-200/70'
              }`}
            >
              <Ionicons
                name="repeat"
                size={12}
                color={filterRecurring ? '#7E22CE' : '#64748B'}
              />
              <Text
                className={`text-[11px] font-bold ml-1 ${
                  filterRecurring ? 'text-purple-700' : 'text-slate-600'
                }`}
              >
                Recurring
              </Text>
            </TouchableOpacity>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity onPress={clearFilters} activeOpacity={0.7}>
              <Text className="text-[11px] font-bold text-rose-500">Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. MAIN CONTENT: STATS HEADER + SECTION LIST */}
      {isLoading ? (
        <TransactionListSkeleton />
      ) : (
        <SectionList
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 110, paddingTop: 14 }}
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="mb-4">
              {/* Context Date Range Label */}
              <View className="flex-row items-center justify-between mb-3 px-1">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Summary • {dateLabel}
                </Text>
                {stats?.delta && stats.delta.balance !== null && (
                  <View className="flex-row items-center">
                    <Ionicons
                      name={stats.delta.balance >= 0 ? 'trending-up' : 'trending-down'}
                      size={12}
                      color={stats.delta.balance >= 0 ? '#159A1D' : '#EF4444'}
                    />
                    <Text
                      className={`text-[10px] font-extrabold ml-1 ${
                        stats.delta.balance >= 0 ? 'text-[#159A1D]' : 'text-rose-600'
                      }`}
                    >
                      {stats.delta.balance >= 0
                        ? `+${stats.delta.balance}%`
                        : `${stats.delta.balance}%`}{' '}
                      vs prev
                    </Text>
                  </View>
                )}
              </View>

              {/* 4 KPI Cards Matching Web */}
              {activeTab === 'All' && (
                <View className="gap-2.5">
                  <View className="flex-row gap-2.5">
                    {/* Net Cash Flow */}
                    <View className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                      <View className="flex-row items-center justify-between mb-1.5">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Net Cash Flow
                        </Text>
                        <Ionicons
                          name={netCashFlow >= 0 ? 'checkmark-circle' : 'alert-circle'}
                          size={13}
                          color={netCashFlow >= 0 ? '#159A1D' : '#EF4444'}
                        />
                      </View>
                      <Text
                        className={`text-lg font-black tracking-tight ${
                          netCashFlow >= 0 ? 'text-[#159A1D]' : 'text-rose-600'
                        }`}
                      >
                        {formatSign(netCashFlow)}
                      </Text>
                      <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Income minus expense
                      </Text>
                    </View>

                    {/* Total Income */}
                    <View className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                      <View className="flex-row items-center justify-between mb-1.5">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Total Income
                        </Text>
                        <Ionicons name="arrow-down-circle" size={13} color="#159A1D" />
                      </View>
                      <Text className="text-lg font-black text-[#159A1D] tracking-tight">
                        {formatSign(totalIncome)}
                      </Text>
                      <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Recorded inflows
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2.5">
                    {/* Total Expenses */}
                    <View className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                      <View className="flex-row items-center justify-between mb-1.5">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Total Expenses
                        </Text>
                        <Ionicons name="arrow-up-circle" size={13} color="#EF4444" />
                      </View>
                      <Text className="text-lg font-black text-rose-600 tracking-tight">
                        {formatSign(-totalExpense)}
                      </Text>
                      <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Recorded outflows
                      </Text>
                    </View>

                    {/* Highest Expense / Peak Transaction */}
                    <View className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                      <View className="flex-row items-center justify-between mb-1.5">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Peak Expense
                        </Text>
                        <Ionicons name="alert-circle-outline" size={13} color="#F59E0B" />
                      </View>
                      <Text className="text-lg font-black text-slate-900 tracking-tight">
                        {highestExpense > 0 ? formatCurrency(highestExpense) : '$0.00'}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="text-[10px] text-slate-400 font-medium mt-0.5"
                      >
                        {largestTx?.title || 'Largest outflow'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {activeTab === 'Income' && (
                <View className="flex-row gap-2.5">
                  <View className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Total Inflows
                    </Text>
                    <Text className="text-lg font-black text-[#159A1D] tracking-tight">
                      {formatSign(totalIncome)}
                    </Text>
                    <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Avg: {formatCurrency(averageAmount)}
                    </Text>
                  </View>

                  <View className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Largest Deposit
                    </Text>
                    <Text className="text-lg font-black text-blue-600 tracking-tight">
                      {largestTx ? formatSign(largestTx.amount) : '$0.00'}
                    </Text>
                    <Text numberOfLines={1} className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {largestTx ? largestTx.title : 'No deposits logged'}
                    </Text>
                  </View>
                </View>
              )}

              {activeTab === 'Expense' && (
                <View className="flex-row gap-2.5">
                  <View className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Total Outflows
                    </Text>
                    <Text className="text-lg font-black text-rose-600 tracking-tight">
                      {formatSign(-totalExpense)}
                    </Text>
                    <Text className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Avg: {formatCurrency(averageAmount)}
                    </Text>
                  </View>

                  <View className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Highest Spend
                    </Text>
                    <Text className="text-lg font-black text-slate-900 tracking-tight">
                      {highestExpense > 0 ? formatCurrency(highestExpense) : '$0.00'}
                    </Text>
                    <Text numberOfLines={1} className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {largestTx?.title || 'Peak transaction'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View className="flex-row justify-between items-center mb-2 mt-3 px-1">
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </Text>
              </View>
              <View className="bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                <Text
                  className={`text-[11px] font-extrabold ${
                    section.netTotal >= 0 ? 'text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  {section.netTotal >= 0
                    ? `+$${section.netTotal.toFixed(2)}`
                    : `-$${Math.abs(section.netTotal).toFixed(2)}`}
                </Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <TransactionCard
              transaction={item}
              variant="card"
              onPress={(tx) => router.push(`/transaction/${tx.id}`)}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="my-3">
                <TransactionListSkeleton />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-6 bg-white rounded-3xl p-8 border border-slate-100 border-dashed">
              <View className="w-16 h-16 rounded-full bg-slate-100 items-center justify-center mb-3">
                <Ionicons name="receipt-outline" size={32} color="#94A3B8" />
              </View>
              <Text className="text-base font-bold text-slate-800 mb-1">
                No transactions found
              </Text>
              <Text className="text-xs font-medium text-slate-400 text-center max-w-[240px] mb-4">
                {searchQuery
                  ? `No entries match "${searchQuery}". Try adjusting your keywords.`
                  : activeTab !== 'All'
                  ? `No ${activeTab.toLowerCase()} entries recorded for ${dateLabel}.`
                  : `No transactions found for ${dateLabel}.`}
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/add')}
                activeOpacity={0.8}
                className="bg-[#159A1D] px-5 py-2.5 rounded-full flex-row items-center shadow-sm shadow-[#159A1D]/20"
              >
                <Ionicons name="add" size={16} color="#FFF" />
                <Text className="text-white font-bold text-xs ml-1">Add Transaction</Text>
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              colors={['#159A1D']}
              tintColor="#159A1D"
            />
          }
        />
      )}

      {/* 4. FLOATING ADD TRANSACTION BUTTON */}
      <TouchableOpacity
        onPress={() => router.push('/add')}
        activeOpacity={0.85}
        className="absolute right-5 bottom-6 w-14 h-14 rounded-full bg-[#159A1D] items-center justify-center shadow-lg shadow-[#159A1D]/40 border-2 border-white"
        style={{ elevation: 6 }}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
