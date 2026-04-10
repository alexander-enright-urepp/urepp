import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL, PURCHASES_ERROR_CODE, CustomerInfo } from '@revenuecat/purchases-capacitor';
import { supabase } from './supabase';

// RevenueCat API Keys
const REVENUECAT_API_KEY = 'test_KGpfBKuQLuDXrJzsIYESzFaGhQa';  // Replace this line;

// Product IDs from App Store Connect (same as before)
export const IAP_PRODUCTS = {
  MONTHLY: 'com.urepp.premium.monthly',
  YEARLY: 'com.urepp.premium.yearly',
} as const;

export type ProductId = typeof IAP_PRODUCTS[keyof typeof IAP_PRODUCTS];

// Check if running on iOS native app
export const isIOSNative = (): boolean => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  } catch (e) {
    return false;
  }
};

// Initialize RevenueCat (call once on app startup)
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
  if (!isIOSNative()) return;
  
  try {
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    });
    
    // Optional: Set log level for debugging
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    
    console.log('[RevenueCat] Initialized successfully');
  } catch (error) {
    console.error('[RevenueCat] Initialization error:', error);
  }
};

// Purchase a subscription using RevenueCat
export const purchaseSubscription = async (
  productId: ProductId
): Promise<{ success: boolean; error?: string }> => {
  if (!isIOSNative()) {
    return { success: false, error: 'Not on iOS native platform' };
  }

  try {
    // Get offerings - RevenueCat v6 API
    const offerings = await Purchases.getOfferings();
    
    if (!offerings?.current) {
      return { success: false, error: 'No offerings available' };
    }

    // Find the package for this product
    const packages = offerings.current.availablePackages;
    const pkg = packages.find(p => p.product.identifier === productId);

    if (!pkg) {
      return { success: false, error: 'Product not found in offerings' };
    }

    // Purchase the package
    const purchaseResult = await Purchases.purchasePackage({ aPackage: pkg });
    const customerInfo = purchaseResult.customerInfo;

    // Check if user is now premium
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
    if (isPremium) {
      // Update Supabase
      await updatePremiumStatus(customerInfo);
      return { success: true };
    } else {
      return { success: false, error: 'Purchase completed but premium not activated' };
    }

  } catch (error: any) {
    // Handle specific RevenueCat errors
    if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
      return { success: false, error: 'Purchase cancelled' };
    }
    
    console.error('[RevenueCat] Purchase error:', error);
    return { 
      success: false, 
      error: error.message || 'Purchase failed' 
    };
  }
};

// Restore purchases using RevenueCat
export const restorePurchases = async (): Promise<{ 
  success: boolean; 
  isPremium?: boolean;
  error?: string 
}> => {
  if (!isIOSNative()) {
    return { success: false, error: 'Not on iOS native platform' };
  }

  try {
    const { customerInfo } = await Purchases.restorePurchases();
    
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    
    if (isPremium) {
      await updatePremiumStatus(customerInfo);
      return { success: true, isPremium: true };
    } else {
      return { success: false, error: 'No previous purchases found' };
    }

  } catch (error: any) {
    console.error('[RevenueCat] Restore error:', error);
    return { success: false, error: error.message || 'Restore failed' };
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (): Promise<{
  isPremium: boolean;
  expirationDate?: Date;
}> => {
  if (!isIOSNative()) {
    return { isPremium: false };
  }

  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const premiumEntitlement = customerInfo.entitlements.active['premium'];
    
    if (premiumEntitlement) {
      return {
        isPremium: true,
        expirationDate: premiumEntitlement.expirationDate 
          ? new Date(premiumEntitlement.expirationDate)
          : undefined
      };
    }
    
    return { isPremium: false };
  } catch (error) {
    console.error('[RevenueCat] Status check error:', error);
    return { isPremium: false };
  }
};

// Update Supabase with premium status
const updatePremiumStatus = async (customerInfo: CustomerInfo): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const premiumEntitlement = customerInfo.entitlements.active['premium'];
    const isPremium = premiumEntitlement !== undefined;
    
    await supabase
      .from('profiles')
      .update({
        is_premium: isPremium,
        premium_type: premiumEntitlement?.productIdentifier.includes('yearly') ? 'yearly' : 'monthly',
        subscription_expires_at: premiumEntitlement?.expirationDate || null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
      
  } catch (error) {
    console.error('Error updating premium status:', error);
  }
};

// Legacy function names for backward compatibility
export const purchaseIAPProduct = purchaseSubscription;
export const checkSubscriptionExpired = async (): Promise<boolean> => {
  const { isPremium } = await checkSubscriptionStatus();
  return !isPremium;
};
