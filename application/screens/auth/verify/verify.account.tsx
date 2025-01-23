import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import Button from "@/components/button/button";
import axios from 'axios';
import { SERVER_URI } from '@/utils/uri';
import { Toast } from 'react-native-toast-notifications';
import { useRouter, useLocalSearchParams } from 'expo-router';
import styles from "@/styles/auth/verify"

export default function VerifyAccountScreen() {
  const router = useRouter();
  const { email, userId } = useLocalSearchParams();
  const [code, setCode] = useState(new Array(4).fill(''));
  const inputs = useRef(code.map(() => React.createRef<TextInput>()));

  const handleInput = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.toUpperCase(); // Transform input to uppercase
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.current?.focus();
    }

    if (text === "" && index > 0) {
      inputs.current[index - 1]?.current?.focus();
    }
  };

  const handleSubmit = () => {
    const verificationCode = code.join('');
    axios.post(`${SERVER_URI}/api/verify_account`, {
      email: email,
      code: verificationCode,
    })
    .then(res => {
      Toast.show('Account verified successfully. Use your account to Sign In.', { type: 'success' });
      router.push('/(routes)/login');
    })
    .catch(error => {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        Toast.show(error.response.data.error, { type: 'danger' });
      } else {
        Toast.show('Invalid verification code. Please try again.', { type: 'danger' });
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Verification Code</Text>
      <Text style={styles.subText}>
        We have sent a verification code to your email. Please enter the code below.
      </Text>
      <View style={styles.inputContainer}>
        {code.map((_, index) => (
          <TextInput
            key={index}
            style={styles.inputBox}
            maxLength={1}
            onChangeText={(text) => handleInput(text, index)}
            value={code[index]}
            ref={inputs.current[index]}
            autoFocus={index === 0}
          />
        ))}
      </View>
      <View style={{ marginTop: 15 }}>
        <Button title="Submit" onPress={handleSubmit} style={{ backgroundColor: 'yellowgreen' }}/>
      </View>
      <View style={styles.loginLink}>
        <Text style={[styles.backText, { fontFamily: "Nunito_700Bold" }]}>
          Back To?
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.loginText, { fontFamily: "Nunito_700Bold" }]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}