import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  Entypo,
  Fontisto,
  Ionicons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Raleway_700Bold,
  Raleway_600SemiBold,
} from "@expo-google-fonts/raleway";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import { useState } from "react";
import { commonStyles } from "@/styles/common/common.styles";
import { router } from "expo-router";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import { useUser } from "../../../context/UserProvider";
import styles from "@/styles/auth/login"
import React from "react";

export default function LoginScreen() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState({
    email: "",
    password: "",
  });
  const { setUser } = useUser();

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handlePasswordValidation = (password: string) => {
    const passwordOneNumber = /(?=.*[0-9])/;
    const passwordEightValue = /(?=.{8,}$)/;

    if (!passwordOneNumber.test(password)) {
      setError((prevError) => ({
        ...prevError,
        password: "Password must contain at least one number",
      }));
    } else if (!passwordEightValue.test(password)) {
      setError((prevError) => ({
        ...prevError,
        password: "Password must be at least 8 characters",
      }));
    } else {
      setError((prevError) => ({
        ...prevError,
        password: "",
      }));
    }
  };

  const handleEmailValidation = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError((prevError) => ({
        ...prevError,
        email: "Invalid email address",
      }));
    } else {
      setError((prevError) => ({
        ...prevError,
        email: "",
      }));
    }
  };

  const handleSignIn = () => {
    if (!userInfo.email) {
      Toast.show("Email cannot be empty!", { type: "danger" });
      return;
    }

    if (!userInfo.password) {
      Toast.show("Password cannot be empty!", { type: "danger" });
      return;
    }

    if (error.email) {
      Toast.show("Email address not found.", { type: "danger" });
      return;
    }
    if (error.password) {
      Toast.show("Wrong password", { type: "danger" });
      return;
    }

    if (error.email || error.password) {
      Toast.show("Please fix the errors before submitting.", { type: "danger" });
      return;
    }

    setButtonSpinner(true);

    axios
      .post(`${SERVER_URI}/api/token`, userInfo)
      .then((response) => {
        const userData = response.data;
        if (!userData.is_verified) {
          Toast.show("Please verify your account.", { type: "warning" });
          router.push({
            pathname: "/(routes)/verifyAccount",
            params: { userId: userData.id, email: userInfo.email },
          });
        } else {
          setUser(userData);
          Toast.show("Login successful.", { type: "success" });
          router.push("/(routes)/camera"); // Navigate to dashboard or home screen after login
        }
      })
      .catch((error) => {
        setButtonSpinner(false);
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          if (error.response.data.error === "Wrong password") {
            Toast.show("Wrong Password. Please try again.", { type: "danger" });
          } else if (error.response.data.error === "Email not exist") {
            Toast.show("Email does not exist. Please check your email.", { type: "danger" });
          } else if (error.response.data.error === "Account not verified") {
            const userData = error.response.data.user; // Adjust according to the response format
            router.push({
              pathname: "/(routes)/verifyAccount",
              params: { userId: userData.id, email: userInfo.email },
            });
          } else {
            Toast.show("An error occurred. Please try again.", { type: "danger" });
          }
        } else {
          Toast.show("An error occurred. Please try again.", { type: "danger" });
        }
        console.error("Error during login:", error, { type: "danger" });
      })
      .finally(() => {
        setButtonSpinner(false);
      });
  };

  return (
    <LinearGradient
      colors={["#ffffff", "#F8EDE3"]}
      style={{ flex: 1, paddingTop: 20 }}
    >
      <ScrollView>
        <Image
          style={styles.signInImage}
          source={require("@/assets/sign-in/login.png")}
        />
        <Text style={[styles.welcomeText, { fontFamily: "Raleway_700Bold" }]}>
          Welcome Back!
        </Text>
        <Text style={styles.learningText}>
          Login to your existing account of LeafScan
        </Text>
        <View style={styles.inputContainer}>
          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 40, marginBottom: 10 }]}
              keyboardType="email-address"
              value={userInfo.email}
              placeholder="support@LeafScan.com"
              onChangeText={(value) => {
                setUserInfo((prevUserInfo) => ({
                  ...prevUserInfo,
                  email: value,
                }));
                handleEmailValidation(value);
              }}
            />
            <Fontisto
              style={{ position: "absolute", left: 26, top: 17.8 }}
              name="email"
              size={20}
              color={"#a1a1a1"}
            />
            {error.email && (
              <View style={commonStyles.errorContainer}>
                <Entypo name="cross" size={18} color={"red"} />
                <Text style={{ color: "red", fontSize: 11, marginTop: -1 }}>
                  {error.email}
                </Text>
              </View>
            )}
            <View style={{ marginTop: 15 }}>
              <TextInput
                style={commonStyles.input}
                keyboardType="default"
                secureTextEntry={!isPasswordVisible}
                value={userInfo.password}
                placeholder="********"
                onChangeText={(value) => {
                  setUserInfo((prevUserInfo) => ({
                    ...prevUserInfo,
                    password: value,
                  }));
                  handlePasswordValidation(value);
                }}
              />
              <TouchableOpacity
                style={styles.visibleIcon}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <Ionicons
                    name="eye-off-outline"
                    size={23}
                    color={"#747474"}
                  />
                ) : (
                  <Ionicons name="eye-outline" size={20} color={"#747474"} />
                )}
              </TouchableOpacity>
              <SimpleLineIcons
                style={styles.icon2}
                name="lock"
                size={20}
                color={"#a1a1a1"}
              />
            </View>

            {error.password && (
              <View style={[commonStyles.errorContainer, { top: 140 }]}>
                <Entypo name="cross" size={18} color={"red"} />
                <Text style={{ color: "red", fontSize: 11, marginTop: -1 }}>
                  {error.password}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => router.push("/(routes)/forgot-password")}>
            <Text
              style={[
                styles.forgotSection,
                { fontFamily: "Nunito_600SemiBold", marginTop: 10 },
              ]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 16,
              borderRadius: 8,
              marginHorizontal: 16,
              backgroundColor: "yellowgreen",
            }}
            onPress={handleSignIn}
          >
            {buttonSpinner ? (
              <ActivityIndicator size="small" color={"white"} />
            ) : (
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 16,
                  fontFamily: "Raleway_700Bold",
                }}
              >
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupRedirect}>
            <Text style={{ fontSize: 18, fontFamily: "Raleway_600SemiBold" }}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(routes)/sign-up")}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Raleway_600SemiBold",
                  color: "#016A70",
                  marginLeft: 5,
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

