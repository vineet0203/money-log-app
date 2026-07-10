import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Text, Platform } from "react-native";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import PhoneInput from "react-native-phone-number-input";

interface PhoneInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onChangeFormattedText: (text: string) => void;
  error?: string;
  defaultCode?: any;
}

export interface PhoneInputFieldRef {
  isValidNumber: (number: string) => boolean;
}

const PhoneInputField = forwardRef<PhoneInputFieldRef, PhoneInputFieldProps>(({
  value,
  onChangeText,
  onChangeFormattedText,
  error,
  defaultCode = "US",
}, ref) => {
  const phoneInput = useRef<PhoneInput>(null);
  
  useImperativeHandle(ref, () => ({
    isValidNumber: (number: string) => {
      return phoneInput.current?.isValidNumber(number) ?? false;
    }
  }));

  const [isFocused, setIsFocused] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="w-full mb-4" edges={['top', 'bottom']}>
      <PhoneInput
        ref={phoneInput}
        defaultValue={value}
        defaultCode={defaultCode}
        layout="second"
        onChangeText={(text) => {
          const numericText = text.replace(/[^0-9]/g, "");
          onChangeText(numericText);
        }}
        onChangeFormattedText={onChangeFormattedText}
        containerStyle={{
          width: "100%",
          backgroundColor: "#F8FAFC",
          borderRadius: 16,
          borderWidth: 2,
          borderColor: error ? "#EF4444" : isFocused ? "#6BCB77" : "#F1F5F9",
        }}
        flagButtonStyle={{ width: 70 }}
        textContainerStyle={{
          backgroundColor: "#F8FAFC",
          borderTopRightRadius: 14,
          borderBottomRightRadius: 14,
          paddingVertical: 4,
          borderLeftWidth: 2,
          borderLeftColor: "#F1F5F9",
          paddingLeft: 16,
        }}
        textInputStyle={{ color: "#0F172A", fontSize: 16, fontWeight: "500" }}
        codeTextStyle={{ color: "#0F172A", fontSize: 16, fontWeight: "500" }}
        textInputProps={{
          value: value,
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
          placeholderTextColor: "#94A3B8",
          keyboardType: "number-pad",
        }}
        countryPickerProps={{
          withSafeAreaList: true,
          countryCodes: ["IN", "US", "CA"],
          filterProps: {
            autoFocus: true,
            placeholder: "Search country",
          },
          modalProps: {
            presentationStyle: Platform.OS === "ios" ? "fullScreen" : undefined,
            animationType: "slide",
            statusBarTranslucent: false,
          },
          flatListProps: {
            contentContainerStyle: {
              paddingBottom: insets.bottom + 16,
            },
          },
        }}
        withDarkTheme={false}
        withShadow={false}
        autoFocus
      />
      {error ? (
        <Text className="text-red-500 text-sm mt-2 ml-2 font-medium">
          {error}
        </Text>
      ) : null}
    </SafeAreaView>
  );
});

export default PhoneInputField;