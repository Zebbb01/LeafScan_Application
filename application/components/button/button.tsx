import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import React from "react";
import { commonStyles } from "@/styles/common/common.styles";

export default function Button({
  title,
  onPress,
  style, // Add style prop
}: {
  title: string;
  onPress: () => void;
  style?: object; // Optional style prop
}) {
  const { width } = Dimensions.get("window");
  return (
    <TouchableOpacity
      style={[
        commonStyles.buttonContainer,
        {
          width: width * 1 - 150,
          height: 40,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          backgroundColor: 'yellowgreen', // Default color
        },
        style, // Apply custom styles
      ]}
      onPress={() => onPress()}
    >
      <Text
        style={{
          color: "white",
          fontSize: 20,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
