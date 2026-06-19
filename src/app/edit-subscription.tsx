import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Header from '../components/common/Header';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';

export default function EditSubscriptionScreen() {
  const params = useLocalSearchParams();

  const initialValues = {
    id: params.id ? parseInt(params.id as string) : undefined,
    name: params.name as string,
    amount: params.amount as string,
    billingCycle: (params.billingCycle as any) || 'monthly',
    startDate: params.startDate as string,
    categoryId: params.categoryId ? parseInt(params.categoryId as string) : null,
  };

  return (
    <View className="flex-1 bg-white">
      <Header title="Edit Subscription" showBack={true} />
      <SubscriptionForm initialValues={initialValues} />
    </View>
  );
}
