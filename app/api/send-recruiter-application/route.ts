import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend only if API key exists
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function POST(req: NextRequest) {
  try {
    // Check if Resend is configured
    if (!resend) {
      console.log('Resend not configured, skipping email')
      return NextResponse.json({ 
        success: true, 
        message: 'Application saved (email not configured)' 
      })
    }
    const { firstName, lastName, email, organization, title, phone } = await req.json()

    if (!firstName || !lastName || !email || !organization) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email to Alex
    const { error: emailError } = await resend.emails.send({
      from: 'UREPP Recruiters <onboarding@resend.dev>',
      to: 'alex@urepp.tv',
      subject: `New Recruiter Application: ${firstName} ${lastName}`,
      html: `
        <h2>New Recruiter Application</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Organization:</strong> ${organization}</p>
        <p><strong>Title:</strong> ${title || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <hr/>
        <p><strong>Action Required:</strong></p>
        <p>To approve this recruiter, run this SQL in Supabase:</p>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">
UPDATE profiles 
SET recruiter_approved = true 
WHERE email = '${email}';
        </pre>
        <hr/>
        <p><strong>Login to review:</strong></p>
        <p><a href="https://www.urepp.app/recruiter-login">https://www.urepp.app/recruiter-login</a></p>
      `
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    // Send confirmation email to applicant
    await resend.emails.send({
      from: 'UREPP Recruiters <onboarding@resend.dev>',
      to: email,
      subject: 'Your UREPP Recruiter Application Received',
      html: `
        <h2>Thank you for your application!</h2>
        <p>Hi ${firstName},</p>
        <p>We've received your recruiter application for ${organization}. Our team will review your information and get back to you within 24-48 hours.</p>
        <p>Once approved, you'll receive an email with login instructions.</p>
        <hr/>
        <p><strong>Questions?</strong></p>
        <p>Reply to this email or contact us at alex@urepp.tv</p>
        <br/>
        <p>Best regards,<br/>UREPP Team</p>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
