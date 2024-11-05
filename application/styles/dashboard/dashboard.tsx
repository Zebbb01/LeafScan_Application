import { StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export const dashboardStyle = StyleSheet.create({
  linearGradient: {
    flex: 1,
    paddingHorizontal: wp("5%"),
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp("5%"),
    marginBottom: hp("2%"),
    width: "100%",
    paddingHorizontal: wp("5%"),
  },
  borderLine: {
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  welcomeText: {
    fontSize: hp("3%"),
    fontFamily: "Raleway_700Bold",
    color: "#333",
  },
  iconContainer: {
    flexDirection: "row",
  },
  iconButton: {
    padding: wp("1%"),
  },
  logoutIcon: {
    marginLeft: wp("2%"),
  },
  firstContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp("5%"),
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: hp("2.5%"),
  },
  logo: {
    width: wp("55%"),
    height: hp("25%"),
    marginBottom: hp("1%"),
    resizeMode: "contain",
  },
  titleTextShape1: {
    position: "absolute",
    top: hp("5%"),
    left: wp("0%"),
    width: wp("30%"),
    height: hp("15%"),
    resizeMode: "contain",
    zIndex: 0,
  },
  titleTextShape2: {
    position: "absolute",
    top: hp("2%"),
    right: wp("0%"),
    width: wp("20%"),
    height: hp("20%"),
    resizeMode: "contain",
    zIndex: 0,
  },
  titleShape3: {
    position: "absolute",
    bottom: hp("1%"),
    right: wp("19%"),
    width: wp("20%"),
    height: hp("25%"),
    resizeMode: "contain",
    zIndex: 0,
  },
  dscpWrapper: {
    alignItems: "center",
    marginBottom: hp("2.5%"),
  },
  dscpText: {
    fontSize: hp("2.3%"),
    fontFamily: "Nunito_400Regular",
    color: "#666",
  },
  buttonWrapperContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: hp("5.5%"),
    marginBottom: hp("5.5%"),
  },
  buttonWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "yellowgreen",
    paddingVertical: hp("2%"),
    paddingHorizontal: wp("8%"),
    borderRadius: wp("6%"),
    width: "80%",
    marginVertical: hp("1.25%"),
  },
  buttonText: {
    fontSize: hp("2%"),
    color: "#fff",
    fontFamily: "Nunito_700Bold",
    marginLeft: wp("2%"),
  },
});
