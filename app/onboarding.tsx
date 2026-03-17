import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Scan } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Scan size={80} color="#22c55e" strokeWidth={2} />
        </View>

        <Text style={styles.title}>Welcome to NutriScan</Text>

        <View style={styles.bulletContainer}>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>Unlimited barcode scans</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>5 free nutrition label scans per day</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>Instant per-100g conversion</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>Save your favourites</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 48,
    textAlign: 'center',
  },
  bulletContainer: {
    width: '100%',
    marginBottom: 48,
    gap: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 20,
    color: '#22c55e',
    marginRight: 12,
    lineHeight: 24,
  },
  bulletText: {
    fontSize: 17,
    color: '#333333',
    lineHeight: 24,
    flex: 1,
  },
  getStartedButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
