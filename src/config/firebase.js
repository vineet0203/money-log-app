import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAMauqlhBNlWjJbiibBEzvenSrRfOO7cAA",
  authDomain: "moneylog-app.firebaseapp.com",
  projectId: "moneylog-app",
  storageBucket: "moneylog-app.firebasestorage.app",
  messagingSenderId: "771633764562",
  appId: "1:771633764562:web:5ee5d5ed5155b7a2df350b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
