import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import MonthYearFilter from '../../components/reportscreen/MonthYearFilter';
import ReportSummaryCard from '../../components/reportscreen/ReportSummaryCard';

export default function Reports() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dummy data
  const income = 5240.00;
  const incomeChangePercentage = -2.5; // income decreased 2.5%
  const expense = 3120.50;
  const expenseChangePercentage = 12.5; // expenses increased 12.5%

  const pieData = [
    { value: 1500, color: '#3B82F6', text: '48%', title: 'Housing' },     // blue
    { value: 850, color: '#F97316', text: '27%', title: 'Food' },        // orange
    { value: 320.5, color: '#A855F7', text: '10%', title: 'Transport' },   // purple
    { value: 450, color: '#10B981', text: '15%', title: 'Other' },       // emerald
  ];

  return (
    <View className="flex-1 bg-slate-50">
      {/* Month & Year Filter */}
      <MonthYearFilter 
        currentDate={currentDate} 
        onChange={setCurrentDate} 
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Summary Card */}
        <ReportSummaryCard 
          income={income} 
          incomeChangePercentage={incomeChangePercentage}
          expense={expense} 
          expenseChangePercentage={expenseChangePercentage}
        />

        {/* Interactive Pie Chart & Legend */}
        <View className="bg-white rounded-3xl p-6 mx-5 mb-8 border border-slate-100 shadow-sm shadow-slate-100 items-center justify-center">
          <Text className="text-base font-extrabold text-text mb-6 self-start">Expense Distribution</Text>
          
          <View className="mb-4">
            <PieChart
              data={pieData}
              donut
              showText
              textColor="white"
              radius={110}
              innerRadius={65}
              textSize={12}
              focusOnPress
              centerLabelComponent={() => {
                return (
                  <View className="items-center justify-center">
                    <Text className="text-xl font-extrabold text-slate-800">
                      ${expense.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </Text>
                    <Text className="text-xs font-bold text-slate-400 mt-0.5">Total</Text>
                  </View>
                );
              }}
            />
          </View>

          {/* Legend */}
          <View className="w-full mt-4">
            {pieData.map((item, index) => (
              <View key={index} className="flex-row items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <View className="flex-row items-center">
                  <View style={{ backgroundColor: item.color }} className="w-4 h-4 rounded-full mr-3" />
                  <Text className="text-sm font-bold text-slate-700">{item.title}</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-sm font-extrabold text-slate-800 mr-2">
                    ${item.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                  <Text className="text-xs font-bold text-slate-400 w-10 text-right">{item.text}</Text>
                </View>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
