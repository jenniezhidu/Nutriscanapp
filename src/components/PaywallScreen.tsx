import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { getOfferings, purchasePackage, restorePurchases } from '@/lib/revenuecat';
import { PurchasesPackage } from 'react-native-purchases';

interface PaywallScreenProps {
  showLifetime?: boolean;
  onClose?: () => void;
}

export default function PaywallScreen({ showLifetime = false, onClose }: PaywallScreenProps) {
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('annual');
  const [packages, setPackages] = useState<{
    monthly?: PurchasesPackage;
    annual?: PurchasesPackage;
    lifetime?: PurchasesPackage;
  }>({});

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offering = await getOfferings();

      if (offering) {
        const packageMap: any = {};

        offering.availablePackages.forEach((pkg) => {
          if (pkg.packageType === 'MONTHLY') {
            packageMap.monthly = pkg;
          } else if (pkg.packageType === 'ANNUAL') {
            packageMap.annual = pkg;
          } else if (pkg.packageType === 'LIFETIME') {
            packageMap.lifetime = pkg;
          }
        });

        setPackages(packageMap);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Purchases are not available on web');
      return;
    }

    const packageToPurchase =
      selectedPackage === 'monthly'
        ? packages.monthly
        : selectedPackage === 'annual'
        ? packages.annual
        : packages.lifetime;

    if (!packageToPurchase) {
      Alert.alert('Error', 'Package not available');
      return;
    }

    try {
      setPurchasing(true);
      await purchasePackage(packageToPurchase);
      Alert.alert('Success', 'You are now a premium member!');
      onClose?.();
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Error', 'Purchase failed. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Restore is not available on web');
      return;
    }

    try {
      setRestoring(true);
      await restorePurchases();
      Alert.alert('Success', 'Purchases restored successfully!');
      onClose?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#639922" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>Unlock unlimited scans and exclusive features</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.option, selectedPackage === 'monthly' && styles.selectedOption]}
          onPress={() => setSelectedPackage('monthly')}
        >
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>Monthly</Text>
            <Text style={styles.optionPrice}>$2.99</Text>
          </View>
          <Text style={styles.optionDescription}>per month</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, selectedPackage === 'annual' && styles.selectedOption]}
          onPress={() => setSelectedPackage('annual')}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SAVE 58%</Text>
          </View>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>Annual</Text>
            <Text style={styles.optionPrice}>$14.99</Text>
          </View>
          <Text style={styles.optionDescription}>per year</Text>
        </TouchableOpacity>

        {showLifetime && (
          <TouchableOpacity
            style={[styles.option, selectedPackage === 'lifetime' && styles.selectedOption]}
            onPress={() => setSelectedPackage('lifetime')}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Lifetime</Text>
              <Text style={styles.optionPrice}>$29.99</Text>
            </View>
            <Text style={styles.optionDescription}>one-time payment</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.ctaButton, purchasing && styles.disabledButton]}
        onPress={handlePurchase}
        disabled={purchasing}
      >
        {purchasing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.ctaButtonText}>Get Premium</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={restoring}
      >
        <Text style={styles.restoreButtonText}>
          {restoring ? 'Restoring...' : 'Restore Purchases'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF3DE',
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#3B6D11',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#639922',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  selectedOption: {
    borderColor: '#639922',
    backgroundColor: '#F5FAF0',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#639922',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3B6D11',
  },
  optionPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#639922',
  },
  optionDescription: {
    fontSize: 14,
    color: '#639922',
  },
  ctaButton: {
    backgroundColor: '#639922',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  restoreButton: {
    alignItems: 'center',
    padding: 12,
  },
  restoreButtonText: {
    color: '#639922',
    fontSize: 16,
    fontWeight: '600',
  },
});
