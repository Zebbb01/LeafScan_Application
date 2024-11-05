import { StyleSheet} from 'react-native'
const styles = StyleSheet.create({
    signInImage: {
      width: "40%",
      height: 170,
      alignSelf: "center",
      marginTop: 100,
    },
    welcomeText: {
      fontSize: 24,
      textAlign: "center",
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
      color: "#a1a1a1",
    },
    visibleIcon: {
      position: "absolute",
      right: 30,
      top: 15,
    },
    icon2: {
      position: "absolute",
      left: 24,
      top: 17.8,
      marginTop: -2,
    },
    forgotSection: {
      marginHorizontal: 16,
      textAlign: "right",
      fontSize: 16,
      marginTop: -20,
    },
    signupRedirect: {
      flexDirection: "row",
      marginHorizontal: 16,
      justifyContent: "center",
      marginBottom: 20,
    },
  });

export default styles;