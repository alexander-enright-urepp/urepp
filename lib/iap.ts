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
const DEBUG_FAKE_PURCHASE = false;

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

  // Set up global receipt handler - just log, don't finish transactions
  // (purchaseIAPProduct will handle finishing)
  storeInstance.when('receipt').updated((receipt: any) => {
    console.log('[IAP] Receipt updated globally');
    receipt?.transactions?.forEach((t: any) => {
      if (t.state === 'approved') {
        console.log('[IAP] Approved transaction:', t.products?.[0]?.id);
        // DON'T call t.finish() here - let purchaseIAPProduct handle it
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
    console.log('[IAP] ERROR: Product not found');
    return { success: false, error: 'Product not available. Please try again.' };
  }

  console.log('[IAP] Product details:', { id: product.id, state: product.state, price: product.price, title: product.title });

  // Validate product can be ordered
  // NOTE: StoreKit Configuration products may have state: undefined initially
  // We'll proceed as long as product exists - the actual purchase will fail if invalid
  if (product.state && product.state !== 'valid') {
    console.log('[IAP] ERROR: Product not in valid state:', product.state);
    return { success: false, error: 'Product not available for purchase' };
  }

  console.log('[IAP] Starting purchase flow...');

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

      console.log('[IAP] Receipt updated:', receipt);
      console.log('[IAP] Transactions:', receipt?.transactions?.length);

      receipt?.transactions?.forEach((t: any) => {
        console.log('[IAP] Checking transaction:', {
          state: t.state,
          productId: t.products?.[0]?.id,
          expectedProductId: productId
        });
        
        // Check if transaction matches our product OR is approved
        if (t.state === 'approved') {
          const transactionProductId = t.products?.[0]?.id;
          
          // Match exact product OR check if it's for our app (bundle ID match)
          if (transactionProductId === productId || 
              transactionProductId?.startsWith('com.urepp.app')) {
            const appStoreReceipt = t.appStoreReceipt || receipt.appStoreReceipt || '';
            console.log('[IAP] MATCHING transaction found! Resolving...');
            clearTimeout(hardTimeout);
            resolved = true;
            t.finish();
            resolve({ success: true, receipt: appStoreReceipt });
          }
        }
      });
    });

    // Handle errors
    store.error((err: any) => {
      if (!resolved) {
        clearTimeout(hardTimeout);
        resolved = true;
        console.error('[IAP] Store error:', err);
        resolve({ success: false, error: err.message || 'Purchase error' });
      }
    });

    // Place the order
    console.log('[IAP] Placing order for:', productId);
    store
      .order(product)
      .then(() => {
        console.log('[IAP] Order placed, waiting for receipt...');
      })
      .catch((err: any) => {
        if (!resolved) {
          clearTimeout(hardTimeout);
          resolved = true;
          console.error('[IAP] Order failed:', err);
          console.error('[IAP] Error type:', typeof err);
          console.error('[IAP] Error keys:', Object.keys(err || {}));
          const errorMessage = err?.message || err?.code || JSON.stringify(err) || 'Purchase failed';
          resolve({ success: false, error: errorMessage });
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

// Wait for product - StoreKit compatible version
const waitForProduct = async (store: any, productId: string): Promise<any> => {
  console.log('[IAP] waitForProduct START:', productId);
  
  // Wait longer for StoreKit config to load (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Try store.get() first - works better with StoreKit Configuration (.storekit files)
  console.log('[IAP] Trying store.get()...');
  try {
    const product = store.get(productId);
    if (product) {
      console.log('[IAP] Product found via store.get():', product.id, 'state:', product.state);
      return product;
    }
  } catch (e) {
    console.log('[IAP] store.get() failed, falling back to products array');
  }
  
  // Fallback to checking products array
  const products = store.products || [];
  console.log('[IAP] Available products:', products.length);
  console.log('[IAP] Product IDs:', products.map((p: any) => p.id));
  
  const product = products.find((p: any) => p.id === productId);
  
  if (product) {
    console.log('[IAP] Product found in array:', product.id, 'state:', product.state);
    return product;
  }
  
  console.error('[IAP] Product not found:', productId);
  return null;
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
