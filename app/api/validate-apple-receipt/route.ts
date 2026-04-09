import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Apple receipt validation endpoint
// Production: https://buy.itunes.apple.com/verifyReceipt
// Sandbox: https://sandbox.itunes.apple.com/verifyReceipt

const APPLE_VERIFY_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';

// Shared secret from App Store Connect
const APP_SHARED_SECRET = process.env.APPLE_SHARED_SECRET || '';

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const { receipt, productId, userId } = await request.json();

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!APP_SHARED_SECRET) {
      console.error('APPLE_SHARED_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Validate receipt with Apple
    const appleResponse = await validateWithApple(receipt);
    
    if (!appleResponse.success) {
      return NextResponse.json({ success: false, error: appleResponse.error }, { status: 400 });
    }

    // Check if receipt is for the expected product
    const receiptInfo = appleResponse.data?.receipt?.in_app?.[0];
    if (!receiptInfo) {
      return NextResponse.json({ success: false, error: 'Invalid receipt data' }, { status: 400 });
    }

    // Verify product ID matches
    if (receiptInfo.product_id !== productId) {
      return NextResponse.json({ success: false, error: 'Product ID mismatch' }, { status: 400 });
    }

    // Check expiration date for subscriptions
    const expirationDate = receiptInfo.expires_date_ms 
      ? parseInt(receiptInfo.expires_date_ms) 
      : null;
    
    if (expirationDate && expirationDate < Date.now()) {
      return NextResponse.json({ success: false, error: 'Subscription expired' }, { status: 400 });
    }

    // Determine plan type from product ID
    const planType = productId.includes('yearly') ? 'yearly' : 'monthly';
    
    // ✅ Update database - mark user as premium with subscription details
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_premium: true,
        premium_type: planType,
        subscription_expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
        last_transaction_id: receiptInfo.transaction_id,
        last_product_id: receiptInfo.product_id,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      return NextResponse.json({ success: false, error: 'Failed to activate premium' }, { status: 500 });
    }

    // Store transaction info (optional - for record keeping)
    console.log('IAP Purchase Successful:', {
      userId,
      productId: receiptInfo.product_id,
      transactionId: receiptInfo.transaction_id,
      planType,
      expiresAt: expirationDate,
    });
    
    return NextResponse.json({ 
      success: true,
      data: {
        productId: receiptInfo.product_id,
        transactionId: receiptInfo.transaction_id,
        originalTransactionId: receiptInfo.original_transaction_id,
        purchaseDate: receiptInfo.purchase_date,
        expiresDate: receiptInfo.expires_date,
      }
    });

  } catch (error: any) {
    console.error('Receipt validation error:', error);
    return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 500 });
  }
}

async function validateWithApple(receipt: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const requestBody = {
    'receipt-data': receipt,
    'password': APP_SHARED_SECRET,
    'exclude-old-transactions': false,
  };

  try {
    // Try sandbox first
    let response = await fetch(APPLE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    let data = await response.json();

    // Status 21007 = receipt is from production, retry with production URL
    if (data.status === 21007) {
      response = await fetch(APPLE_PRODUCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      data = await response.json();
    }

    // Status 0 = success
    if (data.status === 0) {
      return { success: true, data };
    }

    // Error codes: https://developer.apple.com/documentation/appstorereceipts/status
    const errorMessages: Record<number, string> = {
      21000: 'App store could not read receipt',
      21002: 'Receipt data is malformed',
      21003: 'Receipt could not be authenticated',
      21004: 'Shared secret does not match',
      21005: 'Receipt server unavailable',
      21006: 'Subscription expired (but valid receipt)',
      21010: 'Receipt not found',
    };

    return { 
      success: false, 
      error: errorMessages[data.status] || `Apple error: ${data.status}` 
    };

  } catch (error: any) {
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}
