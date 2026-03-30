import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log('Webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        
        if (userId && session.subscription) {
          // Update subscription record
          await supabase
            .from('subscriptions')
            .update({
              stripe_subscription_id: session.subscription as string,
              status: 'active',
              plan: 'premium',
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('user_id', userId);

          // Update profile to premium
          await supabase
            .from('profiles')
            .update({
              is_premium: true,
              premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('user_id', userId);

          console.log(`Activated premium for user: ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.metadata?.user_id;
        
        if (userId) {
          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('user_id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          // Downgrade to free
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              plan: 'free',
            })
            .eq('user_id', userId);

          await supabase
            .from('profiles')
            .update({
              is_premium: false,
              premium_until: null,
            })
            .eq('user_id', userId);

          console.log(`Downgraded user: ${userId} to free`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook received', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
}
