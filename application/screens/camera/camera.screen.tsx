import { Camera, CameraType, FlashMode } from 'expo-camera/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useRef, useEffect } from 'react';
import { Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import styles from '@/styles/camera/camera';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>(CameraType.back);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [refreshCamera, setRefreshCamera] = useState(false); // State for refreshing camera
  const [flashMode, setFlashMode] = useState<FlashMode>(FlashMode.off); // Flash mode state
  const cameraRef = useRef<Camera>(null);
  const router = useRouter();

  // Check permissions once on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
      } else {
        Alert.alert('Permission Denied', 'Camera access is required to use this feature.');
      }
    };
    checkPermissions();
  }, []);

  // Trigger camera refresh when screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      setRefreshCamera(true); // Unmount the camera
      setIsCameraReady(false); // Reset camera ready state
      setPhotoTaken(false); // Reset photo taken state
      const timer = setTimeout(() => setRefreshCamera(false), 100); // Remount the camera after 100ms
      return () => clearTimeout(timer);
    }, [])
  );

  const handleCameraReady = () => {
    setIsCameraReady(true); // Camera is ready to take photos
  };

  const takePhoto = async () => {
    if (cameraRef.current && isCameraReady && !photoTaken && !loading) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          skipProcessing: true,
        });
        if (photo.uri) {
          setPhotoTaken(true);
          router.push({
            pathname: '/scanner',
            params: { imageUri: photo.uri },
          });
        } else {
          Alert.alert('Error', 'Failed to take a photo.');
        }
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take a photo.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Gallery access is needed to pick an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      router.push({
        pathname: '/scanner',
        params: { imageUri: selectedImageUri },
      });
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const toggleFlash = () => {
    setFlashMode((prevFlashMode) => {
      if (prevFlashMode === FlashMode.off) return FlashMode.on;
      if (prevFlashMode === FlashMode.on) return FlashMode.auto;
      return FlashMode.off;
    });
  };

  if (!permissionGranted) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Waiting for camera permissions...</Text>
      </View>
    );
  }

  if (refreshCamera) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Refreshing camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={facing}
        ref={cameraRef}
        onCameraReady={handleCameraReady}
        flashMode={flashMode}
      >
        <View style={styles.scanBorder}>
          <View style={[styles.scanBorderCorner, styles.topLeft]} />
          <View style={[styles.scanBorderCorner, styles.topRight]} />
          <View style={[styles.scanBorderCorner, styles.bottomLeft]} />
          <View style={[styles.scanBorderCorner, styles.bottomRight]} />
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing} disabled={loading}>
              <Icon name="flip-camera-ios" size={24} color={loading ? '#888' : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.flashButton} onPress={toggleFlash} disabled={loading}>
              <Icon
                name={flashMode === FlashMode.off ? 'flash-off' : flashMode === FlashMode.on ? 'flash-on' : 'flash-auto'}
                size={30}
                color={loading ? '#888' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.galleryButton} onPress={openGallery} disabled={loading}>
          <Icon name="photo-library" size={30} color={loading ? '#888' : '#016A70'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={takePhoto}
          disabled={!isCameraReady || photoTaken || loading}
          activeOpacity={0.7}
        >
          <Icon name="camera-alt" size={40} color={!isCameraReady || photoTaken || loading ? '#888' : '#fff'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={goToDashboard} disabled={loading}>
          <Icon name="home" size={30} color={loading ? '#888' : '#016A70'} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Don't move, please wait...</Text>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}
