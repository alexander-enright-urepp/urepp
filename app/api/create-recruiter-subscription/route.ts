import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    // Initialize Stripe inside the handler to avoid build-time errors
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    })

    const { recruiterId, email } = await req.json()

    if (!recruiterId || !email) {
      return NextResponse.json(
        { error: 'Missing recruiter ID or email' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout session using existing Price ID
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_RECRUITER!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://urepp.app'}/recruiter-dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://urepp.app'}/recruiter-dashboard?canceled=true`,
      metadata: {
        recruiterId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
