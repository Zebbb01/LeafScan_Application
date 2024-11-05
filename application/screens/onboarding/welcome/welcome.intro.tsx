import { Image, StyleSheet, Text, View } from 'react-native'
import { 
  Nunito_400Regular,
  Nunito_600SemiBold
 } from '@expo-google-fonts/nunito'
 import { 
  responsiveHeight, 
  responsiveWidth, } from "react-native-responsive-dimensions";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Raleway_700Bold, useFonts } from '@expo-google-fonts/raleway';
import { LinearGradient } from 'expo-linear-gradient';
import AppIntroSlider from "react-native-app-intro-slider";
import { onboardingSwiperData } from '@/constants/constants';
import { router } from 'expo-router';
import { commonStyles } from '@/styles/common/common.styles';
import { onboardStyles } from '@/styles/onboarding/onboard';

export default function WelcomeIntroScreen() {
  let [fontsLoaded, fontError] = useFonts({
    Raleway_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const renderItem = ({item}:{item:onboardingSwiperDataType}) => (
    <LinearGradient
    colors={["#ffffff", "#F8EDE3"]}
    style={{ flex: 1, paddingHorizontal: 16 }}
    >
      <View style={{marginTop:80}}>
        <Image
        source={item.image}
        style={styles.image}
        />
        <Text style={[commonStyles.title, {fontFamily: "Raleway_700Bold"}]}>
          {item.title}
        </Text>
        <View style={{marginTop: 15}}>
        <Text style={[commonStyles.description, {fontFamily: "Nunito_400Regular"}]}>
          {item.description}
        </Text>
        <Text style={[commonStyles.description, {fontFamily: "Nunito_400Regular"}]}>
          {item.sortDescrition}
        </Text>
        <Text style={[commonStyles.description, {fontFamily: "Nunito_400Regular"}]}>
          {item.sortDescrition2}
        </Text>
        </View>
      </View>

    </LinearGradient>
  )

  return (
    <AppIntroSlider 
    renderItem={renderItem}
    data={onboardingSwiperData}
    onDone={() => {
      router.push("/login")
    }}
    onSkip={() => {
      router.push("/login")
    }}
    renderNextButton={() => (
      <View style={onboardStyles.welcomeButtonStyle}>
        <Text
        style={[onboardStyles.buttonText, {fontFamily: "Nunito_600SemiBold"}]}
        >
          Next
        </Text>
      </View>
    )}
    renderDoneButton={() => (
      <View style={onboardStyles.welcomeButtonStyle}>
        <Text
        style={[onboardStyles.buttonText, {fontFamily: "Nunito_600SemiBold"}]}
        >
          Done
        </Text>
      </View>
    )}
    showSkipButton={false}
    dotStyle={commonStyles.dotStyle}
    bottomButton={true}
    activeDotStyle={commonStyles.activeDotStyle}
    />
  )
}

const styles = StyleSheet.create({
  slideImage:{
    alignSelf: "center",
    marginBottom: 30,
  },
  image: {
    width: wp("80%"),
    height: hp("35%"),
    alignSelf:"center",
    marginBottom:30,
  }
})