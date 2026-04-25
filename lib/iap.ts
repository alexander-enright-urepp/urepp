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

// STOREKIT CONFIG MODE: Set to true when using Xcode StoreKit Configuration (.storekit file)
// This mode skips receipt requirements and uses transaction states instead
const STOREKIT_CONFIG_MODE = true; // Set to false for TestFlight/Production

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
  console.log('[IAP] initializeIAP called');
  console.log('[IAP] STOREKIT_CONFIG_MODE:', STOREKIT_CONFIG_MODE);
  
  // Already initialized or initializing
  if (storeInitPromise) {
    console.log('[IAP] Store already initializing or initialized');
    return storeInitPromise!;
  }

  if (!isIOSNative()) {
    console.log('[IAP] Not iOS native, skipping initialization');
    storeInitPromise = Promise.resolve();
    return storeInitPromise!;
  }

  if (typeof (window as any).CdvPurchase === 'undefined') {
    console.error('[IAP] CdvPurchase not available on window');
    storeInitPromise = Promise.resolve();
    return storeInitPromise!;
  }

  console.log('[IAP] CdvPurchase available, creating Store...');

  const { Store, Platform, ProductType } = (window as any).CdvPurchase;

  storeInstance = new Store({ platform: Platform.APPLE_APPSTORE });
  console.log('[IAP] Store instance created');

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
  console.log('[IAP] Products registered:', [IAP_PRODUCTS.MONTHLY, IAP_PRODUCTS.YEARLY]);

  // Set up global receipt handler - just log, don't finish transactions
  // (purchaseIAPProduct will handle finishing)
  storeInstance.when('receipt').updated((receipt: any) => {
    console.log('[IAP] Receipt updated globally:', receipt);
    console.log('[IAP] Receipt transactions:', receipt?.transactions?.length || 0);
    receipt?.transactions?.forEach((t: any, i: number) => {
      console.log(`[IAP] Receipt transaction ${i}:`, {
        state: t.state,
        productId: t.products?.[0]?.id,
        className: t.constructor?.name
      });
      if (t.state === 'approved') {
        console.log('[IAP] Approved transaction:', t.products?.[0]?.id);
        // DON'T call t.finish() here - let purchaseIAPProduct handle it
      }
    });
  });

  // Listen for product updates (helpful for StoreKit debugging)
  storeInstance.when('product').updated((product: any) => {
    console.log('[IAP] Product updated:', {
      id: product.id,
      state: product.state,
      title: product.title,
      price: product.price,
      canPurchase: product.canPurchase
    });
  });

  // Listen for all transaction updates (critical for StoreKit)
  storeInstance.when('transaction').updated((transaction: any) => {
    console.log('[IAP] Transaction updated:', {
      id: transaction.id,
      state: transaction.state,
      productId: transaction.products?.[0]?.id,
      error: transaction.error
    });
  });

  // Log store errors
  storeInstance.error((err: any) => {
    console.error('[IAP] Store error:', err);
    console.error('[IAP] Store error details:', {
      code: err.code,
      message: err.message,
      productId: err.productId
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
  console.log('[IAP] STOREKIT_CONFIG_MODE:', STOREKIT_CONFIG_MODE);
  
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
    }, STOREKIT_CONFIG_MODE ? 60000 : 30000); // 60s for StoreKit Config (slower)

    // STOREKIT CONFIG MODE: Listen for transaction states, not receipts
    if (STOREKIT_CONFIG_MODE) {
      console.log('[IAP] StoreKit Config mode: listening for transaction states...');
      console.log('[IAP] Setting up transaction listeners for product:', productId);
      
      store.when('transaction').updated((transaction: any) => {
        if (resolved) {
          console.log('[IAP] Transaction update ignored - already resolved');
          return;
        }
        
        const transactionProductId = transaction.products?.[0]?.id;
        console.log('[IAP] Transaction update received:', {
          id: transaction.id,
          state: transaction.state,
          productId: transactionProductId,
          isForOurProduct: transactionProductId === productId,
          error: transaction.error
        });
        
        // Check if this transaction is for our product
        if (transactionProductId !== productId) {
          console.log('[IAP] Transaction is for different product, ignoring');
          return;
        }
        
        // StoreKit Config transaction states: requested → initiated → purchasing → purchased → finished
        const completionStates = ['purchased', 'finished', 'approved'];
        if (completionStates.includes(transaction.state)) {
          console.log('[IAP] StoreKit Config: Transaction completed!', transaction.state);
          console.log('[IAP] Finishing transaction...');
          clearTimeout(hardTimeout);
          resolved = true;
          try {
            transaction.finish();
            console.log('[IAP] Transaction finished successfully');
          } catch (e) {
            console.error('[IAP] Error finishing transaction:', e);
          }
          // Use a mock receipt for StoreKit Config testing
          const mockReceipt = 'STOREKIT_CONFIG_TEST_' + Date.now();
          console.log('[IAP] Returning mock receipt:', mockReceipt);
          resolve({ success: true, receipt: mockReceipt });
        } else {
          console.log('[IAP] Transaction state not yet complete:', transaction.state);
        }
      });
    }

    // STANDARD MODE: Listen for receipt (also keep this as backup)
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
    console.log('[IAP] About to call store.order()...');
    console.log('[IAP] Product being ordered:', { 
      id: product.id, 
      state: product.state, 
      type: product.type 
    });
    
    store
      .order(product)
      .then(() => {
        console.log('[IAP] Order placed successfully! Waiting for callbacks...');
        console.log('[IAP] store.order() promise resolved');
      })
      .catch((err: any) => {
        if (!resolved) {
          clearTimeout(hardTimeout);
          resolved = true;
          console.error('[IAP] Order failed:', err);
          console.error('[IAP] Error type:', typeof err);
          console.error('[IAP] Error keys:', Object.keys(err || {}));
          console.error('[IAP] Error code:', err?.code);
          console.error('[IAP] Error message:', err?.message);
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
  console.log('[IAP] restorePurchases called');
  
  if (!isIOSNative()) {
    console.log('[IAP] Not iOS native, returning error');
    return { success: false, error: 'Not on iOS native platform' };
  }

  if (typeof (window as any).CdvPurchase === 'undefined') {
    console.log('[IAP] CdvPurchase not available');
    return { success: false, error: 'CdvPurchase not available' };
  }

  await initializeIAP();
  const store = getStore();
  console.log('[IAP] Calling store.restorePurchases()...');

  return new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.log('[IAP] Restore timeout - no previous purchases found');
        resolve({ success: false, error: 'No previous purchases found.' });
      }
    }, 15000);

    store.when('receipt').updated((receipt: any) => {
      console.log('[IAP] Restore - receipt updated:', receipt);
      if (resolved) return;

      const hasApproved = receipt?.transactions?.some(
        (t: any) => t.state === 'approved'
      );

      if (hasApproved) {
        console.log('[IAP] Restore - found approved transaction!');
        clearTimeout(timeout);
        resolved = true;
        resolve({ success: true });
      }
    });

    store.when('transaction').updated((transaction: any) => {
      console.log('[IAP] Restore - transaction updated:', transaction.state, transaction.products?.[0]?.id);
    });

    console.log('[IAP] Restoring purchases...');
    store.restorePurchases()
      .then(() => console.log('[IAP] restorePurchases() promise resolved'))
      .catch((e: any) => console.error('[IAP] restorePurchases() error:', e));
  });
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

// Wait for product - StoreKit compatible version
const waitForProduct = async (store: any, productId: string): Promise<any> => {
  console.log('[IAP] waitForProduct START:', productId);
  
  // Wait for StoreKit config to load (2 seconds initial wait)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Try store.get() first - works better with StoreKit Configuration (.storekit files)
  console.log('[IAP] Trying store.get()...');
  let product = null;
  
  try {
    product = store.get(productId);
    if (product) {
      console.log('[IAP] Product found via store.get():', product.id, 'state:', product.state, 'canPurchase:', product.canPurchase);
    }
  } catch (e) {
    console.log('[IAP] store.get() failed:', e);
  }
  
  // If product exists but isn't valid yet, wait for it to become valid
  if (product && product.state !== 'valid') {
    console.log('[IAP] Product found but state is', product.state, '- waiting for valid state...');
    
    // Wait up to 10 seconds for product to become valid
    for (let i = 0; i < 20; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh the product
      try {
        product = store.get(productId);
      } catch (e) {
        // ignore
      }
      
      console.log(`[IAP] Check ${i+1}/20: product state =`, product?.state, 'canPurchase =', product?.canPurchase);
      
      if (product?.state === 'valid' || product?.canPurchase === true) {
        console.log('[IAP] Product is now ready!');
        break;
      }
    }
  }
  
  if (product) {
    console.log('[IAP] Final product state:', product.state, 'canPurchase:', product.canPurchase);
    return product;
  }
  
  // Fallback to checking products array
  console.log('[IAP] Falling back to products array...');
  const products = store.products || [];
  console.log('[IAP] Available products:', products.length);
  console.log('[IAP] Product IDs:', products.map((p: any) => p.id));
  
  const arrayProduct = products.find((p: any) => p.id === productId);
  
  if (arrayProduct) {
    console.log('[IAP] Product found in array:', arrayProduct.id, 'state:', arrayProduct.state);
    return arrayProduct;
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
