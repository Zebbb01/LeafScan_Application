import { Camera, CameraType } from 'expo-camera/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useRef, useEffect } from 'react';
import { Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import styles from '@/styles/camera/camera';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>(CameraType.back);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state
  const cameraRef = useRef<Camera>(null);
  const router = useRouter();

  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera permission is required to use this feature.');
      }
    };
    checkPermissions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const resetCamera = () => {
        if (cameraRef.current) {
          cameraRef.current.resumePreview();
          setIsCameraReady(false);
          setPhotoTaken(false);
        }
      };
      resetCamera();
    }, [])
  );

  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.pausePreview();
      }
    };
  }, []);

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const takePhoto = async () => {
    if (cameraRef.current && isCameraReady && !photoTaken && !loading) {
      setLoading(true); // Start loading
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
        setLoading(false); // Stop loading after photo is taken
      }
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  async function openGallery() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'You need to allow access to your gallery');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setSelectedImage(selectedImageUri);
      router.push({
        pathname: '/scanner',
        params: { imageUri: selectedImageUri },
      });
    }
  }

  function goToDashboard() {
    router.push('/dashboard');
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={facing}
        ref={cameraRef}
        onCameraReady={handleCameraReady}
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
          </View>
        </View>
      </Camera>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.galleryButton} onPress={openGallery} disabled={loading}>
          <Icon name="photo-library" size={24} color={loading ? '#888' : '#fff'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={takePhoto}
          disabled={photoTaken || loading} // Disable during loading
          activeOpacity={0.7}
        >
          <Icon
            name="camera-alt"
            size={40}
            color={photoTaken || loading ? '#888' : '#fff'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={goToDashboard} disabled={loading}>
          <Icon name="home" size={24} color={loading ? '#888' : '#fff'} />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Don't move, Please wait ...</Text>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}
