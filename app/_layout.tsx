import 'react-native-get-random-values';
import { Stack } from "expo-router";
import { UIProvider } from "../src/context/UIContext";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const router = useRouter();

useEffect(() => {
  const check = async () => {
    const seen = await AsyncStorage.getItem("seenOnboarding");

    if (!seen) {
      router.replace("/(auth)/onboarding");
    }
  };

  check();
}, []);
  return (
    <UIProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UIProvider>
  );
}