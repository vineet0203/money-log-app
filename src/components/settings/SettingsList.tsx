import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SettingItem = {
  id: string;
  icon: any;
  title: string;
  type: 'link' | 'toggle';
  value?: boolean;
  color?: string;
};

type SettingsGroupProps = {
  title: string;
  items: SettingItem[];
};

export default function SettingsList({ title, items }: SettingsGroupProps) {
  return (
    <View className="mb-8">
      <Text className="text-sm font-bold text-textMuted mb-3 px-3 uppercase tracking-widest">{title}</Text>
      <View className="bg-white rounded-3xl shadow-sm shadow-slate-100 overflow-hidden border border-slate-50">
        {items.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity 
              disabled={item.type === 'toggle'}
              className="flex-row items-center p-4"
            >
              <View className={`w-10 h-10 rounded-xl ${item.color || 'bg-slate-100'} items-center justify-center mr-4`}>
                <Ionicons name={item.icon} size={20} color="#FFF" />
              </View>
              <Text className="flex-1 text-text font-bold text-base">{item.title}</Text>
              
              {item.type === 'link' ? (
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              ) : (
                <Switch 
                  value={item.value} 
                  trackColor={{ false: '#E2E8F0', true: '#6BCB77' }}
                  thumbColor="#FFF"
                />
              )}
            </TouchableOpacity>
            {index < items.length - 1 && (
              <View className="h-[1px] bg-slate-50 ml-16" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
