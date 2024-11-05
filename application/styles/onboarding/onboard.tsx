import { StyleSheet } from "react-native";
import { 
    responsiveHeight, 
    responsiveWidth, } from "react-native-responsive-dimensions";
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";

export const onboardStyles = StyleSheet.create({
    firstContainer: {
        alignItems: "center",
        marginTop: 50,
    },
    logo: {
        width: wp("59%"),
        height: hp("16%"),
    },
    titleWrapper: {
        flexDirection: "row",
    },
    titleTextShape1: {
        position:'absolute',
        left: -28,
        top: -100, 
    },
    titleText:{
        fontSize: hp("3%"),
        textAlign: "center",
         //remore if the background is white
    },
    titleTextShape2:{
        position: "absolute",
        right: -40,
        top: -20,
    },
    titleShape3:{
        position: "absolute",
        left: -60,
    },
    dscpWrapper: {
        marginTop: 30,
    },
    dscpText: {
        textAlign: "center",
        color: "#575757",  //"#575757"
        fontSize: hp("2%"),
    },
    buttonWrapper:{
        backgroundColor: "yellowgreen",
        width: wp("92%"),
        paddingVertical: 18,
        borderRadius: 4,
        marginTop: 40,
    },
    buttonText: {
        color: "white",
        textAlign: "center",
    },
    welcomeButtonStyle: {
        backgroundColor: "yellowgreen",
        width: responsiveWidth(88),
        height: responsiveHeight(5.5),
        alignSelf:"center",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
    }
})