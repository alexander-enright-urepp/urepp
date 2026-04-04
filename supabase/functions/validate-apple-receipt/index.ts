// Supabase Edge Function for Apple Receipt Validation
// POST /functions/v1/validate-apple-receipt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

serve(async (req) => {
  try {
    const { receipt, userId, isSandbox = false } = await req.json();
    
    if (!receipt || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing receipt or userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Apple receipt validation endpoint
    const appleUrl = isSandbox
      ? 'https://sandbox.itunes.apple.com/verifyReceipt'
      : 'https://buy.itunes.apple.com/verifyReceipt';
    
    // Your app's shared secret from App Store Connect
    const sharedSecret = Deno.env.get('APPLE_SHARED_SECRET');
    
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
    
    // Status 0 = valid receipt
    // Status 21007 = sandbox receipt sent to production (retry with sandbox)
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
      return new Response(
        JSON.stringify({ error: 'Invalid receipt', status: validation.status }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return await processValidReceipt(validation, userId);
    
  } catch (error) {
    console.error('Receipt validation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function processValidReceipt(validation: AppleValidationResponse, userId: string) {
  const latestReceipt = validation.latest_receipt_info?.[0];
  
  if (!latestReceipt) {
    return new Response(
      JSON.stringify({ error: 'No purchase found in receipt' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const productId = latestReceipt.product_id;
  const transactionId = latestReceipt.transaction_id;
  const purchaseDate = new Date(parseInt(latestReceipt.purchase_date_ms));
  const expiresDate = latestReceipt.expires_date_ms 
    ? new Date(parseInt(latestReceipt.expires_date_ms))
    : new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
  
  const isActive = expiresDate > new Date();
  
  // Store in Supabase
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  // Update subscription
  await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey,
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      user_id: userId,
      status: isActive ? 'active' : 'expired',
      plan: 'premium',
      apple_transaction_id: transactionId,
      current_period_end: expiresDate.toISOString(),
      updated_at: new Date().toISOString()
    })
  });
  
  // Update profile
  await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey
    },
    body: JSON.stringify({
      is_premium: isActive,
      premium_until: expiresDate.toISOString()
    })
  });
  
  return new Response(
    JSON.stringify({
      valid: true,
      productId,
      transactionId,
      isActive,
      expiresAt: expiresDate.toISOString(),
      purchaseDate: purchaseDate.toISOString()
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
