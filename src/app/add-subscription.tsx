import React from 'react';
import { View } from 'react-native';
import Header from '../components/common/Header';
import SubscriptionForm from '../components/subscriptions/SubscriptionForm';

export default function AddSubscriptionScreen() {
  return (
    <View className="flex-1 bg-white">
      <Header title="Add Subscription" showBack={true} />
      <SubscriptionForm />
    </View>
  );
}
