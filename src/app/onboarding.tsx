import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useAuthStore } from "../store/authStore";
import {
  ONBOARDING_SLIDES,
  type OnboardingSlide,
} from "../constants/onboarding";

const { width } = Dimensions.get("window");

const DOT_SIZE = 6;
const ACTIVE_DOT_WIDTH = 24;

function AnimatedPageDot({ active }: { active: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(active ? ACTIVE_DOT_WIDTH : DOT_SIZE, { duration: 250 }),
    opacity: withTiming(active ? 1 : 0.35, { duration: 250 }),
  }));

  return (
    <Animated.View
      style={[
        {
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: "#159A1D",
          marginHorizontal: 3,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setHasSeenOnboarding } = useAuthStore();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<OnboardingSlide>>(null);

  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const handleFinish = async () => {
    await setHasSeenOnboarding(true);
    router.replace("/(auth)");
  };

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, ONBOARDING_SLIDES.length - 1));
      listRef.current?.scrollToOffset({ offset: clamped * width, animated: true });
      setIndex(clamped);
    },
    []
  );

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    },
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]" edges={["top", "bottom"]}>
      {/* Top Bar: Brand tag & Skip */}
      <View className="flex-row justify-between items-center px-6 pt-2 pb-2">
        <View className="flex-row items-center">
          <View className="w-2.5 h-2.5 rounded-full bg-[#159A1D] mr-2" />
          <Text className="text-xs font-black text-slate-800 tracking-wider">
            MONEY LOG
          </Text>
        </View>

        {!isLast && (
          <TouchableOpacity
            onPress={handleFinish}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            className="bg-slate-200/60 px-3 py-1 rounded-full"
          >
            <Text className="text-xs font-bold text-slate-600">Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES as OnboardingSlide[]}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 px-6 justify-between py-4">
            {/* Visual Image Card */}
            <View className="flex-1 max-h-[340px] rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-lg shadow-emerald-950/5 items-center justify-center">
              <Image
                source={item.image}
                className="w-full h-full"
                resizeMode="cover"
                accessible
                accessibilityLabel={item.title}
              />
            </View>

            {/* Typography Section */}
            <View className="mt-8 mb-4">
              <View className="self-start bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-full mb-3">
                <Text className="text-[10px] font-black text-[#159A1D] tracking-wider">
                  {item.badge}
                </Text>
              </View>
              <Text className="text-3xl font-black text-slate-900 tracking-tight leading-9">
                {item.title}
              </Text>
              <Text className="text-slate-500 text-sm font-medium leading-6 mt-2.5">
                {item.body}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Controls: Animated Dots & Navigation Buttons */}
      <View className="px-6 pb-6 pt-2">
        {/* Animated Page Dots */}
        <View className="flex-row items-center justify-center mb-6">
          {ONBOARDING_SLIDES.map((_, i) => (
            <AnimatedPageDot key={i} active={i === index} />
          ))}
        </View>

        {/* Action Row */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => goTo(index - 1)}
            disabled={index === 0}
            activeOpacity={0.7}
            className={`px-4 py-3 rounded-full ${index === 0 ? "opacity-0" : ""}`}
          >
            <Text className="text-sm font-bold text-slate-400">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => (isLast ? handleFinish() : goTo(index + 1))}
            activeOpacity={0.85}
            className="bg-[#159A1D] px-8 py-3.5 rounded-full flex-row items-center shadow-lg shadow-emerald-700/30"
          >
            <Text className="text-white font-extrabold text-sm tracking-wide mr-2">
              {isLast ? "Get Started" : "Next"}
            </Text>
            <Ionicons
              name={isLast ? "checkmark-circle" : "arrow-forward"}
              size={16}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
