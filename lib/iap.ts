import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

// Product IDs from App Store Connect
export const IAP_PRODUCTS = {
  MONTHLY: 'com.urepp.premium.monthly',
  YEARLY: 'com.urepp.premium.yearly',
  RECRUITER: 'com.urepp.recruiter',
} as const;

export type ProductId = typeof IAP_PRODUCTS[keyof typeof IAP_PRODUCTS];

// Check if running on iOS native app
export const isIOSNative = (): boolean => {
  console.log('[isIOSNative] Checking platform...');
  console.log('[isIOSNative] User Agent:', navigator.userAgent);
  
  // Aggressive check: iOS WebView (not browser)
  const ua = navigator.userAgent || '';
  const isIPad = /iPad/.test(ua);
  const isIPhone = /iPhone/.test(ua);
  const isIPod = /iPod/.test(ua);
  const isIOS = isIPad || isIPhone || isIPod;
  
  // Browser indicators (if present, means NOT native app)
  const isChrome = /CriOS/.test(ua); // Chrome iOS
  const isFirefox = /FxiOS/.test(ua); // Firefox iOS
  const isSafariBrowser = /Safari/.test(ua) && /Version/.test(ua) && !/CriOS/.test(ua);
  
  console.log('[isIOSNative] iOS:', isIOS, 'Chrome:', isChrome, 'Firefox:', isFirefox, 'SafariBrowser:', isSafariBrowser);
  
  // If it's iOS and NOT a known browser, it's likely the native app WebView
  // Note: CdvPurchase only exists in the actual native app, not Safari
  if (isIOS && !isChrome && !isFirefox && !isSafariBrowser) {
    // Double-check: CdvPurchase must be available for IAP to work
    if (typeof (window as any).CdvPurchase !== 'undefined') {
      console.log('[isIOSNative] Detected iOS Native WebView with CdvPurchase!');
      return true;
    }
    console.log('[isIOSNative] iOS WebView but CdvPurchase not available');
  }
  
  // Fallback: Try Capacitor (may not work in localhost)
  try {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      return true;
    }
  } catch (e) {
    console.log('[isIOSNative] Capacitor check failed');
  }
  
  // Last resort: check for Capacitor in UA
  if (/Capacitor/.test(ua)) {
    return true;
  }
  
  return false;
};

// Purchase a product using CdvPurchase - FIXED VERSION
export const purchaseIAPProduct = async (productId: string): Promise<{ success: boolean; receipt?: string; error?: string }> => {
  if (!isIOSNative()) {
    return { success: false, error: 'Not on iOS native platform' };
  }

  if (typeof (window as any).CdvPurchase === 'undefined') {
    return { success: false, error: 'CdvPurchase not available' };
  }

  const { store, Platform, ProductType } = (window as any).CdvPurchase;

  // Register product (safe to call multiple times)
  store.register([{
    id: productId,
    type: ProductType.PAID_SUBSCRIPTION,
    platform: Platform.APPLE_APPSTORE
  }]);

  return new Promise(async (resolve) => {
    const timeout = setTimeout(() => {
      resolve({ success: false, error: 'Purchase timed out. Please try again.' });
    }, 30000);

    store.when().approved((transaction: any) => {
      if (transaction.products[0]?.id === productId) {
        transaction.finish();
        clearTimeout(timeout);
        resolve({ success: true, receipt: transaction.appStoreReceipt });
      }
    });

    store.when().cancelled(() => {
      clearTimeout(timeout);
      resolve({ success: false, error: 'Purchase cancelled' });
    });

    store.when().error((err: any) => {
      clearTimeout(timeout);
      resolve({ success: false, error: err.message || 'Purchase failed' });
    });

    try {
      await store.initialize([Platform.APPLE_APPSTORE]);
      const product = store.get(productId, Platform.APPLE_APPSTORE);
      
      if (!product) {
        clearTimeout(timeout);
        return resolve({ success: false, error: 'Product not found. Check App Store Connect product IDs.' });
      }

      const offer = product.getOffer();
      if (!offer) {
        clearTimeout(timeout);
        return resolve({ success: false, error: 'No offer available for this product.' });
      }

      await offer.order();
    } catch (err: any) {
      clearTimeout(timeout);
      resolve({ success: false, error: err.message || 'Purchase failed' });
    }
  });
};

// Validate receipt with backend
export const validateReceiptWithBackend = async (receipt: string, productId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/validate-apple-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receipt,
        productId,
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: data.error || 'Validation failed' };
    }
  } catch (error: any) {
    console.error('Validation error:', error);
    return { success: false, error: error.message || 'Validation failed' };
  }
};

// Restore purchases (for iOS only)
export const restorePurchases = async (): Promise<{ success: boolean; receipt?: string; error?: string }> => {
  if (!isIOSNative()) {
    return { success: false, error: 'Not on iOS native platform' };
  }

  try {
    if (typeof (window as any).CdvPurchase === 'undefined') {
      return { success: false, error: 'CdvPurchase not available' };
    }

    const { store, Platform } = (window as any).CdvPurchase;
    
    return new Promise((resolve) => {
      let receipt: string | null = null;
      let restored = false;

      store.when('receipt').updated((rcpt: any) => {
        if (rcpt?.transactions?.length > 0) {
          rcpt.transactions.forEach((t: any) => {
            if (t.state === 'approved') {
              receipt = t.appStoreReceipt || '';
              restored = true;
            }
          });
        }
      });

      store.initialize([Platform.APPLE_APPSTORE]);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (restored && receipt) {
          resolve({ success: true, receipt });
        } else {
          resolve({ success: false, error: 'No previous purchases found' });
        }
      }, 10000);
    });
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Check if subscription is expired (call on app startup)
export const checkSubscriptionExpired = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return true;

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, subscription_expires_at')
      .eq('user_id', user.id)  // Fixed: was 'id', should be 'user_id'
      .single();

    if (!profile?.is_premium) return true;
    if (!profile?.subscription_expires_at) return false; // No expiry = permanent

    const expiryDate = new Date(profile.subscription_expires_at);
    const now = new Date();

    if (now > expiryDate) {
      // Expired - update database
      await supabase
        .from('profiles')
        .update({ 
          is_premium: false,
          premium_type: null,
          subscription_expires_at: null
        })
        .eq('id', user.id);
      
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};
