import { Image, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useFonts, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import { onboardStyles } from "@/styles/onboarding/onboard";
import { router } from "expo-router";

export default function OnBoardingScreen() {
  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <LinearGradient
      colors={["#ffffff", "#F8EDE3"]}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={onboardStyles.firstContainer}>
        <View>
          <Image
            source={require("@/assets/onboarding/logo.png")}
            style={onboardStyles.logo}
          />
          <Image source={require("@/assets/onboarding/shape_9.png")} />
        </View>
        <View style={onboardStyles.titleWrapper}>
          <Image
            style={onboardStyles.titleTextShape1}
            source={require("@/assets/onboarding/shape_3.png")}
          />
          <Text style={[onboardStyles.titleText, { fontFamily: "Raleway_700Bold" }]}>
            Start Detecting Disease With
          </Text>
          <Image
            style={onboardStyles.titleTextShape2}
            source={require("@/assets/onboarding/shape_2.png")}
          />
        </View>
        <View>
          <Image
            style={onboardStyles.titleShape3}
            source={require("@/assets/onboarding/shape_6.png")}
          />
          <Text style={[onboardStyles.titleText, { fontFamily: "Raleway_700Bold" }]}>
            LeafScan
          </Text>
        </View>
        <View style={onboardStyles.dscpWrapper}>
          <Text style={[onboardStyles.dscpText, { fontFamily: "Nunito_400Regular" }]}>
            Discover various cacao leaf diseases like
          </Text>
          <Text style={[onboardStyles.dscpText, { fontFamily: "Nunito_400Regular" }]}>
            Late Blight, Early Blight, and Leaf Spot, and learn effective
            prevention methods.
          </Text>
        </View>
        <TouchableOpacity
          style={onboardStyles.buttonWrapper}
          onPress={() => router.push("/(routes)/welcome-intro")}
        >
          <Text style={[onboardStyles.buttonText, { fontFamily: "Nunito_700Bold" }]}>
            Getting Started
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
