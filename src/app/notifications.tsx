import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsInbox() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const notifications = [
    {
      id: 1,
      title: "Payment Successful",
      description: "You paid $45.00 to Alex for Dinner.",
      time: "2 hours ago",
      icon: "checkmark-circle",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      unread: true,
    },
    {
      id: 2,
      title: "Upcoming Bill Reminder",
      description: "Netflix subscription ($15.99) is due tomorrow.",
      time: "5 hours ago",
      icon: "calendar",
      color: "text-amber-500",
      bg: "bg-amber-50",
      unread: true,
    },
    {
      id: 3,
      title: "Security Alert",
      description: "New login detected from Mac OS device.",
      time: "Yesterday",
      icon: "shield-checkmark",
      color: "text-blue-500",
      bg: "bg-blue-50",
      unread: false,
    },
    {
      id: 4,
      title: "New Feature Available!",
      description: "Check out the new Budgeting tool in your dashboard.",
      time: "2 days ago",
      icon: "sparkles",
      color: "text-purple-500",
      bg: "bg-purple-50",
      unread: false,
    }
  ];

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View 
        style={{ paddingTop: insets.top + 16 }} 
        className="flex-row items-center justify-between px-5 pb-4 bg-white shadow-sm shadow-slate-100 z-10 border-b border-slate-100"
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
        >
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
        
        <Text className="font-bold text-lg text-slate-800">Notifications</Text>
        
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Ionicons name="checkmark-done-outline" size={24} color="#6BCB77" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        
        {notifications.map((notif) => (
          <TouchableOpacity 
            key={notif.id} 
            className={`flex-row items-start p-5 rounded-2xl mb-3 border ${notif.unread ? 'bg-white border-blue-100 shadow-sm shadow-blue-50' : 'bg-slate-50 border-slate-100'}`}
          >
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${notif.bg}`}>
              <Ionicons name={notif.icon as any} size={24} className={notif.color} />
            </View>
            
            <View className="flex-1">
              <View className="flex-row justify-between items-start mb-1">
                <Text className={`font-bold text-base ${notif.unread ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</Text>
                {notif.unread && <View className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5" />}
              </View>
              <Text className={`mb-2 leading-5 ${notif.unread ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                {notif.description}
              </Text>
              <Text className="text-slate-400 text-xs font-medium">{notif.time}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
