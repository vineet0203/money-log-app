import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BudgetData {
  category: string;
  spent: number;
  total: number;
  color: string;
}

interface BudgetHealthRollup {
  totalBudget: number;
  totalSpent: number;
  overLimit: number;
  nearLimit: number;
  totalTracked: number;
}

interface BudgetHealthCardProps {
  budgets?: BudgetData[];
  budgetHealth?: BudgetHealthRollup;
  onManagePress?: () => void;
}

export default function BudgetHealthCard({
  budgets = [],
  budgetHealth,
  onManagePress,
}: BudgetHealthCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onManagePress) {
      onManagePress();
    } else {
      router.push('/categories');
    }
  };

  const hasBudgets = budgets.length > 0 || (budgetHealth && budgetHealth.totalBudget > 0);

  // Top 4 categories sorted by max spend
  const topBudgets = React.useMemo(() => {
    return [...budgets]
      .sort((a, b) => (b.spent || 0) - (a.spent || 0))
      .slice(0, 4);
  }, [budgets]);

  const overLimit = budgetHealth?.overLimit || 0;
  const nearLimit = budgetHealth?.nearLimit || 0;
  const totalBudget = budgetHealth?.totalBudget || 0;
  const totalSpent = budgetHealth?.totalSpent || 0;

  const overallPercent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm shadow-slate-100 mb-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-2.5">
            <Ionicons name="pie-chart" size={16} color="#159A1D" />
          </View>
          <Text className="text-base font-extrabold text-slate-900">Budget & Spending Health</Text>
        </View>

        <TouchableOpacity onPress={handlePress} activeOpacity={0.7} className="flex-row items-center">
          <Text className="text-xs font-bold text-[#159A1D] mr-0.5">Manage</Text>
          <Ionicons name="chevron-forward" size={14} color="#159A1D" />
        </TouchableOpacity>
      </View>

      {!hasBudgets ? (
        <View className="py-5 px-3 bg-slate-50/60 rounded-2xl items-center justify-center border border-dashed border-slate-200 mt-1">
          <Ionicons name="layers-outline" size={28} color="#94A3B8" className="mb-2" />
          <Text className="text-xs font-bold text-slate-700 text-center mb-1">No Category Budgets Set</Text>
          <Text className="text-[11px] text-slate-400 text-center mb-3 px-4">
            Set monthly budget limits for your categories to track spending health in real time.
          </Text>
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            className="bg-[#159A1D] px-4 py-2 rounded-full"
          >
            <Text className="text-white text-xs font-bold">Set Budgets</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Health Summary Bar */}
          <View className="flex-row justify-between items-center bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100">
            {/* Status Pill */}
            {overLimit > 0 ? (
              <View className="bg-rose-100 px-2.5 py-1 rounded-full flex-row items-center">
                <Ionicons name="alert-circle" size={12} color="#E11D48" />
                <Text className="text-rose-700 text-[11px] font-bold ml-1">
                  {overLimit} over budget
                </Text>
              </View>
            ) : nearLimit > 0 ? (
              <View className="bg-amber-100 px-2.5 py-1 rounded-full flex-row items-center">
                <Ionicons name="warning" size={12} color="#D97706" />
                <Text className="text-amber-800 text-[11px] font-bold ml-1">
                  {nearLimit} near limit
                </Text>
              </View>
            ) : (
              <View className="bg-emerald-100 px-2.5 py-1 rounded-full flex-row items-center">
                <Ionicons name="checkmark-circle" size={12} color="#159A1D" />
                <Text className="text-emerald-800 text-[11px] font-bold ml-1">
                  All limits on track
                </Text>
              </View>
            )}

            {/* Spent vs Budget */}
            <View className="items-end">
              <Text className="text-xs font-extrabold text-slate-800 font-mono">
                ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <Text className="text-slate-400 font-normal"> / </Text>
                ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text className="text-[10px] text-slate-500 font-medium">
                {overallPercent}% total budget used
              </Text>
            </View>
          </View>

          {/* Top Category Budget Progress Bars */}
          <View className="space-y-3">
            {topBudgets.map((b, idx) => {
              const cap = b.total || 0;
              const spent = b.spent || 0;
              const pct = cap > 0 ? Math.min(100, Math.round((spent / cap) * 100)) : 100;
              const isOver = cap > 0 && spent > cap;
              const barColor = isOver ? '#E11D48' : b.color || '#159A1D';

              return (
                <View key={b.category + idx} className="py-1">
                  <View className="flex-row justify-between items-center mb-1.5">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View
                        className="w-2.5 h-2.5 rounded-full mr-2"
                        style={{ backgroundColor: b.color || '#159A1D' }}
                      />
                      <Text className="text-xs font-bold text-slate-800 truncate" numberOfLines={1}>
                        {b.category}
                      </Text>
                    </View>

                    <Text className="text-xs font-extrabold text-slate-700 font-mono">
                      ${spent.toFixed(2)}
                      {cap > 0 && (
                        <Text className="text-slate-400 font-normal"> / ${cap.toFixed(2)}</Text>
                      )}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}
