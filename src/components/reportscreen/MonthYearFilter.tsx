import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MonthYearFilterProps {
  currentDate: Date;
  onChange: (newDate: Date) => void;
}

export default function MonthYearFilter({ currentDate, onChange }: MonthYearFilterProps) {
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    onChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    onChange(newDate);
  };

  const monthYearString = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View className="flex-row items-center justify-between bg-white px-5 py-3 border-b border-slate-100">
      <TouchableOpacity 
        onPress={handlePrev} 
        activeOpacity={0.7}
        className="w-10 h-10 items-center justify-center bg-slate-50 rounded-full"
      >
        <Ionicons name="chevron-back" size={20} color="#64748B" />
      </TouchableOpacity>
      
      <Text className="text-base font-extrabold text-text tracking-wide">
        {monthYearString}
      </Text>

      <TouchableOpacity 
        onPress={handleNext} 
        activeOpacity={0.7}
        className="w-10 h-10 items-center justify-center bg-slate-50 rounded-full"
      >
        <Ionicons name="chevron-forward" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
}
