import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

export const toastConfig: ToastConfig = {
  success: (props) => (
    <View style={[styles.container, styles.successContainer]}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      </View>
      <View style={styles.textContainer}>
        {props.text1 && <Text style={styles.text1}>{props.text1}</Text>}
        {props.text2 && <Text style={styles.text2}>{props.text2}</Text>}
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={() => Toast.hide()}>
        <Ionicons name="close" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  ),
  error: (props) => (
    <View style={[styles.container, styles.errorContainer]}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={24} color="#EF4444" />
      </View>
      <View style={styles.textContainer}>
        {props.text1 && <Text style={styles.text1}>{props.text1}</Text>}
        {props.text2 && <Text style={styles.text2}>{props.text2}</Text>}
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={() => Toast.hide()}>
        <Ionicons name="close" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  ),
  info: (props) => (
    <View style={[styles.container, styles.infoContainer]}>
      <View style={styles.iconContainer}>
        <Ionicons name="information-circle" size={24} color="#3B82F6" />
      </View>
      <View style={styles.textContainer}>
        {props.text1 && <Text style={styles.text1}>{props.text1}</Text>}
        {props.text2 && <Text style={styles.text2}>{props.text2}</Text>}
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={() => Toast.hide()}>
        <Ionicons name="close" size={20} color="#64748B" />
      </TouchableOpacity>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 4,
  },
  successContainer: {
    borderLeftColor: '#10B981',
  },
  errorContainer: {
    borderLeftColor: '#EF4444',
  },
  infoContainer: {
    borderLeftColor: '#3B82F6',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  text2: {
    fontSize: 13,
    color: '#64748B',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
