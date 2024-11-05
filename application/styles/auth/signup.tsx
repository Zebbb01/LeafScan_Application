import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    signInImage: {
      width: "30%",
      height: 130,
      alignSelf: "center",
      marginTop: 100,
    },
    welcomeText: {
      textAlign: "center",
      fontSize: 24,
    },
    learningText: {
      textAlign: "center",
      color: "#575757",
      fontSize: 15,
      marginTop: 5,
    },
    inputContainer: {
      marginHorizontal: 16,
      marginTop: 30,
      rowGap: 30,
    },
    input: {
      height: 55,
      marginHorizontal: 16,
      borderRadius: 8,
      paddingLeft: 35,
      fontSize: 16,
      backgroundColor: "white",
      color: "#A1A1A1",
      marginBottom: 25,
    },
    visibleIcon: {
      position: "absolute",
      right: 30,
      top: 15,
    },
    icon2: {
      position: "absolute",
      left: 23,
      top: 17.8,
      marginTop: -2,
    },
    passwordStrengthContainer: {
      marginHorizontal: 16,
      marginTop: 10,
    },
    passwordStrengthBar: {
      height: 5,
      borderRadius: 3,
    },
    passwordStrengthText: {
      textAlign: "left",
      fontSize: 14,
      color: "#A1A1A1",
      marginTop: 5,
    },
    signupRedirect: {
      flexDirection: "row",
      marginHorizontal: 16,
      justifyContent: "center",
      marginBottom: 20,
      marginTop: 20,
    },
  });
  
  export default styles;