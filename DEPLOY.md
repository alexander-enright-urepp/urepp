# Deploy UREPP to Production

## Step 1: Push to GitHub

### 1. Initialize Git (if not done)
```bash
cd ~/.openclaw/workspace/urepp
git init
git add .
git commit -m "Initial commit - UREPP baseball recruitment profiles"
```

### 2. Create GitHub Repo
1. Go to https://github.com/new
2. Name it `urepp` (or whatever you want)
3. Don't initialize with README (we have one)
4. Create repository

### 3. Link and Push
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/urepp.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (run from project directory)
cd ~/.openclaw/workspace/urepp
vercel --prod
```

Follow the prompts. When done, you'll get a URL like `https://urepp.vercel.app`

### Option B: GitHub Integration (Auto-deploy)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework: Next.js
4. Add environment variables (see below)
5. Deploy

## Step 3: Add Environment Variables

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add these:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from your Supabase project (Project Settings → API).

3. Redeploy: `vercel --prod`

## Step 4: Set Up Supabase Auth

In Supabase Dashboard:
1. Go to Authentication → URL Configuration
2. Site URL: `https://your-vercel-url.vercel.app`
3. Redirect URLs: Add `https://your-vercel-url.vercel.app/**`

## You're Live! 🎉

Your site is now at:
- `https://urepp.vercel.app` (or your custom domain)

## Custom Domain (Optional)

1. Buy domain (Namecheap, Cloudflare, etc.)
2. Vercel Dashboard → Domains → Add
3. Follow DNS instructions
4. Update Supabase auth URLs with your custom domain

## Troubleshooting

**Build fails?**
- Check environment variables are set
- Make sure `npm install` works locally first

**Auth not working?**
- Verify Supabase URLs are correct
- Check redirect URLs include your domain

**Database not saving?**
- Make sure RLS policies are set up (see `lib/database.ts`)
- Verify Supabase is accessible from Vercel
