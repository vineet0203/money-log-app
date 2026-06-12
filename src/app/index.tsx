import { View, Text, Image } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function LoginSplash() {
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <Image 
        source={require('../../assets/images/logo.png')} 
        className="w-32 h-32 rounded-3xl"
        resizeMode="contain"
      />
      <View className="flex-row mt-6 items-center">
        <Text className="text-4xl font-extrabold text-white tracking-widest">MONEY</Text>
        <Text className="text-4xl font-light text-accent tracking-widest">LOG</Text>
      </View>
      
      <StatusBar style="light" />
    </View>
  );
}
