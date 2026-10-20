import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import dayjs from 'dayjs';
import Header from '../components/common/Header';
import { useMonthlyReport } from '../api/reports';
import { useDashboardOverview } from '../api/dashboard';

export default function ReportsScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();

  // Selected date state for browsing months
  const now = useMemo(() => dayjs(), []);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(now);
  const [refreshing, setRefreshing] = useState(false);

  const selectedYear = selectedDate.year();
  const selectedMonth = selectedDate.month() + 1; // 1-indexed

  const isCurrentMonth = useMemo(() => {
    return (
      selectedDate.year() === now.year() && selectedDate.month() === now.month()
    );
  }, [selectedDate, now]);

  // 1. Fetch monthly breakdown report for selected year/month
  const {
    data: monthlyData,
    isLoading: isMonthlyLoading,
    isError: isMonthlyError,
    refetch: refetchMonthly,
  } = useMonthlyReport(selectedYear, selectedMonth);

  // 2. Fetch full dashboard overview (for trends, MoM deltas, projections, commitments)
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    refetch: refetchDashboard,
  } = useDashboardOverview();

  useFocusEffect(
    useCallback(() => {
      refetchMonthly();
      refetchDashboard();
    }, [refetchMonthly, refetchDashboard])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMonthly(), refetchDashboard()]);
    setRefreshing(false);
  }, [refetchMonthly, refetchDashboard]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setSelectedDate((prev) => prev.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    // Only allow navigating forward up to current month (or next month if desired)
    if (!isCurrentMonth) {
      setSelectedDate((prev) => prev.add(1, 'month'));
    }
  };

  const handleResetToCurrentMonth = () => {
    setSelectedDate(now);
  };

  // Helpers
  const formatCurrency = (val: number) => {
    const absVal = Math.abs(val || 0);
    return absVal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatSign = (val: number) => {
    const sign = val >= 0 ? '+' : '-';
    return `${sign}${formatCurrency(val)}`;
  };

  // Computed financial figures
  const totalIncome = monthlyData?.totalIncome ?? 0;
  const totalExpense = monthlyData?.totalExpense ?? 0;
  const netSavings = totalIncome - totalExpense;

  // Monthly savings rate
  const savingsRateValue = useMemo(() => {
    if (isCurrentMonth && dashboard?.savingsRate?.rate !== null && dashboard?.savingsRate?.rate !== undefined) {
      return dashboard.savingsRate.rate;
    }
    if (totalIncome > 0) {
      return Number((((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1));
    }
    return 0;
  }, [isCurrentMonth, dashboard?.savingsRate?.rate, totalIncome, totalExpense]);

  const savingsRateDelta = isCurrentMonth ? dashboard?.savingsRate?.delta : null;

  // Prepare Pie Chart data (Gifted Charts)
  const categoryBreakdown = monthlyData?.categoryBreakdown || [];
  const incomeCategoryBreakdown = monthlyData?.incomeCategoryBreakdown || [];

  const pieData = useMemo(() => {
    if (!categoryBreakdown || categoryBreakdown.length === 0) return [];
    return categoryBreakdown.map((cat) => ({
      value: cat.total_amount,
      color: cat.category_color || '#3B82F6',
      text: `${totalExpense > 0 ? Math.round((cat.total_amount / totalExpense) * 100) : 0}%`,
    }));
  }, [categoryBreakdown, totalExpense]);

  // Prepare Bar Chart data for 6-Month Income vs Expenses
  const barData = useMemo(() => {
    const rawChart = dashboard?.charts?.incomeVsExpenses || [];
    if (rawChart.length === 0) return [];

    const result: any[] = [];
    rawChart.forEach((item, index) => {
      const isLastGroup = index === rawChart.length - 1;
      // 1. Income Bar (Blue)
      result.push({
        value: item.income,
        label: item.month,
        spacing: 4,
        labelWidth: 32,
        labelTextStyle: { color: '#64748B', fontSize: 10, fontWeight: '600' },
        frontColor: '#3B82F6',
        barBorderTopLeftRadius: 4,
        barBorderTopRightRadius: 4,
      });
      // 2. Expenses Bar (Rose / Red)
      result.push({
        value: item.expenses,
        spacing: isLastGroup ? 8 : 18,
        frontColor: '#EF4444',
        barBorderTopLeftRadius: 4,
        barBorderTopRightRadius: 4,
      });
    });

    return result;
  }, [dashboard?.charts?.incomeVsExpenses]);

  const maxBarValue = useMemo(() => {
    if (!barData || barData.length === 0) return 1000;
    const maxVal = Math.max(...barData.map((b) => b.value || 0));
    return maxVal > 0 ? Math.ceil(maxVal * 1.15) : 1000;
  }, [barData]);

  const isLoading = isMonthlyLoading && !refreshing;

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#159A1D" />
        <Text className="text-slate-400 font-medium text-xs mt-3">Loading reports...</Text>
      </View>
    );
  }

  if (isMonthlyError && !monthlyData) {
    return (
      <View className="flex-1 bg-slate-50">
        <Header title="Reports & Analytics" showBack={true} />
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-slate-800 font-bold text-base mt-3">Failed to load reports</Text>
          <Text className="text-slate-400 text-xs text-center mt-1 mb-5">
            We encountered an issue fetching your financial statements.
          </Text>
          <TouchableOpacity
            onPress={() => refetchMonthly()}
            className="bg-[#159A1D] px-5 py-2.5 rounded-xl"
          >
            <Text className="text-white font-bold text-sm">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Reports & Analytics" showBack={true} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#159A1D"
            colors={['#159A1D']}
          />
        }
      >
        {/* 1. MONTH SELECTOR HEADER */}
        <View className="bg-white border-b border-slate-100 px-5 py-3.5 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handlePrevMonth}
            activeOpacity={0.7}
            className="w-9 h-9 rounded-xl bg-slate-50 items-center justify-center border border-slate-100"
          >
            <Ionicons name="chevron-back" size={18} color="#475569" />
          </TouchableOpacity>

          <View className="items-center">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-base font-extrabold text-slate-900">
                {selectedDate.format('MMMM YYYY')}
              </Text>
              {isCurrentMonth ? (
                <View className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Text className="text-[10px] font-bold text-[#159A1D]">Current</Text>
                </View>
              ) : null}
            </View>
            {!isCurrentMonth && (
              <TouchableOpacity onPress={handleResetToCurrentMonth} activeOpacity={0.7} className="mt-0.5">
                <Text className="text-[11px] font-bold text-[#159A1D]">
                  Tap to return to This Month
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={handleNextMonth}
            disabled={isCurrentMonth}
            activeOpacity={0.7}
            className={`w-9 h-9 rounded-xl items-center justify-center border ${
              isCurrentMonth
                ? 'bg-slate-50/50 border-slate-100 opacity-40'
                : 'bg-slate-50 border-slate-100'
            }`}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={isCurrentMonth ? '#CBD5E1' : '#475569'}
            />
          </TouchableOpacity>
        </View>

        {/* 2. HERO SAVINGS RATE CARD */}
        <View className="px-5 pt-5">
          <View className="bg-[#159A1D] rounded-3xl p-5 shadow-sm shadow-emerald-900/10">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Text className="text-xs font-bold text-white/80 uppercase tracking-wider">
                    Monthly Savings Rate
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-2 mt-1">
                  <Text className="text-3xl font-black text-white tracking-tight">
                    {savingsRateValue}%
                  </Text>
                  {savingsRateDelta !== null && savingsRateDelta !== undefined && (
                    <View
                      className={`flex-row items-center px-2 py-0.5 rounded-full ${
                        savingsRateDelta >= 0 ? 'bg-white/20' : 'bg-black/20'
                      }`}
                    >
                      <Ionicons
                        name={savingsRateDelta >= 0 ? 'trending-up' : 'trending-down'}
                        size={12}
                        color="#FFFFFF"
                      />
                      <Text className="text-white text-[11px] font-bold ml-1">
                        {savingsRateDelta >= 0 ? `+${savingsRateDelta}%` : `${savingsRateDelta}%`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View className="w-11 h-11 rounded-2xl bg-white/15 items-center justify-center">
                <Ionicons name="wallet-outline" size={22} color="#FFFFFF" />
              </View>
            </View>

            {/* Savings Progress Ring / Bar */}
            <View className="mt-4">
              <View className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <View
                  className="h-full bg-white rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, savingsRateValue))}%`,
                  }}
                />
              </View>
            </View>

            {/* Bottom Row Metrics */}
            <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-white/20">
              <View className="flex-1 pr-3 border-r border-white/20">
                <Text className="text-[10px] text-white/80 font-semibold uppercase tracking-wider">
                  Net Saved
                </Text>
                <Text className="text-sm font-extrabold text-white mt-0.5">
                  {formatSign(netSavings)}
                </Text>
              </View>
              <View className="flex-1 pl-3">
                <Text className="text-[10px] text-white/80 font-semibold uppercase tracking-wider">
                  Outflow Share
                </Text>
                <Text className="text-sm font-extrabold text-white mt-0.5">
                  {totalIncome > 0
                    ? `${Math.min(100, Math.round((totalExpense / totalIncome) * 100))}%`
                    : totalExpense > 0
                    ? '100%'
                    : '0%'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. KEY METRICS: 2x2 GRID OF STAT CARDS */}
        <View className="px-5 pt-4">
          <View className="flex-row gap-3 mb-3">
            {/* Income Card */}
            <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-7 h-7 rounded-lg bg-emerald-50 items-center justify-center mr-2 border border-emerald-100">
                    <Ionicons name="arrow-down" size={14} color="#159A1D" />
                  </View>
                  <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Income
                  </Text>
                </View>
                {isCurrentMonth && dashboard?.todayIncome?.delta !== null && dashboard?.todayIncome?.delta !== undefined && (
                  <View
                    className={`px-1.5 py-0.5 rounded-md flex-row items-center ${
                      dashboard.todayIncome.delta >= 0 ? 'bg-emerald-50' : 'bg-rose-50'
                    }`}
                  >
                    <Ionicons
                      name={dashboard.todayIncome.delta >= 0 ? 'trending-up' : 'trending-down'}
                      size={10}
                      color={dashboard.todayIncome.delta >= 0 ? '#159A1D' : '#EF4444'}
                    />
                    <Text
                      className={`text-[9px] font-extrabold ml-0.5 ${
                        dashboard.todayIncome.delta >= 0 ? 'text-[#159A1D]' : 'text-rose-600'
                      }`}
                    >
                      {dashboard.todayIncome.delta >= 0
                        ? `+${dashboard.todayIncome.delta}%`
                        : `${dashboard.todayIncome.delta}%`}
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-xl font-extrabold text-[#159A1D] tracking-tight">
                {formatSign(totalIncome)}
              </Text>

              {isCurrentMonth && dashboard ? (
                <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-50">
                  <Text className="text-[10px] text-slate-400 font-medium">
                    Today: <Text className="font-bold text-slate-700">{formatSign(dashboard.todayIncome.today)}</Text>
                  </Text>
                  <Text className="text-[10px] text-slate-400 font-medium">
                    Week: <Text className="font-bold text-slate-700">{formatCurrency(dashboard.todayIncome.thisWeek)}</Text>
                  </Text>
                </View>
              ) : (
                <Text className="text-[10px] text-slate-400 font-medium mt-1">
                  For {selectedDate.format('MMM YYYY')}
                </Text>
              )}
            </View>

            {/* Expenses Card */}
            <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-7 h-7 rounded-lg bg-rose-50 items-center justify-center mr-2 border border-rose-100">
                    <Ionicons name="arrow-up" size={14} color="#EF4444" />
                  </View>
                  <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Expenses
                  </Text>
                </View>
                {isCurrentMonth && dashboard?.todayExpenses?.delta !== null && dashboard?.todayExpenses?.delta !== undefined && (
                  <View
                    className={`px-1.5 py-0.5 rounded-md flex-row items-center ${
                      dashboard.todayExpenses.delta <= 0 ? 'bg-emerald-50' : 'bg-rose-50'
                    }`}
                  >
                    <Ionicons
                      name={dashboard.todayExpenses.delta <= 0 ? 'trending-down' : 'trending-up'}
                      size={10}
                      color={dashboard.todayExpenses.delta <= 0 ? '#159A1D' : '#EF4444'}
                    />
                    <Text
                      className={`text-[9px] font-extrabold ml-0.5 ${
                        dashboard.todayExpenses.delta <= 0 ? 'text-[#159A1D]' : 'text-rose-600'
                      }`}
                    >
                      {dashboard.todayExpenses.delta > 0
                        ? `+${dashboard.todayExpenses.delta}%`
                        : `${dashboard.todayExpenses.delta}%`}
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-xl font-extrabold text-rose-600 tracking-tight">
                {formatSign(-totalExpense)}
              </Text>

              {isCurrentMonth && dashboard ? (
                <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-50">
                  <Text className="text-[10px] text-slate-400 font-medium">
                    Today: <Text className="font-bold text-slate-700">{formatSign(-dashboard.todayExpenses.today)}</Text>
                  </Text>
                  <Text className="text-[10px] text-slate-400 font-medium">
                    Week: <Text className="font-bold text-slate-700">{formatCurrency(dashboard.todayExpenses.thisWeek)}</Text>
                  </Text>
                </View>
              ) : (
                <Text className="text-[10px] text-slate-400 font-medium mt-1">
                  For {selectedDate.format('MMM YYYY')}
                </Text>
              )}
            </View>
          </View>

          {/* Row 2: Net Cash Flow & Month-End Projection */}
          <View className="flex-row gap-3">
            {/* Net Cash Flow */}
            <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Net Cash Flow
                </Text>
                <Ionicons
                  name={netSavings >= 0 ? 'checkmark-circle' : 'alert-circle'}
                  size={14}
                  color={netSavings >= 0 ? '#159A1D' : '#EF4444'}
                />
              </View>
              <Text
                className={`text-xl font-extrabold tracking-tight ${
                  netSavings >= 0 ? 'text-[#159A1D]' : 'text-rose-600'
                }`}
              >
                {formatSign(netSavings)}
              </Text>
              {isCurrentMonth && dashboard ? (
                <View className="mt-2 pt-2 border-t border-slate-50">
                  <Text className="text-[10px] text-slate-400 font-medium">
                    Daily P&L: <Text className={`font-bold ${dashboard.netProfit.daily >= 0 ? 'text-[#159A1D]' : 'text-rose-600'}`}>{formatSign(dashboard.netProfit.daily)}</Text>
                  </Text>
                </View>
              ) : (
                <Text className="text-[10px] text-slate-400 font-medium mt-1">
                  Income minus expenses
                </Text>
              )}
            </View>

            {/* Projected Month-End Spend */}
            <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {isCurrentMonth ? 'Projected Spend' : 'Net Saved'}
                </Text>
                <Ionicons
                  name={isCurrentMonth ? 'calendar-outline' : 'shield-checkmark-outline'}
                  size={14}
                  color={isCurrentMonth ? '#3B82F6' : '#159A1D'}
                />
              </View>
              <Text className="text-xl font-extrabold text-blue-600 tracking-tight">
                {isCurrentMonth && dashboard?.projection
                  ? formatCurrency(dashboard.projection.projectedMonthEndSpend)
                  : formatCurrency(Math.max(0, netSavings))}
              </Text>
              {isCurrentMonth && dashboard?.projection ? (
                <View className="mt-2 pt-2 border-t border-slate-50">
                  <Text className="text-[10px] text-slate-400 font-medium">
                    Avg: <Text className="font-bold text-slate-700">{formatCurrency(dashboard.projection.averageDailySpend)}/day</Text>
                  </Text>
                </View>
              ) : (
                <Text className="text-[10px] text-slate-400 font-medium mt-1">
                  Saved this period
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* 4. COMMITTED RECURRING OBLIGATIONS (Matching Web) */}
        {dashboard?.commitments && (
          <View className="px-5 pt-4">
            <TouchableOpacity
              onPress={() => router.push('/subscriptions')}
              activeOpacity={0.8}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-slate-100"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-xl bg-purple-50 items-center justify-center mr-2.5 border border-purple-100">
                    <Ionicons name="repeat" size={16} color="#7E22CE" />
                  </View>
                  <View>
                    <Text className="text-sm font-extrabold text-slate-800">
                      Committed Outflow
                    </Text>
                    <Text className="text-[11px] text-purple-700 font-semibold">
                      {dashboard.commitments.committedPercentOfIncome !== null
                        ? `${dashboard.commitments.committedPercentOfIncome}% of monthly income`
                        : 'Active subscriptions'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </View>

              <View className="flex-row items-center justify-between pt-3 mt-2 border-t border-slate-100">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Monthly Committed
                  </Text>
                  <Text className="text-base font-extrabold text-purple-700 mt-0.5">
                    {formatCurrency(dashboard.commitments.monthlyCommitted)}
                  </Text>
                </View>
                <View className="flex-1 border-l border-slate-100 pl-3">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Due in 7 Days
                  </Text>
                  <Text className="text-sm font-bold text-amber-600 mt-0.5">
                    {dashboard.commitments.dueNext7.count} bill{dashboard.commitments.dueNext7.count === 1 ? '' : 's'} ({formatCurrency(dashboard.commitments.dueNext7.amount)})
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* 5. INCOME VS EXPENSES 6-MONTH COMPARISON (Gifted BarChart) */}
        {barData.length > 0 && (
          <View className="px-5 pt-5">
            <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-100">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-base font-extrabold text-slate-900">
                    Income vs Expenses
                  </Text>
                  <Text className="text-xs text-slate-400 font-medium mt-0.5">
                    Historical 6 months trend
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] mr-1.5" />
                    <Text className="text-xs font-semibold text-slate-600">Income</Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2.5 h-2.5 rounded-full bg-[#EF4444] mr-1.5" />
                    <Text className="text-xs font-semibold text-slate-600">Expenses</Text>
                  </View>
                </View>
              </View>

              <View className="items-center justify-center py-2">
                <BarChart
                  data={barData}
                  barWidth={12}
                  spacing={16}
                  initialSpacing={12}
                  noOfSections={4}
                  maxValue={maxBarValue}
                  yAxisThickness={0}
                  xAxisThickness={1}
                  xAxisColor="#E2E8F0"
                  yAxisTextStyle={{ color: '#94A3B8', fontSize: 9 }}
                  rulesType="solid"
                  rulesColor="#F8FAFC"
                  hideRules={false}
                  isAnimated
                  animationDuration={350}
                  formatYLabel={(val) => {
                    const num = Number(val);
                    if (num >= 1000) return `$${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
                    return `$${num}`;
                  }}
                  width={windowWidth - 95}
                  height={190}
                />
              </View>
            </View>
          </View>
        )}

        {/* 6. SPENDING BY CATEGORY (DONUT & LIST) */}
        <View className="px-5 pt-5">
          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-100">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-base font-extrabold text-slate-900">
                  Spending by Category
                </Text>
                <Text className="text-xs text-slate-400 font-medium mt-0.5">
                  {selectedDate.format('MMMM YYYY')} expenses
                </Text>
              </View>
              <View className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <Text className="text-xs font-bold text-slate-600">
                  {categoryBreakdown.length} {categoryBreakdown.length === 1 ? 'Category' : 'Categories'}
                </Text>
              </View>
            </View>

            {/* Donut Chart */}
            {categoryBreakdown.length > 0 ? (
              <View className="items-center justify-center py-4">
                <PieChart
                  data={pieData}
                  donut
                  radius={100}
                  innerRadius={64}
                  innerCircleColor="#FFFFFF"
                  centerLabelComponent={() => (
                    <View className="items-center justify-center">
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Total Spent
                      </Text>
                      <Text className="text-lg font-black text-slate-900 mt-0.5">
                        {formatCurrency(totalExpense)}
                      </Text>
                    </View>
                  )}
                />

                {/* Category Pills Preview */}
                <View className="flex-row flex-wrap justify-center gap-2 mt-4 px-2">
                  {categoryBreakdown.slice(0, 6).map((cat) => (
                    <View
                      key={cat.category_id}
                      className="flex-row items-center px-2 py-1 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <View
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: cat.category_color || '#3B82F6' }}
                      />
                      <Text className="text-[11px] font-semibold text-slate-700">
                        {cat.category_name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View className="items-center justify-center py-10">
                <Ionicons name="pie-chart-outline" size={54} color="#CBD5E1" />
                <Text className="text-slate-400 font-semibold text-xs mt-3">
                  No expense transactions recorded in {selectedDate.format('MMMM YYYY')}
                </Text>
              </View>
            )}

            {/* Detailed Expense Category List */}
            {categoryBreakdown.length > 0 && (
              <View className="mt-4 pt-3 border-t border-slate-100">
                {categoryBreakdown.map((cat) => {
                  const hasBudget = cat.budget_limit && cat.budget_limit > 0;
                  const percentage = hasBudget
                    ? Math.round((cat.total_amount / cat.budget_limit!) * 100)
                    : totalExpense > 0
                    ? Math.round((cat.total_amount / totalExpense) * 100)
                    : 0;

                  // Determine progress bar color
                  let progressColor = cat.category_color || '#3B82F6';
                  let statusBadge = null;
                  if (hasBudget) {
                    if (percentage >= 100) {
                      progressColor = '#EF4444';
                      statusBadge = (
                        <Text className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded ml-1.5">
                          Over Budget
                        </Text>
                      );
                    } else if (percentage >= 80) {
                      progressColor = '#F59E0B';
                      statusBadge = (
                        <Text className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-1.5">
                          Near Cap
                        </Text>
                      );
                    }
                  }

                  return (
                    <View
                      key={cat.category_id}
                      className="py-3 border-b border-slate-50 last:border-b-0"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center flex-1 mr-2">
                          <View
                            className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                            style={{
                              backgroundColor: (cat.category_color || '#3B82F6') + '20',
                            }}
                          >
                            <Ionicons
                              name={(cat.icon_name as any) || 'pricetag-outline'}
                              size={18}
                              color={cat.category_color || '#3B82F6'}
                            />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center">
                              <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>
                                {cat.category_name}
                              </Text>
                              {statusBadge}
                            </View>
                            <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
                              {hasBudget
                                ? `${percentage}% of ${formatCurrency(cat.budget_limit!)} cap`
                                : `${percentage}% of total spend`}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="text-sm font-extrabold text-slate-900">
                            {formatCurrency(cat.total_amount)}
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: progressColor,
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* 7. INCOME BREAKDOWN LIST */}
        {incomeCategoryBreakdown.length > 0 && (
          <View className="px-5 pt-5">
            <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-100">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-base font-extrabold text-slate-900">
                    Income Sources
                  </Text>
                  <Text className="text-xs text-slate-400 font-medium mt-0.5">
                    Categorized incoming funds
                  </Text>
                </View>
                <View className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  <Text className="text-xs font-bold text-[#159A1D]">
                    {formatSign(totalIncome)}
                  </Text>
                </View>
              </View>

              {incomeCategoryBreakdown.map((cat) => {
                const percentage =
                  totalIncome > 0
                    ? Math.round((cat.total_amount / totalIncome) * 100)
                    : 0;

                return (
                  <View
                    key={cat.category_id}
                    className="py-3 border-b border-slate-50 last:border-b-0"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View
                          className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                          style={{
                            backgroundColor: (cat.category_color || '#10B981') + '20',
                          }}
                        >
                          <Ionicons
                            name={(cat.icon_name as any) || 'cash-outline'}
                            size={18}
                            color={cat.category_color || '#10B981'}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-slate-800" numberOfLines={1}>
                            {cat.category_name}
                          </Text>
                          <Text className="text-[11px] font-medium text-slate-400 mt-0.5">
                            {percentage}% of total income
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-extrabold text-[#159A1D]">
                          +{formatCurrency(cat.total_amount)}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full bg-[#159A1D]"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
