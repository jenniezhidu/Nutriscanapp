import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { getFoodByBarcode } from '../services/foodService';
import { PrimaryButton } from '../components/PrimaryButton';
import { Camera } from 'lucide-react-native';

export function BarcodeScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const processingRef = useRef(false);

  useFocusEffect(() => {
    setScanned(false);
    setLoading(false);
    processingRef.current = false;
  });

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionContent}>
          <Camera color="#2d8659" size={80} strokeWidth={1.5} />
          <Text style={styles.permissionTitle}>Camera Access</Text>
          <Text style={styles.permissionSubtitle}>
            Required to scan barcodes and nutrition labels
          </Text>
        </View>
        <View style={styles.permissionButtonContainer}>
          <PrimaryButton title="Grant camera access" onPress={requestPermission} />
        </View>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (processingRef.current || scanned || loading) return;

    processingRef.current = true;
    setScanned(true);
    setLoading(true);

    console.log('🔵 Barcode scanned:', data);
    console.log('🔍 Looking up product...');

    try {
      const product = await getFoodByBarcode(data);

      if (!product) {
        console.log('❌ Product not found');
        router.push({
          pathname: '/result',
          params: {
            barcode: data,
            product: '',
            notFound: 'true',
          },
        });
      } else {
        console.log('✅ Product found:', product.name);
        router.push({
          pathname: '/result',
          params: {
            barcode: data,
            product: JSON.stringify(product),
            notFound: 'false',
          },
        });
      }
    } catch (error) {
      console.error('❌ Error looking up barcode:', error);
      router.push({
        pathname: '/result',
        params: {
          barcode: data,
          product: '',
          notFound: 'true',
          error: 'Network error. Please check your connection and try again.',
        },
      });
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlayContainer}>
        <View style={styles.overlayTop} />

        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />

          <View style={styles.scanArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
            {!loading && <View style={styles.scanLine} />}
          </View>

          <View style={styles.overlaySide} />
        </View>

        <View style={styles.overlayBottom}>
          <View style={styles.instructions}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#2d8659" />
                <Text style={styles.instructionTitle}>Looking up product...</Text>
              </>
            ) : (
              <>
                <Text style={styles.instructionTitle}>Point the camera at the barcode</Text>
                <Text style={styles.instructionSubtitle}>Keep your device steady</Text>
              </>
            )}
          </View>
          <View style={styles.cancelButtonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  scanArea: {
    width: 300,
    height: 200,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#ffffff',
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#ffffff',
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#ffffff',
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#ffffff',
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2d8659',
    shadowColor: '#2d8659',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  instructions: {
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionSubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  buttonContainer: {
    paddingHorizontal: 32,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginTop: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButtonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  cancelButtonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    marginTop: 24,
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2d8659',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d8659',
  },
});
