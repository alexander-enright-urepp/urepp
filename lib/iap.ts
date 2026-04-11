import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

// Product IDs from App Store Connect
// Must match bundle ID: com.urepp.app
export const IAP_PRODUCTS = {
  MONTHLY: 'com.urepp.app.premium.monthly',
  YEARLY: 'com.urepp.app.premium.yearly',
} as const;

export type ProductId = typeof IAP_PRODUCTS[keyof typeof IAP_PRODUCTS];

// DEBUG MODE: Set to true to simulate purchases (for testing UI flow)
const DEBUG_FAKE_PURCHASE = true;

// Check if running on iOS native app
export const isIOSNative = (): boolean => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  } catch (e) {
    return false;
  }
};

// ---------------------------------------------------------------------------
// SINGLETON STORE — initialize once at app startup, reuse everywhere
// ---------------------------------------------------------------------------
let storeInstance: any = null;
let storeReady = false;
let storeInitPromise: Promise<void> | null = null;

export const initializeIAP = (): Promise<void> => {
  // Already initialized or initializing
  if (storeInitPromise) return storeInitPromise!;

  if (!isIOSNative() || typeof (window as any).CdvPurchase === 'undefined') {
    storeInitPromise = Promise.resolve();
    return storeInitPromise!;
  }

  const { Store, Platform, ProductType } = (window as any).CdvPurchase;

  storeInstance = new Store({ platform: Platform.APPLE_APPSTORE });

  // Register ALL products once
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

  // Set up global receipt handler for subscription verification
  storeInstance.when('receipt').updated((receipt: any) => {
    console.log('[IAP] Receipt updated globally');
    receipt?.transactions?.forEach((t: any) => {
      if (t.state === 'approved') {
        console.log('[IAP] Approved transaction:', t.products?.[0]?.id);
        t.finish(); // Finish approved transactions so Apple doesn't keep re-delivering
      }
    });
  });

  storeInitPromise = storeInstance
    .initialize()
    .then(() => {
      storeReady = true;
      console.log('[IAP] Store initialized successfully');
    })
    .catch((err: any) => {
      console.error('[IAP] Store initialization failed:', err);
      // Reset so it can be retried
      storeInitPromise = null;
      storeInstance = null;
    });

  return storeInitPromise!;
};

// Returns the singleton store, waiting for it to be ready
const getStore = (): any => {
  if (!storeInstance) {
    throw new Error('[IAP] Store not initialized. Call initializeIAP() at app startup.');
  }
  return storeInstance;
};

// ---------------------------------------------------------------------------
// PURCHASE
// ---------------------------------------------------------------------------
export const purchaseIAPProduct = async (
  productId: string
): Promise<{ success: boolean; receipt?: string; error?: string }> => {
  console.log('[IAP] Purchase requested for:', productId);
  console.log('[IAP] DEBUG_FAKE_PURCHASE:', DEBUG_FAKE_PURCHASE);
  
  // DEBUG MODE: Simulate purchase for UI testing
  if (DEBUG_FAKE_PURCHASE) {
    console.log('[IAP] DEBUG: Simulating fake purchase for', productId);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate 2s delay
    const fakeReceipt = 'FAKE_RECEIPT_' + Date.now();
    console.log('[IAP] DEBUG: Fake purchase complete, receipt:', fakeReceipt);
    return { success: true, receipt: fakeReceipt };
  }

  console.log('[IAP] Not in debug mode, checking platform...');
  
  if (!isIOSNative()) {
    console.log('[IAP] ERROR: Not on iOS native platform');
    return { success: false, error: 'Not on iOS native platform' };
  }

  if (typeof (window as any).CdvPurchase === 'undefined') {
    return { success: false, error: 'CdvPurchase not available' };
  }

  // Ensure store is initialized before purchasing
  await initializeIAP();

  const store = getStore();

  // Wait for the product to be in 'valid' state before ordering
  const product = await waitForProduct(store, productId);

  if (!product) {
    return { success: false, error: 'Product not available. Please try again.' };
  }

  return new Promise((resolve) => {
    let resolved = false;

    const hardTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error('[IAP] Purchase hard timeout reached');
        resolve({ success: false, error: 'Purchase timed out. Please try again.' });
      }
    }, 30000); // 30s for the full purchase flow

    // Listen for receipt on this specific product
    store.when('receipt').updated((receipt: any) => {
      if (resolved) return;

      receipt?.transactions?.forEach((t: any) => {
        if (
          t.state === 'approved' &&
          t.products?.[0]?.id === productId
        ) {
          const appStoreReceipt = t.appStoreReceipt || '';
          clearTimeout(hardTimeout);
          resolved = true;
          t.finish();
          resolve({ success: true, receipt: appStoreReceipt });
        }
      });
    });

    // Handle product-level errors
    store.when('product').error((err: any) => {
      if (!resolved) {
        clearTimeout(hardTimeout);
        resolved = true;
        console.error('[IAP] Product error:', err);
        resolve({ success: false, error: err.message || 'Product error' });
      }
    });

    // Place the order
    console.log('[IAP] Placing order for:', productId);
    store
      .order(productId)
      .then(() => {
        console.log('[IAP] Order placed, waiting for receipt...');
      })
      .catch((err: any) => {
        if (!resolved) {
          clearTimeout(hardTimeout);
          resolved = true;
          console.error('[IAP] Order failed:', err);
          resolve({ success: false, error: err.message || 'Purchase failed' });
        }
      });
  });
};

// ---------------------------------------------------------------------------
// RESTORE PURCHASES
// ---------------------------------------------------------------------------
export const restorePurchases = async (): Promise<{ success: boolean; error?: string }> => {
  if (!isIOSNative()) {
    return { success: false, error: 'Not on iOS native platform' };
  }

  if (typeof (window as any).CdvPurchase === 'undefined') {
    return { success: false, error: 'CdvPurchase not available' };
  }

  await initializeIAP();
  const store = getStore();

  return new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve({ success: false, error: 'No previous purchases found.' });
      }
    }, 15000);

    store.when('receipt').updated((receipt: any) => {
      if (resolved) return;

      const hasApproved = receipt?.transactions?.some(
        (t: any) => t.state === 'approved'
      );

      if (hasApproved) {
        clearTimeout(timeout);
        resolved = true;
        resolve({ success: true });
      }
    });

    console.log('[IAP] Restoring purchases...');
    store.restorePurchases();
  });
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

// Wait up to 10 seconds for a product to reach 'valid' state
const waitForProduct = (store: any, productId: string): Promise<any> => {
  return new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error('[IAP] Timed out waiting for product:', productId);
        resolve(null);
      }
    }, 10000);

    // Check existing products array first (CdvPurchase v13 stores products in store.products)
    const existing = storeInstance?.products?.find(
      (p: any) => p.id === productId && p.state === 'valid' && p.price
    );
    if (existing) {
      clearTimeout(timeout);
      return resolve(existing);
    }

    store.when('product').updated((product: any) => {
      if (product?.id === productId && product?.state === 'valid' && product?.price) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(product);
        }
      }
    });
  });
};

// ---------------------------------------------------------------------------
// SUBSCRIPTION STATUS (Supabase)
// ---------------------------------------------------------------------------
export const checkSubscriptionExpired = async (): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
        .update({
          is_premium: false,
          premium_type: null,
          subscription_expires_at: null,
        })
        .eq('user_id', user.id);

      return true;
    }

    return false;
  } catch (error) {
    console.error('[IAP] Error checking subscription:', error);
    return false;
  }
};
