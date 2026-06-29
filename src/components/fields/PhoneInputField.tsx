import React, { useRef, useState } from 'react';
import { View, Text } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';

interface PhoneInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onChangeFormattedText: (text: string) => void;
  error?: string;
  defaultCode?: any;
}

export default function PhoneInputField({ value, onChangeText, onChangeFormattedText, error, defaultCode = 'US' }: PhoneInputFieldProps) {
  const phoneInput = useRef<PhoneInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full mb-4">
      <PhoneInput
        ref={phoneInput}
        defaultValue={value}
        defaultCode={defaultCode}
        layout="second"
        onChangeText={(text) => {
          // Strip non-numeric characters before passing up
          const numericText = text.replace(/[^0-9]/g, '');
          onChangeText(numericText);
        }}
        onChangeFormattedText={onChangeFormattedText}
        containerStyle={{
          width: '100%',
          backgroundColor: '#F8FAFC',
          borderRadius: 16,
          borderWidth: 2,
          borderColor: error ? '#EF4444' : isFocused ? '#6BCB77' : '#F1F5F9',
        }}
        flagButtonStyle={{
          width: 70, // Reduced width since the flag is hidden
        }}
        textContainerStyle={{
          backgroundColor: '#F8FAFC',
          borderTopRightRadius: 14,
          borderBottomRightRadius: 14,
          paddingVertical: 4,
          borderLeftWidth: 2,
          borderLeftColor: '#F1F5F9', // Subtle separator line
          paddingLeft: 16, // Extra space for the phone number
        }}
        textInputStyle={{
          color: '#0F172A',
          fontSize: 16,
          fontWeight: '500',
        }}
        codeTextStyle={{
          color: '#0F172A',
          fontSize: 16,
          fontWeight: '500',
        }}
        textInputProps={{
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
          placeholderTextColor: '#94A3B8',
          keyboardType: 'number-pad',
        }}
        withDarkTheme={false}
        withShadow={false}
        autoFocus
      />
      {error ? (
        <Text className="text-red-500 text-sm mt-2 ml-2 font-medium">{error}</Text>
      ) : null}
    </View>
  );
}
