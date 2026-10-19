import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetLiabilityByAccountId } from '../../api/liabilities';

interface LiabilityInfoCardProps {
  accountId: number | string;
}

export default function LiabilityInfoCard({ accountId }: LiabilityInfoCardProps) {
  const { data: liability, isLoading } = useGetLiabilityByAccountId(accountId);

  if (isLoading) {
    return (
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-100 border border-slate-100 items-center justify-center py-10">
        <ActivityIndicator size="small" color="#4F46E5" />
      </View>
    );
  }

  // If no liability, show a simple "N/A" card
  if (!liability) {
    return (
      <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-100 border border-slate-100 mt-2">
        <Text className="text-base font-extrabold text-slate-800 mb-4">Liability Details</Text>
        <View className="items-center justify-center py-6">
          <Ionicons name="document-text-outline" size={32} color="#CBD5E1" className="mb-2" />
          <Text className="text-slate-400 font-medium text-center">N/A (Not a credit or loan account)</Text>
        </View>
      </View>
    );
  }

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A';
    return `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (val: string | null | undefined) => {
    if (!val) return 'N/A';
    return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  let parsedAprs: any[] = [];
  if (liability.aprs) {
    parsedAprs = typeof (liability as any).aprs === 'string' ? JSON.parse((liability as any).aprs) : (liability as any).aprs;
  }

  const rows = [
    { label: 'Total Balance', value: formatCurrency(liability.balance) },
    ...(parsedAprs.length > 0 ? [] : [
      { label: 'APR / Rate', value: liability.apr !== null && liability.apr !== undefined ? `${liability.apr}%` : 'N/A' },
      { label: 'Rate Type', value: liability.rate_type ? liability.rate_type.replace(/_/g, ' ') : 'N/A' }
    ]),
    { label: 'Min Payment', value: liability.minimum_payment !== null && liability.minimum_payment !== undefined ? formatCurrency(liability.minimum_payment) : 'N/A' },
    { label: 'Last Payment', value: liability.last_payment_amount !== null && liability.last_payment_amount !== undefined ? formatCurrency(liability.last_payment_amount) : 'N/A' },
    { label: 'Next Due', value: liability.next_payment_date ? formatDate(liability.next_payment_date) : 'N/A' },
    { label: 'Loan Term', value: liability.loan_term || 'N/A' },
    { label: 'Expected Payoff', value: liability.expected_payoff_date ? formatDate(liability.expected_payoff_date) : 'N/A' },
    { label: 'Origination Principal', value: liability.origination_principal !== null && liability.origination_principal !== undefined ? formatCurrency(liability.origination_principal) : 'N/A' },
    { label: 'YTD Interest Paid', value: liability.ytd_interest_paid !== null && liability.ytd_interest_paid !== undefined ? formatCurrency(liability.ytd_interest_paid) : 'N/A' }
  ];

  return (
    <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm shadow-slate-100 border border-slate-100 mt-2">
      <Text className="text-base font-extrabold text-slate-800 mb-4">Liability Details</Text>

      {/* Top Summary Cards */}
      <View className="flex-row justify-between mb-4">
        <View className="bg-slate-50 rounded-2xl p-4 flex-1 mr-2 border border-slate-100">
          <Text className="text-xs font-medium text-slate-500 mb-1">Current balance</Text>
          <Text className="text-xl font-extrabold text-slate-900">{formatCurrency(liability.balance)}</Text>
        </View>
        <View className="bg-slate-50 rounded-2xl p-4 flex-1 ml-2 border border-slate-100">
          <Text className="text-xs font-medium text-slate-500 mb-1">Minimum due</Text>
          <Text className="text-xl font-extrabold text-slate-900">{liability.minimum_payment !== null && liability.minimum_payment !== undefined ? formatCurrency(liability.minimum_payment) : 'N/A'}</Text>
        </View>
      </View>
      
      {/* Top Summary Cards Row 2 (Next due) - to match web layout closer */}
      <View className="flex-row mb-6">
        <View className="bg-slate-50 rounded-2xl p-4 flex-1 border border-slate-100">
          <Text className="text-xs font-medium text-slate-500 mb-1">Next due</Text>
          <Text className="text-xl font-extrabold text-slate-900">{liability.next_payment_date ? formatDate(liability.next_payment_date) : 'N/A'}</Text>
        </View>
      </View>

      {/* Credit Utilization */}
      {liability.credit_limit && liability.credit_limit > 0 ? (
        <View className="bg-[#E6F4EA] rounded-xl px-4 py-3 flex-row items-center justify-between mb-6">
          <Text className="text-sm font-semibold text-[#137333]">Credit utilization</Text>
          <Text className="text-sm font-bold text-[#137333]">
            {((liability.balance / liability.credit_limit) * 100).toFixed(1)}% of {formatCurrency(liability.credit_limit)} limit
          </Text>
        </View>
      ) : null}
      
      {/* APR Breakdown (if any) */}
      {parsedAprs && parsedAprs.length > 0 && (
        <View className="mb-6">
          <Text className="text-base font-bold text-slate-900 mb-1">APR breakdown</Text>
          <Text className="text-sm text-slate-500 mb-4 leading-tight">Balance shows the portion of your total owed at each rate, not a separate charge.</Text>
          <View className="border border-slate-100 rounded-2xl overflow-hidden">
            {parsedAprs.map((apr, i) => (
              <View key={i} className={`flex-row justify-between p-4 ${i !== parsedAprs.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <View>
                  <Text className="text-sm font-medium text-slate-800 capitalize">{apr.apr_type?.replace(/_/g, ' ')}</Text>
                  <Text className="text-xs text-slate-500 mt-1">Bal: {formatCurrency(apr.balance_subject_to_apr)}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-bold text-slate-800">{apr.apr_percentage != null ? `${apr.apr_percentage}%` : 'N/A'}</Text>
                  <Text className="text-xs text-slate-500 mt-1">Int: {formatCurrency(apr.interest_charge_amount)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Details List */}
      <View className="border-t border-slate-100 pt-3">
        {rows.map((row, i) => (
          <View key={i} className="flex-row justify-between items-center py-3">
            <Text className="text-sm font-medium text-slate-500">{row.label}</Text>
            <Text className="text-sm font-bold text-slate-900 text-right max-w-[60%]">{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
