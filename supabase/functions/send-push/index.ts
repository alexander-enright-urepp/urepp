import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const APPLE_PROD_URL = 'https://api.push.apple.com/3/device/'
const APPLE_SANDBOX_URL = 'https://api.sandbox.push.apple.com/3/device/'

serve(async (req) => {
  try {
    const { userId, title, body, data } = await req.json()

    // Get environment variables
    const p8Key = Deno.env.get('APN_P8_KEY')
    const keyId = Deno.env.get('APN_KEY_ID')
    const teamId = Deno.env.get('APN_TEAM_ID')
    const bundleId = Deno.env.get('APN_BUNDLE_ID')

    if (!p8Key || !keyId || !teamId || !bundleId) {
      return new Response(JSON.stringify({ error: 'Missing APN configuration' }), { status: 500 })
    }

    // Get user's device tokens from Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    const { data: tokens, error } = await fetch(`${supabaseUrl}/rest/v1/push_tokens?user_id=eq.${userId}&is_active=eq.true`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }).then(r => r.json())

    if (error || !tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ error: 'No device tokens found' }), { status: 404 })
    }

    // Generate JWT for APNs
    const now = Math.floor(Date.now() / 1000)
    const jwtHeader = btoa(JSON.stringify({ alg: 'ES256', kid: keyId }))
    const jwtPayload = btoa(JSON.stringify({ iss: teamId, iat: now, exp: now + 3600 }))
    
    // Note: Real JWT signing with ES256 requires crypto library
    // For now, return success message
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Push notification would be sent here',
      tokens: tokens.length 
    }))

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})