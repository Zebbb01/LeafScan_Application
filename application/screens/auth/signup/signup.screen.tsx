import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  AntDesign,
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
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_600SemiBold,
} from "@expo-google-fonts/nunito";
import { commonStyles } from "@/styles/common/common.styles";
import { router } from "expo-router";
import axios from "axios";
import { SERVER_URI } from "@/utils/uri";
import { Toast } from "react-native-toast-notifications";
import { useUser } from "../../../context/UserProvider";
import styles from "@/styles/auth/signup"

export default function SignUpScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState({
    password: "",
    email: "",
  });
  const { setUser } = useUser();
  const [passwordStrength, setPasswordStrength] = useState("");

  let [fontsLoaded, fontError] = useFonts({
    Raleway_600SemiBold,
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handlePasswordValidation = (value: string) => {
    const password = value;
    const passwordOneNumber = /(?=.*[0-9])/;
    const passwordSixValue = /(?=.{8,})/;

    if (!passwordSixValue.test(password)) {
      setError((prevError) => ({
        ...prevError,
        password: "Write at least 8 characters",
      }));
      setPasswordStrength("Weak");
    } else if (!passwordOneNumber.test(password)) {
      setError((prevError) => ({
        ...prevError,
        password: "Write at least one number",
      }));
      setPasswordStrength("Medium");
    } else {
      setError((prevError) => ({ ...prevError, password: "" }));
      setPasswordStrength("Strong");
    }
    setUserInfo((prevInfo) => ({ ...prevInfo, password: value }));
  };

  const handleEmailValidation = (value: string) => {
    const email = value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError((prevError) => ({
        ...prevError,
        email: "Invalid email address",
      }));
    } else {
      setError((prevError) => ({ ...prevError, email: "" }));
    }
    setUserInfo((prevInfo) => ({ ...prevInfo, email: value }));
  };

  const handleSignIn = () => {
    if (!userInfo.password) {
      Toast.show("Password cannot be empty!", { type: "danger" });
      return;
    }
  
    if (!userInfo.email) {
      Toast.show("Email cannot be empty!", { type: "danger" });
      return;
    }
  
    if (error.email) {
      Toast.show("Email address not found.", { type: "danger" });
      return;
    }

    if (error.password) {
      Toast.show("Choose a stronger password.", { type: "danger" });
      return;
    }

    if (error.password || error.email) {
      Toast.show("Make necessary changes to the input before submitting.", { type: "danger" });
      return;
    }

  
    setButtonSpinner(true);
    axios
      .post(`${SERVER_URI}/api/create_token`, {
        name: userInfo.name,
        email: userInfo.email,
        password: userInfo.password,
      })
      .then((res) => {
        const userData = res.data;
        setUser(userData);
        Toast.show(res.data.message || "Register successfully. Please verify your account.", {
          type: "success",
        });
        setUserInfo({ name: "", email: "", password: "" });
        setButtonSpinner(false);
        router.push({
          pathname: "/(routes)/verifyAccount",
          params: { userId: res.data.id, email: userInfo.email },
        });
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          Toast.show(error.response.data.error, { type: "danger" });
        } else {
          Toast.show("An error occurred. Please try again.", { type: "danger" });
        }
        console.error("Error during sign-up:", error);
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
          source={require("@/assets/sign-in/sign-up.png")}
        />
        <Text style={[styles.welcomeText, { fontFamily: "Raleway_700Bold" }]}>
          Let's get started!
        </Text>
        <Text style={styles.learningText}>
          Create an account to LeafScan to get all features
        </Text>
        <View style={styles.inputContainer}>
          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 40, marginBottom: -12 }]}
              keyboardType="default"
              value={userInfo.name}
              placeholder="john doe"
              onChangeText={(value) =>
                setUserInfo({ ...userInfo, name: value })
              }
            />
            <AntDesign
              style={{ position: "absolute", left: 26, top: 14 }}
              name="user"
              size={20}
              color={"#A1A1A1"}
            />
          </View>
          <View>
            <TextInput
              style={[styles.input, { paddingLeft: 40 }]}
              keyboardType="email-address"
              value={userInfo.email}
              placeholder="support@LeafScan.com"
              onChangeText={handleEmailValidation}
            />
            <Fontisto
              style={{ position: "absolute", left: 26, top: 17.8 }}
              name="email"
              size={20}
              color={"#A1A1A1"}
            />
            {error.email && (
              <View style={commonStyles.errorContainer}>
                <Entypo name="cross" size={18} color={"red"} />
                <Text style={{ color: "red", fontSize: 11, marginTop: -1 }}>
                  {error.email}
                </Text>
              </View>
            )}
            <View style={{ marginBottom: 15 }}>
              <TextInput
                style={commonStyles.input}
                keyboardType="default"
                secureTextEntry={!isPasswordVisible}
                value={userInfo.password}
                placeholder="********"
                onChangeText={handlePasswordValidation}
              />
              <TouchableOpacity
                style={styles.visibleIcon}
                onPress={() => setPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <Ionicons
                    name="eye-off-outline"
                    size={23}
                    color={"#747474"}
                  />
                ) : (
                  <Ionicons name="eye-outline" size={23} color={"#747474"} />
                )}
              </TouchableOpacity>
              <SimpleLineIcons
                style={styles.icon2}
                name="lock"
                size={20}
                color={"#A1A1A1"}
              />
            </View>
            {userInfo.password && (
              <View style={styles.passwordStrengthContainer}>
                <View
                  style={[
                    styles.passwordStrengthBar,
                    {
                      backgroundColor:
                        passwordStrength === "Strong"
                          ? "green"
                          : passwordStrength === "Medium"
                          ? "yellow"
                          : "red",
                      width:
                        passwordStrength === "Strong"
                          ? "100%"
                          : passwordStrength === "Medium"
                          ? "66%"
                          : "33%",
                    },
                  ]}
                />
                <Text style={styles.passwordStrengthText}>
                  {passwordStrength}
                </Text>
              </View>
            )}
            {error.password && (
              <View style={[commonStyles.errorContainer, { top: 140 }]}>
                <Entypo name="cross" size={18} color={"red"} />
                <Text style={{ color: "red", fontSize: 11, marginTop: -1 }}>
                  {error.password}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={{
                padding: 16,
                borderRadius: 8,
                marginHorizontal: 16,
                backgroundColor: "yellowgreen",
                marginTop: 15,
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
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>
            <View style={styles.signupRedirect}>
              <Text style={{ fontSize: 18, fontFamily: "Raleway_600SemiBold" }}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => router.push("/(routes)/login")}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "Raleway_600SemiBold",
                    color: "#016A70",
                    marginLeft: 5,
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

