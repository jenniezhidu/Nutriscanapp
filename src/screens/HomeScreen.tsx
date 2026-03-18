import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Camera, FileText, Heart, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const BUTTON_WIDTH = (width - 64) / 2;

export function HomeScreen() {
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
          Scan food products and instantly see nutrition facts
        </Text>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => router.push('/scan-barcode')}
          >
            <View style={[styles.buttonIconContainer, { backgroundColor: '#e8f5e9' }]}>
              <Camera size={28} color="#2d8659" strokeWidth={2} />
            </View>
            <Text style={styles.buttonTitle}>Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => router.push('/scan-nutrition-label')}
          >
            <View style={[styles.buttonIconContainer, { backgroundColor: '#e3f2fd' }]}>
              <FileText size={28} color="#1976d2" strokeWidth={2} />
            </View>
            <Text style={styles.buttonTitle}>Label</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => router.push('/favourites')}
          >
            <View style={[styles.buttonIconContainer, { backgroundColor: '#fce4ec' }]}>
              <Heart size={28} color="#d81b60" strokeWidth={2} />
            </View>
            <Text style={styles.buttonTitle}>Favourites</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridButton}
            onPress={() => router.push('/history')}
          >
            <View style={[styles.buttonIconContainer, { backgroundColor: '#fff3e0' }]}>
              <Clock size={28} color="#f57c00" strokeWidth={2} />
            </View>
            <Text style={styles.buttonTitle}>History</Text>
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
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: '#2d8659',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 12,
    height: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#ffffff',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ffffff',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 12,
    height: 12,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#ffffff',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  gridButton: {
    width: BUTTON_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  buttonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: '#999999',
    paddingBottom: 40,
  },
});
