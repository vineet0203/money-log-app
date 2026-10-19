import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import Header from '../../components/common/Header';
import { useGetAssetReportDetails } from '../../api/plaid';

const screenWidth = Dimensions.get('window').width;

export default function AssetReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, error } = useGetAssetReportDetails(id);
  const report = data?.report;

  const analytics = useMemo(() => {
    if (!report) return null;

    let totalAssets = 0;
    let totalLiabilities = 0;
    let cash = 0;
    let investments = 0;
    let creditCards = 0;
    let creditLimit = 0;
    let loans = 0;
    
    const accountList: any[] = [];
    let ownersList: any[] = [];
    const historicalMap: Record<string, number> = {};

    report.items.forEach((item: any) => {
      item.accounts.forEach((acc: any) => {
        const bal = acc.balances.current || 0;
        
        if (['credit', 'loan'].includes(acc.type)) {
          totalLiabilities += bal;
          if (acc.type === 'credit') {
            creditCards += bal;
            if (acc.balances.limit) creditLimit += acc.balances.limit;
          } else {
            loans += bal;
          }
        } else {
          totalAssets += bal;
          if (acc.type === 'investment' || acc.type === 'brokerage') investments += bal;
          else cash += bal;
        }

        accountList.push({
          id: acc.account_id,
          institution: item.institution_name,
          name: acc.name,
          mask: acc.mask,
          type: acc.type,
          subtype: acc.subtype,
          balance: bal,
        });

        if (acc.owners && acc.owners.length > 0) {
          acc.owners.forEach((o: any) => ownersList.push(o));
        }

        // Historical data
        if (acc.historical_balances && !['credit', 'loan'].includes(acc.type)) {
          acc.historical_balances.forEach((hb: any) => {
            if (!historicalMap[hb.date]) historicalMap[hb.date] = 0;
            historicalMap[hb.date] += hb.current;
          });
        }
      });
    });

    // Format chart data for gifted-charts
    const chartData = Object.keys(historicalMap)
      .sort()
      .map((date) => {
        return {
          value: historicalMap[date],
          label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dateString: date
        };
      });

    const uniqueOwners = Array.from(new Map(ownersList.map(o => [o.names[0], o])).values());

    const breakdownData = [
      { name: 'Cash', value: cash, color: '#3B82F6' },
      { name: 'Investments', value: investments, color: '#0EA5E9' },
      { name: 'Credit Cards', value: creditCards, color: '#EF4444' },
      { name: 'Loans', value: loans, color: '#F97316' },
    ].filter(d => d.value > 0);

    const liquidData = [
      { name: 'Highly Liquid (Cash)', value: cash, color: '#10B981' },
      { name: 'Investments', value: investments, color: '#3B82F6' },
    ].filter(d => d.value > 0);

    const netWorth = totalAssets - totalLiabilities;
    const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const utilization = creditLimit > 0 ? (creditCards / creditLimit) * 100 : 0;

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      accountCount: accountList.length,
      institutionCount: report.items.length,
      accountList,
      uniqueOwners,
      chartData,
      breakdownData,
      liquidData,
      stats: {
        debtRatio,
        utilization,
      }
    };
  }, [report]);

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Header title="Asset Report Analytics" showBack={true} />

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
        ) : error || !report ? (
          <View className="bg-red-50 p-6 rounded-3xl flex-row items-center mt-4">
            <Ionicons name="alert-circle" size={24} color="#DC2626" />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-red-700">Failed to load report</Text>
              <Text className="text-sm text-red-600 mt-1">The report might still be generating or does not exist.</Text>
            </View>
          </View>
        ) : (
          <>
            {/* KPI Cards (Grid) */}
            <View className="flex-row flex-wrap justify-between gap-y-4 mb-6">
              <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 w-[48%] overflow-hidden relative">
                <View className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full opacity-50" />
                <Text className="text-slate-500 font-medium text-xs mb-1">Total Verified Assets</Text>
                <Text className="text-lg font-extrabold text-slate-800" numberOfLines={1} adjustsFontSizeToFit>
                  ${analytics?.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 w-[48%] overflow-hidden relative">
                <View className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full opacity-50" />
                <Text className="text-slate-500 font-medium text-xs mb-1">Total Liabilities</Text>
                <Text className="text-lg font-extrabold text-slate-800" numberOfLines={1} adjustsFontSizeToFit>
                  ${analytics?.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 w-[48%] overflow-hidden relative">
                <View className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full opacity-50" />
                <Text className="text-slate-500 font-medium text-xs mb-1">Net Worth</Text>
                <Text className="text-lg font-extrabold text-slate-800" numberOfLines={1} adjustsFontSizeToFit>
                  ${analytics?.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 w-[48%] overflow-hidden relative">
                <View className="absolute -right-4 -top-4 w-16 h-16 bg-purple-50 rounded-full opacity-50" />
                <Text className="text-slate-500 font-medium text-xs mb-1">Verified Accounts</Text>
                <Text className="text-lg font-extrabold text-slate-800">
                  {analytics?.accountCount}
                </Text>
                <Text className="text-xs font-medium text-slate-400 mt-0.5">
                  across {analytics?.institutionCount} inst.
                </Text>
              </View>
            </View>

            {/* Historical Trend Chart */}
            <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
              <Text className="text-lg font-bold text-slate-800 mb-6">Historical Asset Trend</Text>
              {analytics?.chartData && analytics.chartData.length > 0 ? (
                <View className="ml-[-10]">
                  <LineChart
                    areaChart
                    data={analytics.chartData}
                    width={screenWidth - 90}
                    height={200}
                    spacing={50}
                    initialSpacing={10}
                    endSpacing={20}
                    color="#159A1D"
                    thickness={3}
                    startFillColor="#159A1D"
                    endFillColor="#159A1D"
                    startOpacity={0.3}
                    endOpacity={0}
                    noOfSections={4}
                    scrollToEnd
                    scrollAnimation
                    yAxisColor="transparent"
                    yAxisThickness={0}
                    xAxisColor="#E2E8F0"
                    xAxisThickness={1}
                    yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
                    formatYLabel={(val) => `$${(Number(val) / 1000).toFixed(0)}k`}
                    hideDataPoints
                    rulesType="solid"
                    rulesColor="#F1F5F9"
                    pointerConfig={{
                      pointerStripHeight: 160,
                      pointerStripColor: '#CBD5E1',
                      pointerStripWidth: 2,
                      pointerColor: '#159A1D',
                      radius: 6,
                      pointerLabelWidth: 100,
                      pointerLabelHeight: 90,
                      activatePointersOnLongPress: true,
                      autoAdjustPointerLabelPosition: true,
                      pointerLabelComponent: (items: any) => {
                        const item = items[0];
                        return (
                          <View className="bg-slate-800 rounded-xl p-3 items-center justify-center -ml-[50px] w-[100px]">
                            <Text className="text-white font-extrabold text-sm mb-1">${item.value.toLocaleString(undefined, {minimumFractionDigits: 0})}</Text>
                            <Text className="text-slate-400 text-xs">{item.label}</Text>
                          </View>
                        );
                      },
                    }}
                  />
                </View>
              ) : (
                <View className="h-[200px] items-center justify-center bg-slate-50 rounded-2xl">
                  <Text className="text-slate-400 font-medium">No historical data available</Text>
                </View>
              )}
            </View>

            {/* Assets vs Debt Custom Stacked Bar */}
            <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
              <Text className="text-lg font-bold text-slate-800 mb-6">Assets vs Debt Breakdown</Text>
              
              {/* Stacked Bar UI */}
              <View className="h-6 flex-row rounded-full overflow-hidden mb-6">
                {analytics?.breakdownData.map((d: any) => {
                  const total = (analytics.totalAssets + analytics.totalLiabilities) || 1;
                  const percentage = (d.value / total) * 100;
                  return (
                    <View key={d.name} style={{ width: `${percentage}%`, backgroundColor: d.color }} />
                  );
                })}
              </View>

              {/* Legend Grid */}
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {analytics?.breakdownData.map((d: any) => (
                  <View key={d.name} className="flex-row items-center w-[48%]">
                    <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }} />
                    <View>
                      <Text className="text-xs text-slate-500 font-medium">{d.name}</Text>
                      <Text className="text-sm font-bold text-slate-800">${(d.value / 1000).toFixed(0)}k</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Liquidity Profile */}
            <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
              <Text className="text-lg font-bold text-slate-800 mb-6">Liquidity Profile</Text>
              <View className="items-center justify-center mb-6">
                <PieChart
                  data={analytics?.liquidData || []}
                  donut
                  innerRadius={60}
                  radius={80}
                  innerCircleColor="transparent"
                  centerLabelComponent={() => (
                    <View className="items-center justify-center">
                      <Text className="text-xs text-slate-500 font-medium">Total</Text>
                      <Text className="text-base font-bold text-slate-800">
                        ${(analytics?.totalAssets || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </Text>
                    </View>
                  )}
                />
              </View>
              {/* Liquidity Legend */}
              <View className="flex-row flex-wrap justify-center gap-x-6 gap-y-3">
                {analytics?.liquidData.map((d: any) => (
                  <View key={d.name} className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }} />
                    <View>
                      <Text className="text-xs text-slate-500 font-medium">{d.name}</Text>
                      <Text className="text-sm font-bold text-slate-800">${(d.value / 1000).toFixed(0)}k</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Advanced Stats */}
            <View className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 mb-6">
              <View className="flex-row items-center justify-between border-b border-slate-50 pb-4 mb-4">
                <View>
                  <Text className="text-sm font-medium text-slate-500">Debt-to-Asset Ratio</Text>
                  <Text className="text-2xl font-bold text-slate-800">{analytics?.stats.debtRatio.toFixed(1)}%</Text>
                </View>
                <View className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Text className="text-base font-bold text-slate-400">%</Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-medium text-slate-500">Credit Utilization</Text>
                  <Text className="text-2xl font-bold text-slate-800">{analytics?.stats.utilization.toFixed(1)}%</Text>
                </View>
                <View className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <Ionicons name="card" size={18} color="#4F46E5" />
                </View>
              </View>
            </View>

            {/* Verified Identity (KYC) */}
            <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
              <View className="flex-row items-center mb-5">
                <View className="p-2 bg-indigo-50 rounded-xl mr-3">
                  <Ionicons name="shield-checkmark" size={20} color="#4F46E5" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-slate-800">Verified Identity</Text>
                  <Text className="text-xs text-slate-500 font-medium">Bank-extracted KYC data</Text>
                </View>
              </View>

              {analytics?.uniqueOwners.length === 0 ? (
                <Text className="text-slate-500 text-sm text-center py-4">No identity data available in this report.</Text>
              ) : (
                analytics?.uniqueOwners.map((owner: any, idx: number) => {
                  const name = owner.names[0] || 'Unknown';
                  const email = owner.emails?.[0]?.data;
                  const phone = owner.phone_numbers?.[0]?.data;
                  const addressObj = owner.addresses?.[0]?.data;
                  const addressStr = addressObj ? `${addressObj.street || ''}, ${addressObj.city || ''} ${addressObj.region || ''}` : null;

                  return (
                    <View key={idx} className={`bg-slate-50 rounded-2xl p-4 border border-slate-100 ${idx !== analytics.uniqueOwners.length - 1 ? 'mb-4' : ''}`}>
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="person-circle" size={20} color="#94A3B8" />
                        <Text className="text-sm font-bold text-slate-800 ml-2">{name}</Text>
                      </View>
                      
                      {email && (
                        <View className="flex-row items-center mt-2 ml-1">
                          <Ionicons name="mail" size={14} color="#94A3B8" />
                          <Text className="text-xs font-semibold text-slate-600 ml-2.5">{email}</Text>
                        </View>
                      )}
                      
                      {phone && (
                        <View className="flex-row items-center mt-2 ml-1">
                          <Ionicons name="call" size={14} color="#94A3B8" />
                          <Text className="text-xs font-semibold text-slate-600 ml-2.5">{phone}</Text>
                        </View>
                      )}
                      
                      {addressStr && (
                        <View className="flex-row items-start mt-2 ml-1">
                          <Ionicons name="location" size={14} color="#94A3B8" style={{ marginTop: 2 }} />
                          <Text className="text-xs text-slate-600 ml-2.5 flex-1 leading-tight">{addressStr}</Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>

            <Text className="text-sm font-extrabold text-slate-800 mb-4 px-1 uppercase tracking-wider">Included Accounts</Text>
            
            <View className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-10">
              {analytics?.accountList.map((acc, i) => (
                <View key={acc.id} className={`p-4 ${i !== analytics.accountList.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-bold text-slate-800 text-sm max-w-[65%]">{acc.name} {acc.mask ? `...${acc.mask}` : ''}</Text>
                    <Text className="font-extrabold text-slate-900 text-sm">
                      ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-slate-500 text-xs font-medium">{acc.institution}</Text>
                    <Text className="text-slate-400 text-xs capitalize">{acc.subtype || acc.type}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
