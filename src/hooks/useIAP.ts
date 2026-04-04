'use client'

import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import IAPManager from '../plugins/IAPPlugin';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  priceLocale: string;
}

interface UseIAPReturn {
  products: Product[];
  loading: boolean;
  purchasing: boolean;
  error: string | null;
  isNative: boolean;
  loadProducts: () => Promise<void>;
  purchase: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
}

// Product IDs must match App Store Connect
const PREMIUM_PRODUCT_ID = 'com.urepp.premium.monthly'; // Apple IAP Product ID

export function useIAP(userId: string | null): UseIAPReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if running on native iOS
  const isNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  const loadProducts = useCallback(async () => {
    if (!isNative) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await IAPManager.getProducts({
        productIds: [PREMIUM_PRODUCT_ID]
      });
      
      setProducts(result.products);
    } catch (err: any) {
      console.error('Failed to load products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [isNative]);

  const purchase = useCallback(async (productId: string): Promise<boolean> => {
    if (!isNative || !userId) return false;
    
    setPurchasing(true);
    setError(null);
    
    try {
      // Initiate purchase - this shows Apple's native purchase sheet
      const result = await IAPManager.purchase({ productId });
      
      if (!result.purchased || !result.receipt) {
        throw new Error('Purchase incomplete');
      }
      
      // Validate receipt with backend
      const validationResponse = await fetch('/api/validate-apple-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt: result.receipt,
          userId: userId,
          productId: result.productId,
          transactionId: result.transactionId
        })
      });
      
      if (!validationResponse.ok) {
        throw new Error('Receipt validation failed');
      }
      
      const validation = await validationResponse.json();
      
      if (!validation.valid) {
        throw new Error('Invalid receipt');
      }
      
      // Update local state
      await supabase.auth.refreshSession();
      
      return true;
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || 'Purchase failed');
      return false;
    } finally {
      setPurchasing(false);
    }
  }, [isNative, userId]);

  const restorePurchases = useCallback(async () => {
    if (!isNative || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await IAPManager.restorePurchases();
      
      // Get current receipt and validate
      const receiptResult = await IAPManager.getReceipt();
      
      if (receiptResult.receipt) {
        await fetch('/api/validate-apple-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receipt: receiptResult.receipt,
            userId: userId
          })
        });
        
        await supabase.auth.refreshSession();
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      setError(err.message || 'Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  }, [isNative, userId]);

  // Load products on mount
  useEffect(() => {
    if (isNative) {
      loadProducts();
    }
  }, [isNative, loadProducts]);

  return {
    products,
    loading,
    purchasing,
    error,
    isNative,
    loadProducts,
    purchase,
    restorePurchases
  };
}
