import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataStore } from '../../store/dataStore';
import TransactionCard from '../../components/cards/TransactionCard';
import EmptyState from '../../components/common/EmptyState';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AccountDetails() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const cashAccountsData = useDataStore((state) => state.cashAccounts);
  const creditAccountsData = useDataStore((state) => state.creditAccounts);
  const transactionsData = useDataStore((state) => state.transactions);
  
  const [activeFilter, setActiveFilter] = useState('Today');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Interactive mock state for Date Picker
  const [startDate, setStartDate] = useState(new Date('2024-09-01T12:00:00'));
  const [endDate, setEndDate] = useState(new Date('2024-10-13T12:00:00'));
  const [selectingDate, setSelectingDate] = useState<'start' | 'end' | null>(null);
  
  const allAccounts = [...cashAccountsData, ...creditAccountsData];
  const account = allAccounts.find(a => a.id === id);

  const filters = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setSelectingDate(null);
    }
    if (selectedDate) {
      if (selectingDate === 'start') setStartDate(selectedDate);
      if (selectingDate === 'end') setEndDate(selectedDate);
    }
  };

  if (!account) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-slate-500 font-bold mb-4">Account details not available</Text>
        <TouchableOpacity onPress={() => router.back()} className="px-6 py-3 bg-primary rounded-xl">
           <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16 }} className="px-5 pb-6 bg-white rounded-b-3xl shadow-sm shadow-slate-100 relative overflow-hidden z-10 border-b border-slate-100">
        <View className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mt-10 -mr-10 blur-2xl" />
        
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-text font-bold text-lg">Account Details</Text>
          <View className="w-10 h-10" />
        </View>

        <View className="items-center mb-2">
          <View className={`w-16 h-16 rounded-full ${account.bg} items-center justify-center mb-4`}>
            <Ionicons name={account.icon as any} size={28} color={account.color.replace('bg-[', '').replace(']', '') || '#6BCB77'} />
          </View>
          <Text className="text-textMuted font-medium text-sm mb-1 uppercase tracking-widest">{account.name}</Text>
          <Text className="text-4xl font-extrabold text-text tracking-tight">{account.amount}</Text>
          <Text className="text-textMuted mt-2 font-medium">{account.bank}</Text>
        </View>
      </View>

      {/* Filters & Export Row */}
      <View className="flex-row items-center pt-6 px-5 pb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 mr-3">
          <View className="flex-row pr-4">
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full mr-2 border ${
                  activeFilter === filter 
                    ? 'bg-primary border-primary' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`font-semibold text-sm ${
                  activeFilter === filter ? 'text-white' : 'text-slate-500'
                }`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-100"
        >
          <Ionicons name="download-outline" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {transactionsData.length === 0 ? (
          <EmptyState 
            iconName="receipt-outline" 
            title="No Transactions" 
            message="No transactions found for this account." 
          />
        ) : (
          transactionsData.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
          ))
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Export Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          className="flex-1 bg-black/40 justify-end"
          onPress={() => {
            setModalVisible(false);
            setSelectingDate(null);
          }}
        >
          <Pressable className="bg-white rounded-t-3xl p-6 shadow-2xl" onPress={(e) => e.stopPropagation()}>
            <View className="w-12 h-1 bg-slate-200 rounded-full self-center mb-6" />
            
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-slate-800">Export Transactions</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-slate-500 mb-4 font-medium">Select Date Range</Text>
            
            <View className="flex-row justify-between mb-8">
              <TouchableOpacity 
                onPress={() => setSelectingDate('start')}
                className={`flex-1 p-4 rounded-2xl border mr-2 items-center flex-row justify-center ${selectingDate === 'start' ? 'bg-primary/10 border-primary' : 'bg-slate-50 border-slate-200'}`}
              >
                <Ionicons name="calendar-outline" size={18} color={selectingDate === 'start' ? '#4CAF50' : '#64748B'} className="mr-2" />
                <Text className={`font-semibold ml-2 ${selectingDate === 'start' ? 'text-primary' : 'text-slate-700'}`}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setSelectingDate('end')}
                className={`flex-1 p-4 rounded-2xl border ml-2 items-center flex-row justify-center ${selectingDate === 'end' ? 'bg-primary/10 border-primary' : 'bg-slate-50 border-slate-200'}`}
              >
                <Ionicons name="calendar-outline" size={18} color={selectingDate === 'end' ? '#4CAF50' : '#64748B'} className="mr-2" />
                <Text className={`font-semibold ml-2 ${selectingDate === 'end' ? 'text-primary' : 'text-slate-700'}`}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>

            {selectingDate && (
              <View className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 items-center justify-center">
                <DateTimePicker
                  value={selectingDate === 'start' ? startDate : endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  themeVariant="light"
                  maximumDate={new Date()}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity onPress={() => setSelectingDate(null)} className="mt-4 bg-primary/10 px-8 py-3 rounded-full">
                    <Text className="font-bold text-primary">Confirm Date</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <TouchableOpacity 
              className="bg-primary shadow-lg shadow-primary/30 py-4 rounded-2xl items-center mb-6 flex-row justify-center"
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="document-text-outline" size={20} color="#FFF" className="mr-2" />
              <Text className="text-white font-bold text-lg ml-2">Download CSV</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
