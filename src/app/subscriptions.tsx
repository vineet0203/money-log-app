import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import SubscriptionCard from '../components/cards/SubscriptionCard';
import FloatingActionButton from '../components/common/FloatingActionButton';
import { Subscription } from '../types';
import { router } from 'expo-router';

const FULL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    price: 15.99,
    billingCycle: 'monthly',
    iconName: 'play',
    iconBgColor: 'bg-red-600',
    nextBillingDate: 'Oct 24'
  },
  {
    id: '2',
    name: 'Spotify',
    price: 9.99,
    billingCycle: 'monthly',
    iconName: 'musical-notes',
    iconBgColor: 'bg-green-500',
    nextBillingDate: 'Oct 28'
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    price: 54.99,
    billingCycle: 'monthly',
    iconName: 'color-palette',
    iconBgColor: 'bg-blue-600',
    nextBillingDate: 'Nov 02'
  },
  {
    id: '4',
    name: 'Amazon Prime',
    price: 139.00,
    billingCycle: 'yearly',
    iconName: 'cart',
    iconBgColor: 'bg-orange-500',
    nextBillingDate: 'Jan 15'
  },
  {
    id: '5',
    name: 'Gym Membership',
    price: 45.00,
    billingCycle: 'monthly',
    iconName: 'barbell',
    iconBgColor: 'bg-slate-800',
    nextBillingDate: 'Oct 31'
  },
  {
    id: '6',
    name: 'GitHub Copilot',
    price: 10.00,
    billingCycle: 'monthly',
    iconName: 'code-slash',
    iconBgColor: 'bg-purple-600',
    nextBillingDate: 'Nov 05'
  },
  {
    id: '7',
    name: 'Hulu',
    price: 7.99,
    billingCycle: 'monthly',
    iconName: 'tv',
    iconBgColor: 'bg-green-600',
    nextBillingDate: 'Oct 20'
  },
  {
    id: '8',
    name: 'Disney+',
    price: 13.99,
    billingCycle: 'monthly',
    iconName: 'film',
    iconBgColor: 'bg-blue-800',
    nextBillingDate: 'Oct 25'
  },
  {
    id: '9',
    name: 'YouTube Premium',
    price: 13.99,
    billingCycle: 'monthly',
    iconName: 'logo-youtube',
    iconBgColor: 'bg-red-500',
    nextBillingDate: 'Nov 01'
  },
  {
    id: '10',
    name: 'Xbox Game Pass',
    price: 16.99,
    billingCycle: 'monthly',
    iconName: 'game-controller',
    iconBgColor: 'bg-green-700',
    nextBillingDate: 'Nov 12'
  },
  {
    id: '11',
    name: 'Notion Plus',
    price: 96.00,
    billingCycle: 'yearly',
    iconName: 'document-text',
    iconBgColor: 'bg-slate-900',
    nextBillingDate: 'Jan 05'
  },
  {
    id: '12',
    name: 'Figma Professional',
    price: 144.00,
    billingCycle: 'yearly',
    iconName: 'color-filter',
    iconBgColor: 'bg-pink-500',
    nextBillingDate: 'Mar 15'
  },
  {
    id: '13',
    name: 'ChatGPT Plus',
    price: 20.00,
    billingCycle: 'monthly',
    iconName: 'chatbubbles',
    iconBgColor: 'bg-emerald-600',
    nextBillingDate: 'Oct 22'
  },
  {
    id: '14',
    name: '1Password',
    price: 35.88,
    billingCycle: 'yearly',
    iconName: 'key',
    iconBgColor: 'bg-blue-500',
    nextBillingDate: 'Dec 01'
  },
  {
    id: '15',
    name: 'Apple iCloud+',
    price: 2.99,
    billingCycle: 'monthly',
    iconName: 'cloud',
    iconBgColor: 'bg-sky-400',
    nextBillingDate: 'Oct 29'
  },
  {
    id: '16',
    name: 'Slack Pro',
    price: 8.75,
    billingCycle: 'monthly',
    iconName: 'chatbox-ellipses',
    iconBgColor: 'bg-indigo-600',
    nextBillingDate: 'Nov 10'
  }
];

export default function SubscriptionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter subscriptions based on search query
  const filteredSubscriptions = FULL_SUBSCRIPTIONS.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      <Header title="Subscriptions" showBack={true} />

      {/* Search Bar */}
      <View className="px-5 pt-4 pb-2">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Search subscriptions..." 
        />
      </View>

      {/* Subscriptions List */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      >
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map(sub => (
            <SubscriptionCard 
              key={sub.id} 
              subscription={sub} 
              onPress={(s) => router.push(`/subscription/${s.id}`)}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center mt-20">
            <Ionicons name="search-outline" size={64} color="#CBD5E1" />
            <Text className="text-textMuted font-medium mt-4 text-center">
              No subscriptions found matching "{searchQuery}"
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingActionButton 
        label="Add Subscription" 
        onPress={() => console.log('Add Subscription')} 
      />
    </View>
  );
}
