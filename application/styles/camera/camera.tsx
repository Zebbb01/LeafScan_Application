import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8EDE3",
  },
  message: {
    textAlign: 'center',
    padding: 20,
    fontSize: 18,
    color: '#333',
  },
  camera: {
    flex: 1,
    position: 'relative',
  },
  scanBorder: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    right: '5%',
    bottom: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  scanBorderCorner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: 'yellowgreen',
    zIndex: 3,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
    zIndex: 10, // Make sure it stays above all other elements
  },  
  loadingText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20, // Space between text and spinner
  },

  topLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: 4,
    borderTopWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderRightWidth: 4,
    borderTopWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },  
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F8EDE3",
  },
  galleryButton: {
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  scanButton: {
    backgroundColor: '#016A70',
    borderRadius: 60,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  homeButton: {
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  galleryImage: {
    width: 200,
    height: 200,
    margin: 10,
    borderRadius: 20,
  },
  galleryText: {
    fontSize: 18,
    margin: 20,
    textAlign: 'center',
    color: '#333',
  },
  closeButton: {
    backgroundColor: 'rgba(255,0,0,0.8)',
    borderRadius: 50,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  checkButton: {
    backgroundColor: 'rgba(0,128,0,0.8)',
    borderRadius: 50,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  flashButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute', // Positioned within the camera view
    top: 20, // Adjust based on camera view
    right: 20, // Align to the right side
  },
});

export default styles;
