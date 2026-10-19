import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Header from '../../components/common/Header';
import { useGetAssetReports, useSyncAssets } from '../../api/plaid';
import JsonModal from '../../components/assets/JsonModal';

const DAYS_OPTIONS = [30, 60, 90, 120, 150, 365];

export default function AssetsScreen() {
  const router = useRouter();
  const { data: reportsResponse, isLoading: isLoadingReports } = useGetAssetReports();
  const syncAssets = useSyncAssets();
  const reports = reportsResponse?.data || [];

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  // Days Selector State
  const [daysRequested, setDaysRequested] = useState<number>(90);
  const [showDaysModal, setShowDaysModal] = useState(false);

  const handleGenerateReport = () => {
    syncAssets.mutate({ days_requested: daysRequested }, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Asset report generation started!',
        });
      },
      onError: (err: any) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: err?.response?.data?.error || 'Failed to sync assets',
        });
      }
    });
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <Header title="Assets & Net Worth" showBack={true} />

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        
        {/* Top Action Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-100 border border-slate-100 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="document-text" size={24} color="#4F46E5" className="mr-2" />
            <Text className="text-lg font-extrabold text-slate-800">Generate New Report</Text>
          </View>
          <Text className="text-sm text-slate-500 mb-6 leading-tight">
            Pull the latest asset data from all connected institutions.
          </Text>

          {/* Days Selector Button */}
          <TouchableOpacity 
            onPress={() => setShowDaysModal(true)}
            className="flex-row items-center justify-between border border-slate-200 rounded-xl p-4 mb-4 bg-slate-50"
          >
            <Text className="text-slate-700 font-bold">History: {daysRequested} Days</Text>
            <Ionicons name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleGenerateReport}
            disabled={syncAssets.isPending}
            className={`flex-row items-center justify-center p-4 rounded-xl ${syncAssets.isPending ? 'bg-indigo-300' : 'bg-indigo-600'}`}
          >
            {syncAssets.isPending ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : (
              <Ionicons name="refresh" size={20} color="white" className="mr-2" />
            )}
            <Text className="text-white font-bold text-base">Generate Report</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-extrabold text-slate-800 mb-4 px-1 uppercase tracking-wider">Generated Reports</Text>

        {isLoadingReports ? (
          <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
        ) : reports.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center justify-center border border-slate-200 border-dashed">
            <Ionicons name="folder-open-outline" size={48} color="#CBD5E1" />
            <Text className="text-slate-400 font-medium text-center mt-3">No asset reports generated yet.</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">Tap 'Generate Report' above.</Text>
          </View>
        ) : (
          <View className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-10">
            {reports.map((report: any, i: number) => {
              const isReady = report.status === 'ready';
              const isPending = report.status === 'pending';
              
              return (
                <TouchableOpacity 
                  key={report.asset_report_id} 
                  className={`p-5 ${i !== reports.length - 1 ? 'border-b border-slate-100' : ''}`}
                  onPress={() => isReady ? router.push(`/assets/${report.asset_report_id}`) : Toast.show({ type: 'info', text1: 'Not Ready', text2: 'This report is still generating.' })}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
                        {report.asset_report_id.substring(0, 12)}...
                      </Text>
                      <Text className="text-xs font-medium text-slate-400 mt-2">
                        {new Date(report.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-md ${isReady ? 'bg-emerald-100' : isPending ? 'bg-amber-100' : 'bg-red-100'}`}>
                      <Text className={`text-[10px] font-bold uppercase tracking-wider ${isReady ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-red-700'}`}>
                        {report.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-end mt-4">
                    <TouchableOpacity 
                      onPress={() => setSelectedReportId(report.asset_report_id)}
                      className="flex-row items-center bg-indigo-50 px-4 py-2 rounded-xl"
                    >
                      <Ionicons name="eye" size={16} color="#4F46E5" />
                      <Text className="text-indigo-600 font-bold text-sm ml-2">JSON</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Days Selector Modal */}
      <Modal visible={showDaysModal} transparent={true} animationType="fade">
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} 
          activeOpacity={1} 
          onPress={() => setShowDaysModal(false)}
        >
          <View className="bg-white rounded-t-3xl overflow-hidden pb-8">
            <View className="flex-row justify-between items-center p-5 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-800">Select History Days</Text>
              <TouchableOpacity onPress={() => setShowDaysModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            {DAYS_OPTIONS.map((days) => (
              <TouchableOpacity 
                key={days}
                onPress={() => {
                  setDaysRequested(days);
                  setShowDaysModal(false);
                }}
                className={`p-5 border-b border-slate-50 flex-row justify-between items-center ${daysRequested === days ? 'bg-indigo-50' : ''}`}
              >
                <Text className={`text-base font-semibold ${daysRequested === days ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {days} Days
                </Text>
                {daysRequested === days && (
                  <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <JsonModal reportId={selectedReportId} onClose={() => setSelectedReportId(null)} />
    </View>
  );
}
