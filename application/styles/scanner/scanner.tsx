import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Raleway_700Bold",
    color: "#4a4a4a",
    marginBottom: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "yellowgreen",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: "48%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Raleway_600SemiBold",
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: "48%",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Raleway_600SemiBold",
    marginLeft: 5,
  },
  viewButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    marginBottom: 20,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Raleway_600SemiBold",
    marginLeft: 5,
  },
  homeButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    position: "absolute",
    bottom: 20,
    left: "5%", // Center the button horizontally
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Raleway_600SemiBold",
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 7,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  modalLabel2: {
    fontSize: 18,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    justifyContent: 'center', // Center the loading spinner
    alignItems: 'center',
    height: 50, // Adjust the height to match the button size
    width: 150, // Adjust the width to match the button size
  },
  loadingText: {
    marginTop: 10,
    color: 'gray',
    fontSize: 16,
  },
  changeImageButton: {
    backgroundColor: "#016A70", // Adjust color as needed
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    marginBottom: 10,
  },
  resultButtonContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    marginBottom: 20,
  },
  
});

export default styles;
