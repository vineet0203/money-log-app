import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";

function PulseDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420 }),
          withTiming(0.25, { duration: 420 })
        ),
        -1,
        false
      )
    );
  }, [delay, opacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: "#159A1D",
          marginHorizontal: 3,
        },
        dotStyle,
      ]}
    />
  );
}

export default function SplashScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(0.85);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    });
  }, [scale]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Logo aspect ratio is 998:195 (~5.118:1)
  const logoWidth = Math.min(width * 0.65, 260);
  const logoHeight = logoWidth / 5.118;

  return (
    <View style={styles.container}>
      {/* Light Theme Background Gradient */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC", "#F0FDF4"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Atmospheric Soft Emerald Depth Orbs */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: width * 1.5,
          height: width * 1.5,
          borderRadius: (width * 1.5) / 2,
          backgroundColor: "rgba(21, 154, 29, 0.04)",
          top: -width * 0.85,
          right: -width * 0.45,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: width * 1.3,
          height: width * 1.3,
          borderRadius: (width * 1.3) / 2,
          backgroundColor: "rgba(21, 154, 29, 0.03)",
          bottom: -width * 0.7,
          left: -width * 0.4,
        }}
      />

      {/* Main Center Content */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Only Logo Text (text icon) with Spring Animation */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={logoAnimatedStyle}
          className="items-center justify-center"
        >
          <Image
            source={require("../../assets/images/logo_text.png")}
            style={{ width: logoWidth, height: logoHeight }}
            resizeMode="contain"
            accessible
            accessibilityLabel="Money Log logo"
          />
        </Animated.View>

        {/* Subtle Hairline Divider */}
        <Animated.View
          entering={FadeIn.delay(280).duration(400)}
          className="mt-6 h-[1.5px] w-12 bg-slate-200 rounded-full"
        />

        {/* Tagline */}
        <Animated.Text
          entering={FadeInDown.delay(360).duration(460)}
          className="text-center text-xs font-semibold text-slate-500 mt-4 tracking-wide"
          style={{ maxWidth: 260 }}
        >
          Track Money • Manage Life • Build Wealth
        </Animated.Text>
      </View>

      {/* Footer Branding & Loading Dots */}
      <Animated.View
        entering={FadeIn.delay(500).duration(500)}
        className="items-center pb-10"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 24 }}
      >
        <View className="flex-row items-center justify-center mb-3">
          <PulseDot delay={0} />
          <PulseDot delay={180} />
          <PulseDot delay={360} />
        </View>
        <Text className="text-[10px] font-bold text-slate-400 tracking-[0.22em] uppercase">
          Personal Wealth Platform
        </Text>
      </Animated.View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
