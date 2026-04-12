// DEBUG VERSION WITH EXTENSIVE LOGGING
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

export const IAP_PRODUCTS = {
  MONTHLY: 'com.urepp.app.premium.monthly',
  YEARLY: 'com.urepp.app.premium.yearly',
} as const;

export type ProductId = typeof IAP_PRODUCTS[keyof typeof IAP_PRODUCTS];

const DEBUG_FAKE_PURCHASE = false;

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
  console.log('[IAP-DEBUG] initializeIAP called');
  console.log('[IAP-DEBUG] isIOSNative:', isIOSNative());
  console.log('[IAP-DEBUG] CdvPurchase available:', typeof (window as any).CdvPurchase !== 'undefined');
  
  if (storeInitPromise) {
    console.log('[IAP-DEBUG] Store already initializing/initialized');
    return storeInitPromise!;
  }

  if (!isIOSNative() || typeof (window as any).CdvPurchase === 'undefined') {
    console.log('[IAP-DEBUG] Platform not iOS or CdvPurchase not available, resolving early');
    storeInitPromise = Promise.resolve();
    return storeInitPromise!;
  }

  console.log('[IAP-DEBUG] Creating new Store instance...');
  const { Store, Platform, ProductType } = (window as any).CdvPurchase;

  storeInstance = new Store({ platform: Platform.APPLE_APPSTORE });
  console.log('[IAP-DEBUG] Store created, registering products...');

  storeInstance.register([
    { id: IAP_PRODUCTS.MONTHLY, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.APPLE_APPSTORE },
    { id: IAP_PRODUCTS.YEARLY, type: ProductType.PAID_SUBSCRIPTION, platform: Platform.APPLE_APPSTORE },
  ]);
  console.log('[IAP-DEBUG] Products registered');

  storeInstance.when('receipt').updated((receipt: any) => {
    console.log('[IAP-DEBUG] Receipt updated:', receipt);
    receipt?.transactions?.forEach((t: any) => {
      if (t.state === 'approved') {
        console.log('[IAP-DEBUG] Transaction approved:', t.products?.[0]?.id);
        t.finish();
      }
    });
  });

  storeInitPromise = storeInstance
    .initialize()
    .then(() => {
      storeReady = true;
      console.log('[IAP-DEBUG] Store initialized SUCCESSFULLY');
      console.log('[IAP-DEBUG] Products loaded:', storeInstance?.products?.map((p: any) => ({ id: p.id, state: p.state, price: p.price })));
    })
    .catch((err: any) => {
      console.error('[IAP-DEBUG] Store initialization FAILED:', err);
      storeInitPromise = null;
      storeInstance = null;
    });

  return storeInitPromise!;
};

const getStore = (): any => {
  if (!storeInstance) {
    throw new Error('[IAP] Store not initialized');
  }
  return storeInstance;
};

const waitForProduct = (store: any, productId: string): Promise<any> => {
  return new Promise((resolve) => {
    console.log('[IAP-DEBUG] waitForProduct START:', productId);
    console.log('[IAP-DEBUG] Current products in store:', storeInstance?.products?.length || 0);
    console.log('[IAP-DEBUG] Product details:', storeInstance?.products?.map((p: any) => ({ id: p.id, state: p.state })));

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error('[IAP-DEBUG] TIMEOUT waiting for product:', productId);
        console.error('[IAP-DEBUG] Products at timeout:', storeInstance?.products);
        resolve(null);
      }
    }, 10000);

    const existing = storeInstance?.products?.find(
      (p: any) => p.id === productId && p.state === 'valid' && p.price
    );
    if (existing) {
      console.log('[IAP-DEBUG] Product already valid:', productId);
      clearTimeout(timeout);
      return resolve(existing);
    }

    console.log('[IAP-DEBUG] Setting up product listener...');
    store.when('product').updated((product: any) => {
      console.log('[IAP-DEBUG] Product update received:', product?.id, 'state:', product?.state);
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

export const purchaseIAPProduct = async (productId: string): Promise<{ success: boolean; receipt?: string; error?: string }> => {
  console.log('[IAP-DEBUG] =========================================');
  console.log('[IAP-DEBUG] purchaseIAPProduct START:', productId);
  console.log('[IAP-DEBUG] DEBUG_FAKE_PURCHASE:', DEBUG_FAKE_PURCHASE);

  if (DEBUG_FAKE_PURCHASE) {
    console.log('[IAP-DEBUG] Using FAKE purchase');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, receipt: 'FAKE_' + Date.now() };
  }

  console.log('[IAP-DEBUG] Checking isIOSNative...');
  if (!isIOSNative()) {
    console.log('[IAP-DEBUG] ERROR: Not iOS native');
    return { success: false, error: 'Not on iOS native platform' };
  }
  console.log('[IAP-DEBUG] isIOSNative: TRUE');

  console.log('[IAP-DEBUG] Checking CdvPurchase...');
  if (typeof (window as any).CdvPurchase === 'undefined') {
    console.log('[IAP-DEBUG] ERROR: CdvPurchase not available');
    return { success: false, error: 'CdvPurchase not available' };
  }
  console.log('[IAP-DEBUG] CdvPurchase: AVAILABLE');

  console.log('[IAP-DEBUG] Initializing store...');
  await initializeIAP();
  console.log('[IAP-DEBUG] Store initialized');

  const store = getStore();
  console.log('[IAP-DEBUG] Got store instance');

  console.log('[IAP-DEBUG] Waiting for product...');
  const product = await waitForProduct(store, productId);
  console.log('[IAP-DEBUG] waitForProduct result:', product ? 'FOUND' : 'NULL');

  if (!product) {
    console.log('[IAP-DEBUG] ERROR: Product not available');
    return { success: false, error: 'Product not available. Please try again.' };
  }

  console.log('[IAP-DEBUG] Starting purchase flow...');
  return new Promise((resolve) => {
    let resolved = false;

    const hardTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.error('[IAP-DEBUG] Purchase hard timeout');
        resolve({ success: false, error: 'Purchase timed out' });
      }
    }, 30000);

    store.when('receipt').updated((receipt: any) => {
      if (resolved) return;
      receipt?.transactions?.forEach((t: any) => {
        if (t.state === 'approved' && t.products?.[0]?.id === productId) {
          clearTimeout(hardTimeout);
          resolved = true;
          t.finish();
          console.log('[IAP-DEBUG] Purchase approved!');
          resolve({ success: true, receipt: t.appStoreReceipt || '' });
        }
      });
    });

    store.when('product').error((err: any) => {
      if (!resolved) {
        clearTimeout(hardTimeout);
        resolved = true;
        console.error('[IAP-DEBUG] Product error:', err);
        resolve({ success: false, error: err.message || 'Product error' });
      }
    });

    console.log('[IAP-DEBUG] Calling store.order()...');
    store.order(productId)
      .then(() => console.log('[IAP-DEBUG] Order placed, waiting...'))
      .catch((err: any) => {
        if (!resolved) {
          clearTimeout(hardTimeout);
          resolved = true;
          console.error('[IAP-DEBUG] Order failed:', err);
          resolve({ success: false, error: err.message || 'Purchase failed' });
        }
      });
  });
};

export const restorePurchases = async (): Promise<{ success: boolean; error?: string }> => {
  if (!isIOSNative()) return { success: false, error: 'Not on iOS native platform' };
  if (typeof (window as any).CdvPurchase === 'undefined') return { success: false, error: 'CdvPurchase not available' };

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
      const hasApproved = receipt?.transactions?.some((t: any) => t.state === 'approved');
      if (hasApproved) {
        clearTimeout(timeout);
        resolved = true;
        resolve({ success: true });
      }
    });

    store.restorePurchases();
  });
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
    if (new Date() > expiryDate) {
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
