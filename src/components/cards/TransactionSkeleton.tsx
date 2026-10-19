import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export function TransactionCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className="bg-white rounded-2xl p-4 mb-2.5 border border-slate-100 flex-row items-center justify-between shadow-xs"
    >
      <View className="flex-row items-center flex-1">
        {/* Icon Skeleton */}
        <View className="w-12 h-12 rounded-2xl bg-slate-200 mr-3.5" />

        {/* Text Skeleton */}
        <View className="flex-1 pr-3">
          <View className="w-32 h-4 bg-slate-200 rounded-md mb-2" />
          <View className="w-20 h-3 bg-slate-100 rounded-md" />
        </View>
      </View>

      {/* Amount Skeleton */}
      <View className="items-end">
        <View className="w-16 h-5 bg-slate-200 rounded-md mb-1.5" />
        <View className="w-10 h-3 bg-slate-100 rounded-md" />
      </View>
    </Animated.View>
  );
}

export function TransactionListSkeleton() {
  return (
    <View className="px-5 pt-3">
      {/* Date Header Skeleton */}
      <View className="flex-row justify-between items-center mb-2.5 mt-2 px-1">
        <View className="w-28 h-4 bg-slate-200 rounded-md" />
        <View className="w-14 h-4 bg-slate-100 rounded-full" />
      </View>
      <TransactionCardSkeleton />
      <TransactionCardSkeleton />

      {/* Next Date Header Skeleton */}
      <View className="flex-row justify-between items-center mb-2.5 mt-4 px-1">
        <View className="w-24 h-4 bg-slate-200 rounded-md" />
        <View className="w-14 h-4 bg-slate-100 rounded-full" />
      </View>
      <TransactionCardSkeleton />
      <TransactionCardSkeleton />
      <TransactionCardSkeleton />
    </View>
  );
}

export default TransactionListSkeleton;
