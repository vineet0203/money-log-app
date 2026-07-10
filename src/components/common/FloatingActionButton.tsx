import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingActionButtonProps {
  onPress: () => void;
  iconName?: any;
  label?: string;
  bottomPosition?: number;
}

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FloatingActionButton({ 
  onPress, 
  iconName = "add",
  label,
  bottomPosition = 24
}: FloatingActionButtonProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.fab, 
        { bottom: bottomPosition + insets.bottom },
        label ? styles.extendedFab : styles.circularFab
      ]}
    >
      <Ionicons 
        name={iconName} 
        size={label ? 24 : 30} 
        color="#FFF" 
        style={label ? { marginRight: 8 } : undefined} 
      />
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    backgroundColor: '#6BCB77', // Primary Color
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6BCB77',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  circularFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  extendedFab: {
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 28,
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
