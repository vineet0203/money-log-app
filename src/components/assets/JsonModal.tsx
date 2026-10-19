import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { useGetAssetReportDetails } from '../../api/plaid';

export default function JsonModal({ reportId, onClose }: { reportId: string | null; onClose: () => void }) {
  const { data, isLoading, error } = useGetAssetReportDetails(reportId);

  const handleCopy = async () => {
    if (data?.report) {
      await Clipboard.setStringAsync(JSON.stringify(data.report, null, 2));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'JSON copied to clipboard!',
      });
    }
  };

  return (
    <Modal visible={!!reportId} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center pt-20">
        <View className="flex-1 bg-slate-50 rounded-t-3xl overflow-hidden shadow-2xl">
          <View className="flex-row justify-between items-center p-5 bg-white border-b border-slate-100">
            <Text className="text-lg font-bold text-slate-800">Asset Report JSON</Text>
            <View className="flex-row items-center">
              {data?.report && (
                <TouchableOpacity onPress={handleCopy} className="mr-4 flex-row items-center bg-slate-100 px-3 py-1.5 rounded-lg">
                  <Ionicons name="copy-outline" size={16} color="#64748B" />
                  <Text className="text-xs font-bold text-slate-600 ml-1">Copy</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} className="p-1">
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView className="flex-1 p-5">
            {isLoading ? (
              <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
            ) : error ? (
              <Text className="text-red-500 font-medium text-center mt-10">Failed to load report. It may still be generating.</Text>
            ) : data?.status === 'pending' ? (
              <Text className="text-amber-600 font-medium text-center mt-10">{data.message}</Text>
            ) : (
              <Text className="text-xs text-slate-700 font-mono">
                {JSON.stringify(data?.report, null, 2)}
              </Text>
            )}
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
