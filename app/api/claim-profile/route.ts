import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Your email to notify
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'alex@urepp.com'

export async function POST(request: Request) {
  try {
    console.log('[ClaimProfile] Received request')
    
    const body = await request.json()
    console.log('[ClaimProfile] Request body:', body)
    
    const { profileUrl, profileUsername, email, message } = body

    if (!profileUrl || !profileUsername || !email) {
      console.log('[ClaimProfile] Missing fields:', { profileUrl, profileUsername, email })
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

    console.log('[ClaimProfile] Looking up profile:', profileUsername)
    
    // Find the profile by username
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id, username')
      .eq('username', profileUsername)
      .single()

    if (profileError) {
      console.error('[ClaimProfile] Profile lookup error:', profileError)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (!profile) {
      console.log('[ClaimProfile] Profile not found:', profileUsername)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('[ClaimProfile] Profile found:', profile.id)

    // Check if there's already a pending claim for this profile/email
    const { data: existingClaim, error: existingError } = await supabaseAdmin
      .from('profile_claims')
      .select('id, status')
      .eq('profile_id', profile.id)
      .eq('claimer_email', email)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingError) {
      console.error('[ClaimProfile] Existing claim check error:', existingError)
    }

    if (existingClaim) {
      console.log('[ClaimProfile] Duplicate claim found')
      return NextResponse.json(
        { error: 'You already have a pending claim for this profile' },
        { status: 409 }
      )
    }

    console.log('[ClaimProfile] Inserting claim...')
    
    // Insert the claim
    const { data: insertedClaim, error: insertError } = await supabaseAdmin
      .from('profile_claims')
      .insert({
        profile_id: profile.id,
        profile_username: profileUsername,
        profile_url: profileUrl,
        claimer_email: email,
        claimer_message: message || null,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('[ClaimProfile] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit claim: ' + insertError.message },
        { status: 500 }
      )
    }

    console.log('[ClaimProfile] Claim inserted:', insertedClaim?.id)

    // Send email notification to admin (only if Resend is configured)
    if (process.env.RESEND_API_KEY) {
      try {
        console.log('[ClaimProfile] Sending email notification...')
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        
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
        console.log('[ClaimProfile] Email sent successfully')
      } catch (emailError) {
        console.error('[ClaimProfile] Failed to send email:', emailError)
        // Don't fail the request if email fails
      }
    }

    console.log('[ClaimProfile] Success!')
    return NextResponse.json({ success: true, claimId: insertedClaim?.id })
  } catch (error: any) {
    console.error('[ClaimProfile] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}
