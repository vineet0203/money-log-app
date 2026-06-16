import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { Category } from '../types';

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', iconName: 'fast-food', color: '#F97316', budgetLimit: 600 },
  { id: '2', name: 'Housing', iconName: 'home', color: '#3B82F6', budgetLimit: 2000 },
  { id: '3', name: 'Transportation', iconName: 'car', color: '#A855F7', budgetLimit: 300 },
  { id: '4', name: 'Entertainment', iconName: 'game-controller', color: '#10B981', budgetLimit: 150 },
];

const AVAILABLE_COLORS = ['#F97316', '#3B82F6', '#A855F7', '#10B981', '#EF4444', '#EAB308', '#06B6D4', '#EC4899'];
const AVAILABLE_ICONS = ['fast-food', 'home', 'car', 'game-controller', 'cart', 'airplane', 'fitness', 'medical', 'book', 'cafe'];

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formColor, setFormColor] = useState(AVAILABLE_COLORS[0]);
  const [formIcon, setFormIcon] = useState(AVAILABLE_ICONS[0]);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormBudget('');
    setFormColor(AVAILABLE_COLORS[0]);
    setFormIcon(AVAILABLE_ICONS[0]);
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormBudget(category.budgetLimit ? category.budgetLimit.toString() : '');
    setFormColor(category.color);
    setFormIcon(category.iconName as any);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const parsedBudget = formBudget ? parseFloat(formBudget) : undefined;

    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? {
        ...c, name: formName, color: formColor, iconName: formIcon as any, budgetLimit: parsedBudget
      } : c));
    } else {
      setCategories(prev => [...prev, {
        id: Date.now().toString(),
        name: formName,
        color: formColor,
        iconName: formIcon as any,
        budgetLimit: parsedBudget
      }]);
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        setCategories(prev => prev.filter(c => c.id !== id));
      }}
    ]);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Categories & Budgets" showBack={true} />

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {categories.map(category => (
          <View key={category.id} className="flex-row items-center bg-white p-4 rounded-3xl mb-3 shadow-sm shadow-slate-100 border border-slate-100">
            
            <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: category.color + '20' }}>
              <Ionicons name={category.iconName} size={24} color={category.color} />
            </View>
            
            <View className="flex-1 justify-center">
              <Text className="text-base font-extrabold text-slate-800">{category.name}</Text>
              {category.budgetLimit ? (
                <Text className="text-xs font-bold text-slate-500 mt-1">Budget: ${category.budgetLimit.toFixed(2)}/mo</Text>
              ) : (
                <Text className="text-xs font-medium text-slate-400 mt-1">No budget set</Text>
              )}
            </View>

            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center bg-slate-50 rounded-full mr-2"
              onPress={() => openEditModal(category)}
            >
              <Ionicons name="pencil" size={18} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center bg-red-50 rounded-full"
              onPress={() => handleDelete(category.id)}
            >
              <Ionicons name="trash" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <FloatingActionButton onPress={openAddModal} label="New Category" />

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-white pt-6">
          <View className="flex-row items-center justify-between px-5 pb-4 border-b border-slate-100 mb-6">
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text className="text-slate-500 font-bold text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-extrabold text-slate-800">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-primary font-bold text-base">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            {/* Name Input */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Category Name</Text>
            <View className="bg-slate-50 rounded-2xl border border-slate-100 px-4 py-4 mb-5">
              <TextInput 
                value={formName}
                onChangeText={setFormName}
                placeholder="e.g. Groceries"
                placeholderTextColor="#94A3B8"
                className="text-base font-bold text-slate-800"
                autoFocus={!editingCategory}
              />
            </View>

            {/* Budget Input */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Monthly Budget (Optional)</Text>
            <View className="flex-row items-center bg-slate-50 rounded-2xl border border-slate-100 px-4 py-4 mb-6">
              <Text className="text-base font-extrabold text-slate-800 mr-1">$</Text>
              <TextInput 
                value={formBudget}
                onChangeText={setFormBudget}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                className="text-base font-bold text-slate-800 flex-1"
              />
            </View>

            {/* Color Picker */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Color Theme</Text>
            <View className="flex-row flex-wrap mb-6">
              {AVAILABLE_COLORS.map(color => (
                <TouchableOpacity 
                  key={color} 
                  onPress={() => setFormColor(color)}
                  className="w-12 h-12 rounded-full items-center justify-center mr-3 mb-3"
                  style={{ backgroundColor: color, borderWidth: formColor === color ? 3 : 0, borderColor: '#1E293B' }}
                >
                  {formColor === color && <Ionicons name="checkmark" size={24} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Icon Picker */}
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Select Icon</Text>
            <View className="flex-row flex-wrap">
              {AVAILABLE_ICONS.map(icon => (
                <TouchableOpacity 
                  key={icon} 
                  onPress={() => setFormIcon(icon)}
                  className={`w-14 h-14 rounded-2xl items-center justify-center mr-3 mb-3 ${formIcon === icon ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'}`}
                >
                  <Ionicons name={icon as any} size={28} color={formIcon === icon ? '#FFF' : '#64748B'} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
