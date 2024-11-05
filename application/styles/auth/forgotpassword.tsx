import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    headerText: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 20,
    },
    input: {
      width: "100%",
      height: 50,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      padding: 10,
      marginBottom: 20,
    },
    button: {
      backgroundColor: "yellowgreen",
      width: "100%",
      height: 45,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 5,
    },
    buttonText: {
      color: "white",
      fontSize: 16,
    },
    loginLink: {
      flexDirection: "row",
      marginTop: 30,
    },
    loginText: {
      color: "#016A70",
      marginLeft: 5,
      fontSize: 16,
    },
    errorText: {
      color: "red",
      marginBottom: 10,
    },
  
    backText: { fontSize: 16 },
  });
  
  export default styles;