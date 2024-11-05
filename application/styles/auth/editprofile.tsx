import { StyleSheet} from 'react-native'
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#F5F5F5", // Light background color
        justifyContent: "center",
      },
      formContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 20,
        elevation: 3,
        shadowColor: "#000", // Adding shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      header: {
        fontSize: 28,
        marginBottom: 20,
        color: "#333", // Darker color for better readability
      },
      input: {
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
      },
      passwordContainer: {
        position: "relative",
      },
      visibilityIcon: {
        position: "absolute",
        right: 10,
        top: 12,
      },
      button: {
        backgroundColor: "yellowgreen",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 10,
      },
      cancelButton: {
        backgroundColor: "#DC3545",
      },
      buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
      },
      errorText: {
        color: "#FF0000",
        marginBottom: 10,
        fontSize: 14,
      },
    });

export default styles;