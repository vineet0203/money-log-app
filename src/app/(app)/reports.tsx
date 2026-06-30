import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-gifted-charts";
import { useMonthlyReport } from "../../api/reports";

export default function ReportsScreen() {
  const { data, isLoading, isError, refetch } = useMonthlyReport();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#6BCB77" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-red-500 font-bold">Failed to load reports.</Text>
      </View>
    );
  }

  const {
    totalIncome,
    totalExpense,
    categoryBreakdown,
    incomeCategoryBreakdown,
  } = data;

  // Format data for Gifted Charts
  const pieData = categoryBreakdown.map((cat) => ({
    value: cat.total_amount,
    color: cat.category_color,
    text: `${totalExpense > 0 ? Math.round((cat.total_amount / totalExpense) * 100) : 0}%`,
  }));

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6BCB77"
            colors={["#6BCB77"]}
          />
        }
      >
        {/* Month Selector Header */}
        <View className="flex-row items-center justify-between px-6 py-5 bg-white border-b border-slate-100">
          <Ionicons name="chevron-back" size={24} color="#64748B" />
          <Text className="text-lg font-bold text-slate-800">This Month</Text>
          <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
        </View>

        {/* Overview Cards */}
        <View className="flex-row px-5 py-6">
          <View className="flex-1 bg-white p-4 rounded-2xl mr-2 shadow-sm shadow-slate-100 border border-slate-100">
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-2">
                <Ionicons name="arrow-down" size={14} color="#22C55E" />
              </View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Income
              </Text>
            </View>
            <Text className="text-2xl font-extrabold text-slate-800">
              ${totalIncome.toFixed(2)}
            </Text>
          </View>

          <View className="flex-1 bg-white p-4 rounded-2xl ml-2 shadow-sm shadow-slate-100 border border-slate-100">
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 rounded-full bg-red-100 items-center justify-center mr-2">
                <Ionicons name="arrow-up" size={14} color="#EF4444" />
              </View>
              <Text className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Expense
              </Text>
            </View>
            <Text className="text-2xl font-extrabold text-slate-800">
              ${totalExpense.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Pie Chart */}
        {categoryBreakdown.length > 0 ? (
          <View className="items-center justify-center py-6">
            <PieChart
              data={pieData}
              donut
              showText
              textColor="black"
              radius={120}
              innerRadius={70}
              textSize={12}
              centerLabelComponent={() => (
                <View className="items-center justify-center">
                  <Text className="text-xs font-bold text-slate-400">
                    Total
                  </Text>
                  <Text className="text-xl font-extrabold text-slate-800">
                    ${totalExpense.toFixed(0)}
                  </Text>
                </View>
              )}
            />
          </View>
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons name="pie-chart-outline" size={64} color="#CBD5E1" />
            <Text className="text-slate-400 font-medium mt-4">
              No expenses this month
            </Text>
          </View>
        )}

        {/* Breakdown List */}
        <View className="px-5 pb-10">
          <Text className="text-sm font-extrabold text-slate-800 mb-4">
            Spending Breakdown
          </Text>

          {categoryBreakdown.map((cat) => {
            const hasBudget = cat.budget_limit && cat.budget_limit > 0;
            const percentage = hasBudget
              ? Math.round((cat.total_amount / cat.budget_limit!) * 100)
              : totalExpense > 0
                ? Math.round((cat.total_amount / totalExpense) * 100)
                : 0;

            // Determine progress bar color
            let progressColor = cat.category_color;
            let containerBgClass = "bg-white border-slate-100";
            if (hasBudget) {
              if (percentage >= 100) {
                progressColor = "#EF4444"; // Red
                containerBgClass = "bg-red-50 border-red-100";
              } else if (percentage >= 80) {
                progressColor = "#F59E0B"; // Orange
              }
            }

            return (
              <View
                key={cat.category_id}
                className={`p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100 border ${containerBgClass}`}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: cat.category_color + "20" }}
                    >
                      <Ionicons
                        name={cat.icon_name as any}
                        size={20}
                        color={cat.category_color}
                      />
                    </View>
                    <View>
                      <Text className="text-base font-bold text-slate-800">
                        {cat.category_name}
                      </Text>
                      <Text className="text-xs font-bold text-slate-400">
                        {hasBudget
                          ? `${percentage}% of budget`
                          : `${percentage}% of total`}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-extrabold text-slate-800">
                      ${cat.total_amount.toFixed(2)}
                    </Text>
                    {hasBudget && (
                      <Text className="text-xs font-medium text-slate-400">
                        / ${cat.budget_limit?.toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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

          {/* Income Breakdown */}
          {incomeCategoryBreakdown && incomeCategoryBreakdown.length > 0 && (
            <View className="mt-8">
              <Text className="text-sm font-extrabold text-slate-800 mb-4">
                Income Breakdown
              </Text>

              {incomeCategoryBreakdown.map((cat) => {
                const percentage =
                  totalIncome > 0
                    ? Math.round((cat.total_amount / totalIncome) * 100)
                    : 0;

                return (
                  <View
                    key={cat.category_id}
                    className="p-4 rounded-2xl mb-3 shadow-sm shadow-slate-100 border bg-white border-slate-100"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <View
                          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                          style={{ backgroundColor: cat.category_color + "20" }}
                        >
                          <Ionicons
                            name={cat.icon_name as any}
                            size={20}
                            color={cat.category_color}
                          />
                        </View>
                        <View>
                          <Text className="text-base font-bold text-slate-800">
                            {cat.category_name}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-base font-extrabold text-green-500">
                          +${cat.total_amount.toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: cat.category_color,
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
      </ScrollView>
    </View>
  );
}
