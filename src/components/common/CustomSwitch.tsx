import React from 'react';
import { Switch, Platform, SwitchProps } from 'react-native';

export default function CustomSwitch(props: SwitchProps) {
  return (
    <Switch 
      {...props}
      trackColor={{ false: '#E2E8F0', true: '#6BCB77' }}
      thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
    />
  );
}
