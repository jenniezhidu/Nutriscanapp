import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { getFoodByBarcode } from '../services/foodService';
import { PrimaryButton } from '../components/PrimaryButton';

export function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  /**
   * Permission states:
   * 1. Loading: permission is null (still checking)
   * 2. Not granted: permission.granted is false
   * 3. Granted: permission.granted is true
   */

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>NutriScan needs camera access to scan barcodes.</Text>
        <View style={styles.buttonContainer}>
          <PrimaryButton title="Grant camera access" onPress={requestPermission} />
        </View>
      </View>
    );
  }

  /**
   * Barcode scan handler.
   *
   * This function is called when a barcode is detected by the camera.
   * It prevents double scans by using a scanned state flag.
   *
   * Steps:
   * 1. Check if we've already scanned (prevent duplicates)
   * 2. Set scanned flag to true
   * 3. Look up the product in mockFoods using getFoodByBarcode
   * 4. Navigate to ResultScreen with barcode and product data
   */
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    const product = getFoodByBarcode(data);

    router.push({
      pathname: '/result',
      params: {
        barcode: data,
        product: product ? JSON.stringify(product) : '',
      },
    });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <Text style={styles.instructionText}>Point the camera at the barcode</Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 32,
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
});
