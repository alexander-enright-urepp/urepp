import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

// Your email to notify
const ADMIN_EMAIL = 'alex@urepp.com' // Change this to your email

export async function POST(request: Request) {
  try {
    const { profileUrl, profileUsername, email, message } = await request.json()

    if (!profileUrl || !profileUsername || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find the profile by username
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, username')
      .eq('username', profileUsername)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if there's already a pending claim for this profile/email
    const { data: existingClaim } = await supabaseAdmin
      .from('profile_claims')
      .select('id, status')
      .eq('profile_id', profile.id)
      .eq('claimer_email', email)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You already have a pending claim for this profile' },
        { status: 409 }
      )
    }

    // Insert the claim
    const { error: insertError } = await supabaseAdmin
      .from('profile_claims')
      .insert({
        profile_id: profile.id,
        profile_username: profileUsername,
        profile_url: profileUrl,
        claimer_email: email,
        claimer_message: message || null,
        status: 'pending'
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit claim' },
        { status: 500 }
      )
    }

    // Send email notification to admin
    try {
      await resend.emails.send({
        from: 'UREPP <claims@urepp.com>',
        to: ADMIN_EMAIL,
        subject: `New Profile Claim: ${profileUsername}`,
        html: `
          <h2>New Profile Claim Submitted</h2>
          <p><strong>Profile:</strong> ${profileUsername}</p>
          <p><strong>URL:</strong> <a href="${profileUrl}">${profileUrl}</a></p>
          <p><strong>Claimer Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message || 'No message provided'}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          <hr />
          <p>Review this claim in the admin dashboard.</p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Claim profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
