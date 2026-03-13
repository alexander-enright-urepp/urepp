// Deployment instructions for Vercel

/*

## Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project root:
   ```bash
   vercel
   ```

4. Follow prompts to link to your Vercel account

5. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add NEXT_PUBLIC_SUPABASE_URL
   - Add NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Add SUPABASE_SERVICE_ROLE_KEY

6. Redeploy:
   ```bash
   vercel --prod
   ```

### Option 2: GitHub + Vercel Integration

1. Push code to GitHub
2. Go to vercel.com and Import Project
3. Select your GitHub repository
4. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: next build
   - Output Directory: .next
5. Add environment variables
6. Deploy

## Post-Deployment

1. Update Supabase auth settings:
   - Go to Supabase → Authentication → URL Configuration
   - Add your production URL to "Site URL"
   - Add your production URL to "Redirect URLs"

2. Test the deployed app:
   - Visit your Vercel URL
   - Create a test profile
   - Verify Supabase data is saved

## Custom Domain (Optional)

1. Buy domain (Namecheap, Cloudflare, etc.)
2. In Vercel Dashboard → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

If build fails:
- Check environment variables are set
- Verify Supabase is accessible
- Check build logs in Vercel dashboard

If data doesn't save:
- Verify RLS policies are enabled
- Check Supabase auth settings
- Review browser console for errors

*/

export const deploymentInstructions = {
  vercel: {
    framework: 'nextjs',
    buildCommand: 'next build',
    outputDir: '.next',
    envVars: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]
  },
  supabase: {
    rls: true,
    auth: {
      siteUrl: 'YOUR_VERCEL_URL',
      redirectUrls: ['YOUR_VERCEL_URL/**']
    }
  }
}
