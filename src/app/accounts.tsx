import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import AccountCard from '../components/cards/AccountCard';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { useAccounts, useAddAccount, useUpdateAccount, useDeleteAccount } from '../api/accounts';

// --- Helper Component: Custom MM/YYYY Picker Modal ---
const CustomMonthYearPicker = ({ visible, onClose, onSelect, currentDate }: any) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const [selectedMonth, setSelectedMonth] = useState(currentDate?.split('/')[0] || months[0]);
  const [selectedYear, setSelectedYear] = useState(currentDate?.split('/')[1] || currentYear.toString());

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View className="bg-white w-full rounded-2xl p-6 shadow-xl">
          <Text className="text-xl font-bold text-center mb-4 text-gray-800">Select Expiry Date</Text>
          
          <View className="flex-row justify-between mb-6">
            {/* Months Column */}
            <View className="flex-1 mr-2">
              <Text className="text-gray-500 font-bold mb-2 text-center">Month</Text>
              <View className="h-48">
                <ScrollView showsVerticalScrollIndicator={false}>
                  {months.map(m => (
                    <TouchableOpacity 
                      key={m} 
                      onPress={() => setSelectedMonth(m)}
                      className={`py-3 rounded-lg mb-1 ${selectedMonth === m ? 'bg-primary' : 'bg-gray-50'}`}
                    >
                      <Text className={`text-center font-bold ${selectedMonth === m ? 'text-white' : 'text-gray-700'}`}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Years Column */}
            <View className="flex-1 ml-2">
              <Text className="text-gray-500 font-bold mb-2 text-center">Year</Text>
              <View className="h-48">
                <ScrollView showsVerticalScrollIndicator={false}>
                  {years.map(y => {
                    const yStr = y.toString();
                    return (
                      <TouchableOpacity 
                        key={yStr} 
                        onPress={() => setSelectedYear(yStr)}
                        className={`py-3 rounded-lg mb-1 ${selectedYear === yStr ? 'bg-primary' : 'bg-gray-50'}`}
                      >
                        <Text className={`text-center font-bold ${selectedYear === yStr ? 'text-white' : 'text-gray-700'}`}>{yStr}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity onPress={onClose} className="flex-1 p-4 rounded-xl bg-gray-100 items-center">
              <Text className="font-bold text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => { onSelect(`${selectedMonth}/${selectedYear}`); onClose(); }} 
              className="flex-1 p-4 rounded-xl bg-primary items-center"
            >
              <Text className="font-bold text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function AccountsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // API hooks
  const { data: accounts, isLoading } = useAccounts();
  const addAccount = useAddAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [type, setType] = useState<'bank' | 'card'>('bank');
  const [name, setName] = useState('');
  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Picker State
  const [pickerVisible, setPickerVisible] = useState(false);

  // Filter accounts based on search query
  const filteredAccounts = accounts?.filter(account => 
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (account.account_number && account.account_number.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleAddOrEdit = () => {
    if (!name || !accountNumber) {
      Alert.alert('Error', 'Bank/Card name and number are required');
      return;
    }

    const payload = {
      type,
      name,
      holder_name: holderName,
      account_number: accountNumber,
      expiry_date: type === 'card' ? expiryDate : undefined
    };

    if (editingId) {
      updateAccount.mutate({ id: editingId, ...payload }, {
        onSuccess: () => closeModal(),
        onError: (err) => {
          console.error('Update failed', err);
          Alert.alert('Error', 'Failed to save account');
        }
      });
    } else {
      addAccount.mutate(payload, {
        onSuccess: () => closeModal(),
        onError: (err) => {
          console.error('Save failed', err);
          Alert.alert('Error', 'Failed to save account');
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Remove Account',
      'Are you sure you want to remove this account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => deleteAccount.mutate(id)
        }
      ]
    );
  };

  const openModalForAdd = () => {
    setEditingId(null);
    setType('bank');
    setName('');
    setHolderName('');
    setAccountNumber('');
    setExpiryDate('');
    setModalVisible(true);
  };

  const openModalForEdit = (account: any) => {
    setEditingId(account.id);
    // Coerce type strictly to bank or card
    setType(account.type === 'card' ? 'card' : 'bank');
    setName(account.name);
    setHolderName(account.holder_name || '');
    setAccountNumber(account.account_number || '');
    setExpiryDate(account.expiry_date || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-white">
      <Header title="My Accounts" showBack={true} />

      <View className="px-5 pt-4 pb-2">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search accounts..." 
        />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        {isLoading ? (
          <ActivityIndicator color="#6BCB77" className="mt-10" />
        ) : filteredAccounts.length > 0 ? (
          filteredAccounts.map(account => (
            <AccountCard 
              key={account.id} 
              account={account} 
              onDetails={(acc) => router.push(`/account/${acc.id}`)}
              onEdit={openModalForEdit}
              onCancel={(acc) => handleDelete(acc.id)}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center mt-20">
            <Ionicons name="wallet-outline" size={64} color="#CBD5E1" />
            <Text className="text-gray-400 font-medium mt-4 text-center">
              {searchQuery ? `No accounts found matching "${searchQuery}"` : "You haven't added any accounts yet."}
            </Text>
          </View>
        )}
      </ScrollView>

      <FloatingActionButton 
        label="Add Account" 
        onPress={openModalForAdd} 
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[85%] shadow-lg">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-extrabold text-gray-800">
                {editingId ? 'Edit Info' : 'Add New'}
              </Text>
              <TouchableOpacity onPress={closeModal} className="p-2 bg-gray-100 rounded-full">
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-gray-600 mb-2 font-semibold">Type</Text>
              <View className="flex-row mb-6">
                <TouchableOpacity 
                  onPress={() => setType('bank')}
                  className={`flex-1 p-3 items-center justify-center border border-gray-200 rounded-l-xl ${type === 'bank' ? 'bg-primary border-primary' : 'bg-gray-50'}`}
                >
                  <Text className={`font-bold ${type === 'bank' ? 'text-white' : 'text-gray-600'}`}>Bank Account</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setType('card')}
                  className={`flex-1 p-3 items-center justify-center border border-l-0 border-gray-200 rounded-r-xl ${type === 'card' ? 'bg-primary border-primary' : 'bg-gray-50'}`}
                >
                  <Text className={`font-bold ${type === 'card' ? 'text-white' : 'text-gray-600'}`}>Card</Text>
                </TouchableOpacity>
              </View>

              <Text className="text-gray-600 mb-2 font-semibold">{type === 'bank' ? 'Bank Name' : 'Card Name'}</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                placeholder={type === 'bank' ? "e.g. Chase" : "e.g. Amex Platinum"}
                value={name}
                onChangeText={setName}
              />

              <Text className="text-gray-600 mb-2 font-semibold">Account Holder Name</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                placeholder="Name exactly as it appears"
                value={holderName}
                onChangeText={setHolderName}
              />

              <Text className="text-gray-600 mb-2 font-semibold">{type === 'bank' ? 'Account Number' : 'Card Number'}</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-gray-800"
                placeholder="Full or Last 4 Digits"
                keyboardType="numeric"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />

              {type === 'card' && (
                <>
                  <Text className="text-gray-600 mb-2 font-semibold">Expiry Date (MM/YYYY)</Text>
                  <TouchableOpacity 
                    onPress={() => setPickerVisible(true)}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4"
                  >
                    <Text className={`text-base ${expiryDate ? 'text-gray-800' : 'text-gray-400'}`}>
                      {expiryDate || "Tap to select Expiry Date"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity 
                onPress={handleAddOrEdit}
                className="bg-primary rounded-2xl py-4 items-center shadow-sm shadow-primary/30 mt-4 mb-10"
                disabled={addAccount.isPending || updateAccount.isPending}
              >
                {addAccount.isPending || updateAccount.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-extrabold text-lg tracking-wide">
                    {editingId ? 'Save Changes' : 'Save'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CustomMonthYearPicker 
        visible={pickerVisible}
        currentDate={expiryDate}
        onClose={() => setPickerVisible(false)}
        onSelect={setExpiryDate}
      />
    </View>
  );
}
