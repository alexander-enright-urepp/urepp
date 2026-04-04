import { registerPlugin } from '@capacitor/core';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  priceLocale: string;
  subscriptionPeriod?: number;
}

export interface PurchaseResult {
  productId: string;
  transactionId: string;
  receipt: string;
  purchased: boolean;
}

export interface IAPPlugin {
  getProducts(options: { productIds: string[] }): Promise<{ products: Product[] }>;
  purchase(options: { productId: string }): Promise<PurchaseResult>;
  restorePurchases(): Promise<{ restored: boolean }>;
  getReceipt(): Promise<{ receipt: string }>;
}

const IAPManager = registerPlugin<IAPPlugin>('IAPManager');

export default IAPManager;