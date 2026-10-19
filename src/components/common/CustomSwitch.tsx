import React from 'react';
import { Switch, Platform, SwitchProps } from 'react-native';

export default function CustomSwitch(props: SwitchProps) {
  return (
    <Switch 
      {...props}
      trackColor={{ false: '#CBD5E1', true: '#159A1D' }}
      thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
    />
  );
}
