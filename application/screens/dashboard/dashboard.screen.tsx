import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useFonts, Raleway_700Bold } from "@expo-google-fonts/raleway";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../context/UserProvider";
import { router } from "expo-router";
import { dashboardStyle } from "@/styles/dashboard/dashboard"; // Import the styles

export default function DashboardScreen() {
  const { user } = useUser();
  const [image, setImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("camera");

  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera permission to make this work!"
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      router.push({
        pathname: "/(routes)/scanner",
        params: { imageUri },
      });
    }
  };

  const handleStartScanning = async () => {
    const permissionsGranted = await requestPermissions();
    if (!permissionsGranted) return;

    router.push("/(routes)/camera"); // Navigate to the camera screen directly
  };

  const handleEditProfile = () => {
    router.push("/(routes)/editprofile");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => router.push("/(routes)/login") },
    ]);
  };

  const renderTabContent = () => {
    if (activeTab === "camera") {
      return (
        <TouchableOpacity
          style={dashboardStyle.buttonWrapper}
          onPress={handleStartScanning}
        >
          <Ionicons name="scan-outline" size={24} color="white" />
          <Text style={dashboardStyle.buttonText}>Start Scanning</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#F8EDE3"]}
      style={dashboardStyle.linearGradient}
    >
      <View style={dashboardStyle.headerContainer}>
        <Text style={dashboardStyle.welcomeText}>Welcome, {user?.name}</Text>
        <View style={dashboardStyle.iconContainer}>
          <TouchableOpacity onPress={handleEditProfile} style={dashboardStyle.iconButton}>
            <Ionicons name="pencil-sharp" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={[dashboardStyle.iconButton, dashboardStyle.logoutIcon]}>
            <Ionicons name="exit-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={dashboardStyle.borderLine}></View>

      <View style={dashboardStyle.firstContainer}>
        <View style={dashboardStyle.logoContainer}>
          <Image
            source={require("@/assets/onboarding/logo.png")}
            style={dashboardStyle.logo}
          />
          <Image
            style={dashboardStyle.titleTextShape1}
            source={require("@/assets/onboarding/shape_3.png")}
          />
          <Image
            style={dashboardStyle.titleTextShape2}
            source={require("@/assets/onboarding/shape_2.png")}
          />
          <Image
            style={dashboardStyle.titleShape3}
            source={require("@/assets/onboarding/shape_6.png")}
          />
        </View>
        <View style={dashboardStyle.dscpWrapper}>
          <Text style={dashboardStyle.dscpText}>Start Detecting Disease With</Text>
          <Text style={dashboardStyle.dscpText}>LeafScan</Text>
        </View>

        {/* Button */}
        <View style={dashboardStyle.buttonWrapperContainer}>
          {renderTabContent()}
        </View>
      </View>
    </LinearGradient>
  );
}
