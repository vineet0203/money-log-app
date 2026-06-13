import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpSupport() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const faqs = [
    { q: "How do I add a new bank account?", a: "Go to the Accounts tab and tap the 'Add New Account' button at the bottom." },
    { q: "Is my data secure?", a: "Yes! We use 256-bit encryption to ensure your financial data is fully protected." },
    { q: "How do I export my transactions?", a: "Tap on any account, tap the 'Export' icon in the top right, and select your date range." },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <View 
        style={{ paddingTop: insets.top + 16 }} 
        className="flex-row items-center justify-between px-5 pb-4 bg-white shadow-sm shadow-slate-100 z-10 border-b border-slate-100"
      >
        <TouchableOpacity 
          onPress={() => router.navigate('/more')}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        
        <Text className="font-bold text-lg text-slate-800">Help & Support</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        
        <Text className="text-slate-800 font-bold text-2xl mb-6">How can we help you?</Text>

        <TouchableOpacity className="bg-primary p-6 rounded-3xl mb-8 shadow-lg shadow-primary/30 flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-white font-bold text-lg mb-1">Contact Support</Text>
            <Text className="text-blue-100">Our team usually responds within 2 hours.</Text>
          </View>
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="chatbubbles" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>

        <Text className="text-slate-500 font-bold text-sm tracking-wider uppercase mb-4 ml-1">Frequently Asked Questions</Text>
        
        {faqs.map((faq, index) => (
          <View key={index} className="bg-white p-5 rounded-2xl mb-4 shadow-sm shadow-slate-100 border border-slate-50">
            <Text className="text-slate-800 font-bold text-base mb-2">{faq.q}</Text>
            <Text className="text-slate-500 leading-5">{faq.a}</Text>
          </View>
        ))}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
