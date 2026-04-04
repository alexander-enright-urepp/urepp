// API Route for Apple Receipt Validation
// POST /api/validate-apple-receipt

import { createClient } from '@supabase/supabase-js';

interface AppleValidationResponse {
  status: number;
  receipt?: {
    in_app?: Array<{
      product_id: string;
      transaction_id: string;
      original_transaction_id: string;
      purchase_date: string;
      expires_date?: string;
    }>;
  };
  latest_receipt_info?: Array<{
    product_id: string;
    transaction_id: string;
    original_transaction_id: string;
    purchase_date_ms: string;
    expires_date_ms?: string;
  }>;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function POST(request: Request) {
  try {
    const { receipt, userId, isSandbox = false } = await request.json();
    
    if (!receipt || !userId) {
      return Response.json(
        { error: 'Missing receipt or userId' },
        { status: 400 }
      );
    }
    
    // Apple receipt validation endpoint
    const appleUrl = isSandbox
      ? 'https://sandbox.itunes.apple.com/verifyReceipt'
      : 'https://buy.itunes.apple.com/verifyReceipt';
    
    const sharedSecret = process.env.APPLE_SHARED_SECRET;
    
    const response = await fetch(appleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'receipt-data': receipt,
        'password': sharedSecret,
        'exclude-old-transactions': false
      })
    });
    
    const validation: AppleValidationResponse = await response.json();
    
    // Status 21007 = sandbox receipt sent to production
    if (validation.status === 21007 && !isSandbox) {
      // Retry with sandbox
      const sandboxResponse = await fetch('https://sandbox.itunes.apple.com/verifyReceipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          'receipt-data': receipt,
          'password': sharedSecret,
          'exclude-old-transactions': false
        })
      });
      
      const sandboxValidation: AppleValidationResponse = await sandboxResponse.json();
      
      if (sandboxValidation.status === 0) {
        return await processValidReceipt(sandboxValidation, userId);
      }
    }
    
    if (validation.status !== 0) {
      return Response.json(
        { error: 'Invalid receipt', status: validation.status },
        { status: 400 }
      );
    }
    
    return await processValidReceipt(validation, userId);
    
  } catch (error) {
    console.error('Receipt validation error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processValidReceipt(validation: AppleValidationResponse, userId: string) {
  const supabase = getSupabaseClient();
  const latestReceipt = validation.latest_receipt_info?.[0];
  
  if (!latestReceipt) {
    return Response.json(
      { error: 'No purchase found in receipt' },
      { status: 400 }
    );
  }
  
  const productId = latestReceipt.product_id;
  const transactionId = latestReceipt.transaction_id;
  const purchaseDate = new Date(parseInt(latestReceipt.purchase_date_ms));
  const expiresDate = latestReceipt.expires_date_ms 
    ? new Date(parseInt(latestReceipt.expires_date_ms))
    : new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const isActive = expiresDate > new Date();
  
  // Update subscription
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      status: isActive ? 'active' : 'expired',
      plan: 'premium',
      apple_transaction_id: transactionId,
      current_period_end: expiresDate.toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  
  // Update profile
  await supabase
    .from('profiles')
    .update({
      is_premium: isActive,
      premium_until: expiresDate.toISOString()
    })
    .eq('user_id', userId);
  
  return Response.json({
    valid: true,
    productId,
    transactionId,
    isActive,
    expiresAt: expiresDate.toISOString(),
    purchaseDate: purchaseDate.toISOString()
  });
}
