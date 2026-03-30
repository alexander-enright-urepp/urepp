import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Check for required env vars
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only initialize Stripe if key exists (for build time)
let stripe: Stripe | undefined;
let supabase: ReturnType<typeof createClient> | undefined;

if (stripeSecretKey && supabaseUrl && supabaseKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  });

  supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// POST /api/stripe/checkout
export async function POST(request: Request) {
  try {
    if (!stripe || !supabase) {
      return new Response(
        JSON.stringify({ error: 'Payment system not configured' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { user_id, email } = await request.json();

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id or email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get or create Stripe customer
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .single();

    let customerId = (existingSub as any)?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: { user_id },
      });
      customerId = customer.id;

      // Create subscription record
      await supabase.from('subscriptions').insert({
        user_id: user_id as string,
        stripe_customer_id: customerId,
        status: 'inactive',
        plan: 'free',
      } as any);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'UREPP Premium',
              description: 'Premium features for athlete recruiting profiles',
            },
            unit_amount: 1000, // $10.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        } as any,
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?checkout=canceled`,
      subscription_data: {
        metadata: { user_id },
      } as any,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
