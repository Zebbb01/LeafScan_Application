import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { ToastProvider } from "react-native-toast-notifications";
import { View } from "react-native";
import { Stack } from "expo-router";
import { UserProvider } from "../context/UserProvider";
import React from "react";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ToastProvider 
    placement="center"
    duration={1500}
     >
      <UserProvider>
        <RootLayoutNav />
      </UserProvider>
    </ToastProvider>
  );
}
function RootLayoutNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? (
        <View></View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(routes)/welcome-intro/index" />
          <Stack.Screen name="(routes)/login/index" />
          <Stack.Screen name="(routes)/sign-up/index" />
          <Stack.Screen name="(routes)/forgot-password/index" />
          <Stack.Screen name="(routes)/dashboard/index" />
          <Stack.Screen name="(routes)/scanner/index" />
          <Stack.Screen name="(routes)/editprofile/index" />
          <Stack.Screen name="(routes)/camera/index" />
        </Stack>
      )}
    </>
  );
}
