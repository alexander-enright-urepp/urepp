// IAP DISABLED - Commented out for App Store submission
// This file is kept for future use but all functionality is disabled

/*
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

// Product IDs from App Store Connect
export const IAP_PRODUCTS = {
  MONTHLY: 'com.urepp.app.premium.monthly',
  YEARLY: 'com.urepp.app.premium.yearly',
} as const;

export type ProductId = typeof IAP_PRODUCTS[keyof typeof IAP_PRODUCTS];

const DEBUG_FAKE_PURCHASE = false;
const STOREKIT_CONFIG_MODE = false;

let storeInstance: any = null;
let storeReady = false;
let storeInitPromise: Promise<void> | null = null;

export const isIOSNative = (): boolean => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  } catch (e) {
    return false;
  }
};

export const initializeIAP = (): Promise<void> => {
  console.log('[IAP] initializeIAP called');
  
  if (storeInitPromise) {
    return storeInitPromise!;
  }

  const hasCdvPurchase = typeof (window as any).CdvPurchase !== 'undefined';
  const isNative = isIOSNative();
  
  if (!isNative || !hasCdvPurchase) {
    storeInitPromise = Promise.resolve();
    return storeInitPromise!;
  }

  storeInitPromise = (async () => {
    try {
      const { Store, Platform, ProductType } = (window as any).CdvPurchase;
      storeInstance = new Store({ platform: Platform.APPLE_APPSTORE });
      
      storeInstance.register([
        {
          id: IAP_PRODUCTS.MONTHLY,
          type: ProductType.PAID_SUBSCRIPTION,
          platform: Platform.APPLE_APPSTORE,
        },
        {
          id: IAP_PRODUCTS.YEARLY,
          type: ProductType.PAID_SUBSCRIPTION,
          platform: Platform.APPLE_APPSTORE,
        },
      ]);

      await storeInstance.initialize();
      storeReady = true;
      console.log('[IAP] Store initialized successfully');
    } catch (err: any) {
      console.error('[IAP] Store initialization failed:', err);
      storeInitPromise = null;
      storeInstance = null;
    }
  })();

  return storeInitPromise;
};

export const purchaseIAPProduct = async (
  productId: string
): Promise<{ success: boolean; receipt?: string; error?: string }> => {
  return { success: false, error: 'IAP disabled' };
};

export const restorePurchases = async (): Promise<void> => {
  console.log('[IAP] restorePurchases called (disabled)');
};

export const checkSubscriptionExpired = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return true;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, subscription_expires_at')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_premium) return true;
    if (!profile?.subscription_expires_at) return false;

    const expiryDate = new Date(profile.subscription_expires_at);
    const now = new Date();

    if (now > expiryDate) {
      await supabase
        .from('profiles')
        .update({ is_premium: false, premium_type: null, subscription_expires_at: null })
        .eq('user_id', user.id);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[IAP] Error checking subscription:', error);
    return false;
  }
};
*/

// Stub exports for compatibility
export const IAP_PRODUCTS = {
  MONTHLY: 'com.urepp.app.premium.monthly',
  YEARLY: 'com.urepp.app.premium.yearly',
} as const;

export type ProductId = typeof IAP_PRODUCTS[keyof typeof IAP_PRODUCTS];

export const isIOSNative = (): boolean => false;

export const initializeIAP = (): Promise<void> => {
  console.log('[IAP] Disabled - skipping initialization');
  return Promise.resolve();
};

export const purchaseIAPProduct = async (
  _productId: string
): Promise<{ success: boolean; receipt?: string; error?: string }> => {
  return { success: false, error: 'IAP temporarily disabled' };
};

export const restorePurchases = async (): Promise<void> => {
  console.log('[IAP] restorePurchases - disabled');
};

export const checkSubscriptionExpired = async (): Promise<boolean> => {
  return false;
};
