import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Camera, FileText, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function HomeScreen() {
  const handleScanBarcode = () => {
    router.push('/scan-barcode');
  };

  const handleScanNutritionLabel = () => {
    router.push('/scan-nutrition-label');
  };

  const handleFavourites = () => {
    router.push('/favourites');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#2d8659', '#1f5d3d']}
            style={styles.appIcon}
          >
            <View style={styles.scanFrame}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.title}>NutriScan</Text>
        <Text style={styles.description}>
          Scan food products and instantly see nutrition per 100g
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleScanBarcode}
          >
            <View style={styles.buttonIconContainer}>
              <Camera size={32} color="#2d8659" strokeWidth={2} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Scan Barcode</Text>
              <Text style={styles.buttonSubtitle}>Point at product barcode</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleScanNutritionLabel}
          >
            <View style={styles.buttonIconContainer}>
              <FileText size={32} color="#2d8659" strokeWidth={2} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Scan Nutrition Label</Text>
              <Text style={styles.buttonSubtitle}>Capture the nutrition table</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={handleFavourites}
          >
            <View style={styles.buttonIconContainer}>
              <Heart size={32} color="#2d8659" strokeWidth={2} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Favourites</Text>
              <Text style={styles.buttonSubtitle}>View saved products</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.footer}>Powered by NutriScan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
    shadowColor: '#2d8659',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#ffffff',
    borderTopLeftRadius: 4,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ffffff',
    borderTopRightRadius: 4,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 16,
    height: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#ffffff',
    borderBottomLeftRadius: 4,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ffffff',
    borderBottomRightRadius: 4,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    letterSpacing: -1,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  footer: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999999',
    paddingBottom: 32,
  },
});
