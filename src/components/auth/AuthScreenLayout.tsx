import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const { height } = Dimensions.get("window");

interface AuthScreenLayoutProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actionTitle: string;
  actionSubtitle?: React.ReactNode;
  onAction: () => void;
  loading?: boolean;
  disableAction?: boolean;
  children: React.ReactNode;
  topCustomContent?: React.ReactNode;
}

export default function AuthScreenLayout({
  title,
  subtitle,
  showBack = false,
  onBack,
  actionTitle,
  actionSubtitle,
  onAction,
  loading = false,
  disableAction = false,
  children,
  topCustomContent,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#159A1D]">
      <StatusBar style="light" />

      {/* 1. Brand Green Gradient Background (Extends behind the white sheet so no corner gaps occur) */}
      <LinearGradient
        colors={["#18A822", "#159A1D", "#118018"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: height * 0.45,
        }}
      />

      {/* Decorative Geometric Overlay Rings in Background */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -40,
          right: -30,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderWidth: 1.5,
          borderColor: "rgba(255, 255, 255, 0.12)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 40,
          left: -40,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderWidth: 1.5,
          borderColor: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 140,
          right: 30,
          width: 130,
          height: 130,
          borderRadius: 65,
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      />

      {/* Header Content with SafeAreaView */}
      <SafeAreaView edges={["top"]}>
        {/* Top Bar with Back Button */}
        <View className="px-5 pt-2 h-11 flex-row items-center justify-between">
          {showBack ? (
            <TouchableOpacity
              onPress={onBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
              className="flex-row items-center bg-white/20 px-3.5 py-1.5 rounded-full border border-white/25"
            >
              <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs ml-1.5">Back</Text>
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
          <View className="w-10" />
        </View>

        {/* Centered Brand Stack: M Logo (Inverted White) -> Text Logo Below (Inverted White) -> Tagline */}
        {topCustomContent || (
          <View className="items-center justify-center pt-2 pb-6 px-6">
            {/* Inverted white M Logo directly on brand green */}
            <Image
              source={require("../../../assets/images/logo.png")}
              style={{ width: 54, height: 54, marginBottom: 10 }}
              resizeMode="contain"
              tintColor="#FFFFFF"
              accessible
              accessibilityLabel="Money Log M Logo"
            />

            {/* Inverted white Text Logo below M Logo */}
            <Image
              source={require("../../../assets/images/logo_text.png")}
              style={{ width: 145, height: 29 }}
              resizeMode="contain"
              tintColor="#FFFFFF"
              accessible
              accessibilityLabel="Money Log"
            />

            {/* Tagline */}
            <Text className="text-white/90 text-xs font-semibold mt-2.5 tracking-wide text-center">
              Track Money • Manage Life • Build Wealth
            </Text>
          </View>
        )}
      </SafeAreaView>

      {/* 2. Sliding White Container (Clean White Sheet with rounded-t-[36px], sitting seamlessly on the green background) */}
      <View className="flex-1 bg-white rounded-t-[36px] shadow-2xl overflow-hidden">
        <KeyboardAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingHorizontal: 26,
            paddingTop: 28,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={Platform.OS === "ios" ? 24 : 0}
        >
          {/* Upper Section: Title + Form Children */}
          <View>
            {/* Title & Subtitle */}
            <View className="mb-6">
              <Text className="text-2xl font-black text-slate-900 tracking-tight">
                {title}
              </Text>
              {subtitle ? (
                <Text className="text-slate-500 text-xs font-medium mt-1 leading-5">
                  {subtitle}
                </Text>
              ) : null}
            </View>

            {/* Injected Form Inputs */}
            {children}
          </View>

          {/* Lower Section: Full-Width Prominent Button & Subtitle */}
          <View className="pt-6 mt-4">
            <TouchableOpacity
              onPress={onAction}
              disabled={loading || disableAction}
              activeOpacity={0.85}
              className={`w-full h-14 rounded-2xl bg-[#159A1D] items-center justify-center shadow-lg shadow-emerald-800/30 ${
                loading || disableAction ? "opacity-60" : ""
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white font-extrabold text-base tracking-wide">
                  {actionTitle}
                </Text>
              )}
            </TouchableOpacity>

            {actionSubtitle ? (
              <View className="items-center justify-center mt-4">
                {actionSubtitle}
              </View>
            ) : null}
          </View>
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
}
