import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle subscription events
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const recruiterId = session.metadata?.recruiterId

    if (recruiterId) {
      const supabase = createRouteHandlerClient({ cookies })
      
      // Update recruiter_paid to true
      const { error } = await supabase
        .from('profiles')
        .update({ recruiter_paid: true })
        .eq('id', recruiterId)

      if (error) {
        console.error('Error updating recruiter payment status:', error)
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
      }

      console.log('Recruiter payment confirmed:', recruiterId)
    }
  }

  // Handle subscription cancellation
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const recruiterId = subscription.metadata?.recruiterId

    if (recruiterId) {
      const supabase = createRouteHandlerClient({ cookies })
      
      await supabase
        .from('profiles')
        .update({ recruiter_paid: false })
        .eq('id', recruiterId)

      console.log('Recruiter subscription cancelled:', recruiterId)
    }
  }

  return NextResponse.json({ received: true })
}
