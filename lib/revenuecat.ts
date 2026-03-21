import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

const ENTITLEMENT_ID = 'nutriscan_premium';

export const initRevenueCat = async () => {
  if (Platform.OS === 'web') {
    console.warn('RevenueCat is not supported on web');
    return;
  }

  try {
    const apiKey = Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_RC_APPLE_KEY
      : process.env.EXPO_PUBLIC_RC_GOOGLE_KEY;

    if (!apiKey) {
      console.error('RevenueCat API key not found');
      return;
    }

    await Purchases.configure({ apiKey });
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
};

export const getOfferings = async () => {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
};

export const purchasePackage = async (packageToPurchase: PurchasesPackage) => {
  if (Platform.OS === 'web') {
    throw new Error('Purchases not supported on web');
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error) {
    console.error('Error purchasing package:', error);
    throw error;
  }
};

export const restorePurchases = async () => {
  if (Platform.OS === 'web') {
    throw new Error('Restore not supported on web');
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
};

export const checkPremiumStatus = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
};
