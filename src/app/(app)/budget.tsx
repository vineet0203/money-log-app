import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../store/dataStore';
import Header from '../../components/common/Header';

export default function Budget() {
  const budgets = useDataStore((state) => state.budgets);
  const setBudgets = useDataStore((state) => state.setBudgets);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const totalLimit = budgets.reduce((acc, curr) => acc + curr.limit, 0);
  const totalPercentage = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  const handleUpdateLimit = (id: number, text: string) => {
    const num = parseInt(text) || 0;
    setBudgets(budgets.map(b => b.id === id ? { ...b, limit: num } : b));
  };

  const handleUpdateCategory = (id: number, text: string) => {
    setBudgets(budgets.map(b => b.id === id ? { ...b, category: text } : b));
  };

  const handleRemoveCategory = (id: number) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const handleAddCategory = () => {
    const newId = Math.max(...budgets.map(b => b.id), 0) + 1;
    setBudgets([...budgets, {
      id: newId,
      category: 'New Category',
      spent: 0,
      limit: 100,
      icon: 'star',
      bg: 'bg-purple-50',
      color: '#A855F7'
    }]);
  };

  return (
    <View className="flex-1 bg-background">
      <Header title="Budget" />
      
      {/* Main Budget Area */}
      <View className="px-5 pb-6 bg-white shadow-sm shadow-slate-100 z-10 border-b border-slate-100 pt-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-text">Overview</Text>
          <View className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <Ionicons name="calendar-outline" size={16} color="#64748B" />
            <Text className="text-textMuted font-semibold ml-2">October 2024</Text>
          </View>
        </View>

        {/* Overview Card - Light Theme */}
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200 relative overflow-hidden mt-2 border border-slate-100">
          <View className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mt-10 -mr-10 blur-2xl" />
          
          <Text className="text-textMuted font-medium text-sm mb-1 uppercase tracking-wider">Total Spent</Text>
          <View className="flex-row items-end mb-6">
            <Text className="text-4xl font-extrabold text-text tracking-tight">${totalSpent.toLocaleString()}</Text>
            <Text className="text-textMuted font-medium ml-2 mb-1">/ ${totalLimit.toLocaleString()}</Text>
          </View>

          {/* Master Progress Bar */}
          <View className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
            <View 
              className={`h-full rounded-full ${totalPercentage > 90 ? 'bg-red-500' : 'bg-primary'}`} 
              style={{ width: `${totalPercentage}%` }} 
            />
          </View>
          <Text className="text-textMuted text-xs font-medium text-right">{totalPercentage.toFixed(0)}% Used</Text>
        </View>
      </View>

      {/* Categories List */}
      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-lg font-bold text-text">Category Breakdown</Text>
          <TouchableOpacity onPress={() => setEditModalVisible(true)}>
            <Text className="text-primary font-semibold">Edit Limits</Text>
          </TouchableOpacity>
        </View>

        {budgets.length === 0 ? (
          <View className="items-center justify-center py-10">
            <Text className="text-slate-400 font-medium">No budget categories set.</Text>
          </View>
        ) : (
          budgets.map((item) => {
            const percentage = item.limit > 0 ? (item.spent / item.limit) * 100 : 0;
            let progressColor = 'bg-primary';
            let textColor = 'text-primary';
            
            if (percentage >= 100) {
              progressColor = 'bg-red-500';
              textColor = 'text-red-500';
            } else if (percentage >= 80) {
              progressColor = 'bg-amber-500';
              textColor = 'text-amber-500';
            }

            return (
              <View key={item.id} className="bg-white p-5 rounded-3xl mb-4 shadow-sm shadow-slate-100 border border-slate-50">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className={`w-12 h-12 ${item.bg} rounded-2xl items-center justify-center mr-4 border border-slate-50`}>
                      <Ionicons name={item.icon as any} size={22} color={item.color} />
                    </View>
                    <View>
                      <Text className="text-text font-bold text-base mb-0.5">{item.category}</Text>
                      <Text className="text-textMuted text-xs font-medium">${item.limit.toLocaleString()} Limit</Text>
                    </View>
                  </View>
                  <Text className={`font-bold text-base ${percentage >= 100 ? 'text-red-500' : 'text-text'}`}>
                    ${item.spent.toLocaleString()}
                  </Text>
                </View>

                {/* Mini Progress Bar */}
                <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <View 
                    className={`h-full rounded-full ${progressColor}`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }} 
                  />
                </View>
                
                {percentage >= 100 && (
                  <Text className="text-red-500 text-xs font-semibold mt-2 text-right">Limit Exceeded</Text>
                )}
              </View>
            );
          })
        )}
        
        <View className="h-10" />
      </ScrollView>

      {/* Edit Limits Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-black/40 justify-end"
        >
          <Pressable className="flex-1" onPress={() => setEditModalVisible(false)} />
          <View className="bg-white rounded-t-3xl p-6 shadow-2xl h-[85%]">
            <View className="w-12 h-1 bg-slate-200 rounded-full self-center mb-6" />
            
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-slate-800">Edit Budget</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {budgets.map((item) => (
                <View key={item.id} className="mb-6 flex-row items-center">
                  <View className={`w-12 h-12 ${item.bg} rounded-2xl items-center justify-center mr-3 border border-slate-50`}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  
                  <View className="flex-1 mr-3">
                    <TextInput 
                      className="text-slate-600 font-medium mb-2 border-b border-slate-200 pb-1"
                      value={item.category}
                      onChangeText={(text) => handleUpdateCategory(item.id, text)}
                      placeholder="Category Name"
                    />
                    <View className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-row items-center">
                      <Text className="text-slate-400 font-bold mr-1">$</Text>
                      <TextInput 
                        className="flex-1 text-slate-800 font-bold text-sm"
                        value={item.limit.toString()}
                        onChangeText={(text) => handleUpdateLimit(item.id, text)}
                        keyboardType="numeric"
                        returnKeyType="done"
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => handleRemoveCategory(item.id)}
                    className="w-10 h-10 items-center justify-center rounded-full bg-red-50 border border-red-100"
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity 
                onPress={handleAddCategory}
                className="flex-row items-center justify-center py-4 border-2 border-dashed border-slate-200 rounded-2xl mb-10"
              >
                <Ionicons name="add" size={20} color="#64748B" />
                <Text className="text-slate-500 font-semibold ml-2">Add New Category</Text>
              </TouchableOpacity>
            </ScrollView>

            <View className="pt-4 border-t border-slate-100">
              <TouchableOpacity 
                className="bg-primary shadow-lg shadow-primary/30 py-4 rounded-2xl items-center"
                onPress={() => setEditModalVisible(false)}
              >
                <Text className="text-white font-bold text-lg">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
