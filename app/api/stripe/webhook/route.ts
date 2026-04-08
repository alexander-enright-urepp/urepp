import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    // Initialize Stripe inside handler to avoid build-time errors
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    })

    const payload = await req.text()
    const signature = req.headers.get('stripe-signature') || ''

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET)
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
        
        await supabase
          .from('profiles')
          .update({
            recruiter_paid: true,
            recruiter_approved: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', recruiterId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
