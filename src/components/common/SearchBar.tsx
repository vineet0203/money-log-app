import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps extends TextInputProps {
  onSearch: (query: string) => void;
  debounceMs?: number;
  containerClassName?: string;
}

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  debounceMs = 500,
  containerClassName = "",
  ...props
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = (text: string) => {
    setQuery(text);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(text);
    }, debounceMs);
  };

  const handleClear = () => {
    setQuery("");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    onSearch("");
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <View
      className={`flex-row w-full items-center bg-slate-100 border border-slate-200 rounded-2xl px-4 h-12 ${containerClassName}`}
    >
      <Ionicons name="search" size={18} color="#94A3B8" />

      <TextInput
        value={query}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="flex-1 ml-3 text-[15px] text-slate-900"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        cursorColor="#0F172A"
        {...props}
      />

      {query.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          className="ml-2 p-1 bg-slate-200 rounded-full"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={14} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
}