import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Header from '../components/common/Header';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';

export default function AddSubscriptionScreen() {
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const initialValues = isEditing ? {
    id: params.id ? Number(params.id) : undefined,
    name: params.name as string,
    amount: params.amount as string,
    billingCycle: params.billingCycle as 'monthly' | 'yearly',
    startDate: params.startDate as string,
    categoryId: params.categoryId ? Number(params.categoryId) : null,
  } : undefined;

  return (
    <View className="flex-1 bg-white">
      <Header title={isEditing ? "Edit Subscription" : "Add Subscription"} showBack={true} />
      <SubscriptionForm initialValues={initialValues} />
    </View>
  );
}
