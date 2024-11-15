import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get("window");

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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
    maxHeight: height * 0.6,
    width: "100%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
  },
  modalCloseIcon: {
    alignSelf: "flex-end",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "justify",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  column: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  description: {
    marginBottom: 10,
    paddingHorizontal: 10,
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
