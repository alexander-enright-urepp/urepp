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
  const isSafariBrowser = /Safari/.test(ua) && /Version/.test(ua);
  
  console.log('[isIOSNative] iOS:', isIOS, 'Chrome:', isChrome, 'Firefox:', isFirefox);
  
  // If it's iOS and NOT a known browser, it's likely the native app WebView
  if (isIOS && !isChrome && !isFirefox) {
    console.log('[isIOSNative] Detected iOS Native WebView!');
    return true;
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

// Purchase a product using CdvPurchase
export const purchaseIAPProduct = async (productId: string): Promise<{ success: boolean; receipt?: string; error?: string }> => {
  if (!isIOSNative()) {
    return { success: false, error: 'Not on iOS native platform' };
  }

  try {
    // Check if CdvPurchase is available
    if (typeof (window as any).CdvPurchase === 'undefined') {
      return { success: false, error: 'CdvPurchase not available' };
    }

    const { Store, Platform, ProductType } = (window as any).CdvPurchase;
    
    // Create store instance
    const store = new Store({
      platform: Platform.APPLE_APPSTORE
    });

    // Register the product with platform
    store.register([{
      id: productId,
      type: ProductType.PAID_SUBSCRIPTION,
      platform: Platform.APPLE_APPSTORE
    }]);

    // Wait for store to be ready and product to load
    return new Promise((resolve) => {
      let receipt: string | null = null;
      let productLoaded = false;
      let purchaseStarted = false;

      // Handle receipt updates
      store.when('receipt').updated((rcpt: any) => {
        if (rcpt?.transactions) {
          rcpt.transactions.forEach((t: any) => {
            if (t.state === 'approved' && t.products[0]?.id === productId) {
              receipt = t.appStoreReceipt || '';
            }
          });
        }
      });

      // Handle product updates
      store.when('product').updated((product: any) => {
        console.log('[IAP] Product updated:', product?.id, 'State:', product?.state, 'Title:', product?.title);
        
        // Accept any state except invalid/error - product info might be loading
        if (product?.id === productId && product?.state !== 'invalid') {
          if (!purchaseStarted) {
            productLoaded = true;
            purchaseStarted = true;
            
            console.log('[IAP] Product available, starting purchase...');
            
            // Purchase the product
            store.order(productId)
              .then(() => {
                console.log('[IAP] Order initiated');
                // Wait for receipt
                const checkReceipt = setInterval(() => {
                  if (receipt) {
                    clearInterval(checkReceipt);
                    resolve({ success: true, receipt });
                  }
                }, 500);
                
                // Timeout receipt check after 10 seconds
                setTimeout(() => {
                  clearInterval(checkReceipt);
                  if (!receipt) {
                    resolve({ success: false, error: 'Purchase completed but no receipt' });
                  }
                }, 10000);
              })
              .catch((err: any) => {
                console.error('[IAP] Order error:', err);
                resolve({ success: false, error: err.message || 'Purchase failed' });
              });
          }
        }
      });

      // Initialize store
      console.log('[IAP] Initializing store...');
      store.initialize()
        .then(() => {
          console.log('[IAP] Store initialized, waiting for products...');
        })
        .catch((err: any) => {
          console.error('[IAP] Init error:', err);
          resolve({ success: false, error: err.message || 'Initialization failed' });
        });

      // Timeout if product never loads (15 seconds - faster feedback)
      setTimeout(() => {
        if (!productLoaded) {
          console.error('[IAP] Product load timeout');
          resolve({ success: false, error: 'Unable to load subscription. Please try again later or contact support if the issue persists.' });
        }
      }, 15000);
    });

  } catch (error: any) {
    console.error('Purchase error:', error);
    return { success: false, error: error.message || 'Purchase failed' };
  }
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

    const { Store, Platform } = (window as any).CdvPurchase;
    
    const store = new Store({
      platform: Platform.APPLE_APPSTORE
    });

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

      // Initialize store
      store.initialize();

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
      .eq('id', user.id)
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
