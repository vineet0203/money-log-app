import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Text, Platform, View, TouchableOpacity, TextInput, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PhoneInput from "react-native-phone-number-input";
import { Ionicons } from "@expo/vector-icons";

interface PhoneInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onChangeFormattedText: (text: string) => void;
  error?: string;
  defaultCode?: any;
  autoFocus?: boolean;
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
  autoFocus = false,
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
    <View className="w-full mb-4">
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
          withSafeAreaList: false,
          withCloseButton: false,
          withFilter: true,
          countryCodes: ["IN", "US"],
          filterProps: {
            autoFocus: true,
            placeholder: "Search country",
          },
          modalProps: {
            presentationStyle: Platform.OS === "ios" ? "fullScreen" : undefined,
            animationType: "slide",
            statusBarTranslucent: true,
          },
          flatListProps: {
            contentContainerStyle: {
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 16) + 20,
            },
          },
          renderCountryFilter: (filterProps: any) => (
            <View
              style={{
                width: "100%",
                paddingTop: Math.max(insets.top, Platform.OS === "android" ? 36 : 20) + 10,
                paddingBottom: 14,
                paddingHorizontal: 16,
                backgroundColor: "#FFFFFF",
                borderBottomWidth: 1,
                borderBottomColor: "#F1F5F9",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />
              <TouchableOpacity
                onPress={() => {
                  if (typeof filterProps?.onClose === "function") {
                    filterProps.onClose();
                  } else {
                    (phoneInput.current as any)?.setState?.({ modalVisible: false });
                  }
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>

              <View
                style={{
                  flex: 1,
                  height: 42,
                  backgroundColor: "#F8FAFC",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                }}
              >
                <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  value={filterProps.value}
                  onChangeText={filterProps.onChangeText}
                  placeholder="Search country"
                  placeholderTextColor="#94A3B8"
                  autoFocus={filterProps.autoFocus ?? true}
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: "#0F172A",
                    paddingVertical: 0,
                    fontWeight: "500",
                  }}
                />
                {Boolean(filterProps.value) && (
                  <TouchableOpacity
                    onPress={() => filterProps.onChangeText?.("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ),
        }}
        withDarkTheme={false}
        withShadow={false}
        autoFocus={autoFocus}
      />
      {error ? (
        <Text className="text-red-500 text-sm mt-2 ml-2 font-medium">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

export default PhoneInputField;