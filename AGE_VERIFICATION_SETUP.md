# UREPP Age Verification & COPPA Compliance Setup

This document outlines the complete age verification system built for UREPP to comply with COPPA (Children's Online Privacy Protection Act).

---

## 📋 What Was Built

### 1. Database Schema (Supabase)
**File:** `sql/add_age_verification.sql`

Run this SQL in your Supabase SQL Editor to add the required columns:

```sql
-- Columns added to profiles table:
- age_verified (BOOLEAN, DEFAULT FALSE)
- age_verified_at (TIMESTAMPTZ)
- consent_given_at (TIMESTAMPTZ)
- consent_app_version (TEXT)
- date_of_birth (DATE)
- terms_version_accepted (TEXT)
```

Also creates:
- Index for fast age_verified lookups
- `verify_user_age()` function for secure age verification

### 2. React Components

**AgeGate.tsx** - Full-screen age verification modal
- Date of birth input (month/day/year dropdowns)
- Real-time age calculation
- Under-13 blocking with clear message
- Consent step with ToS/Privacy Policy links
- Back button prevention
- Mobile-first responsive design

**AgeVerificationWrapper.tsx** - Wrapper component for layout
- Integrates with useAgeVerification hook
- Shows loading state
- Renders AgeGate when needed

### 3. Custom Hook

**useAgeVerification.ts** - Age verification logic
- Checks local storage (Capacitor Preferences)
- Syncs with Supabase database
- Handles re-consent on app version updates
- Provides verification functions

### 4. Middleware Updates

**middleware.ts** - Route protection
- Protects all athlete routes (dashboard, profile, etc.)
- Protects recruiter routes
- Redirects unverified users to /age-verification
- Allows public access to landing/terms/privacy pages

### 5. Layout Integration

**layout.tsx** - Root layout updated
- AgeVerificationWrapper added
- Shows gate on first launch before any content

---

## 🚀 Setup Instructions

### Step 1: Run Supabase Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `sql/add_age_verification.sql`
3. Run the SQL
4. Verify columns were added:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name LIKE '%age%';
   ```

### Step 2: Update Environment Variables

Ensure your `.env.local` has Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Install Dependencies (if needed)

```bash
npm install @capacitor/preferences
```

### Step 4: Build and Deploy

```bash
npm run build
# For iOS:
npm run cap:sync:ios
# For web:
vercel --prod
```

---

## 🧪 Testing Checklist

### Age Verification Flow
- [ ] Fresh install → age gate appears immediately
- [ ] Enter DOB under 13 → "Access Denied" message
- [ ] Enter DOB 13+ → consent step appears
- [ ] Try to bypass via back button → stays on gate
- [ ] Check consent box → Continue button enables
- [ ] Complete flow → app content visible

### Data Persistence
- [ ] Close app and reopen → doesn't show gate again
- [ ] Clear app storage → gate reappears
- [ ] Check Supabase: profile has age_verified=true, timestamp stored

### Route Protection
- [ ] Try to access /dashboard directly without verification → redirected
- [ ] Try to access /profile without verification → redirected
- [ ] Public pages (/terms, /privacy) work without verification

### Re-Consent on Version Update
- [ ] Update CURRENT_APP_VERSION in useAgeVerification.ts
- [ ] Reopen app → re-consent screen appears
- [ ] Complete flow → continues normally

---

## 📱 COPPA Compliance Notes

### What We Collect (13+ Users Only)
- Date of birth (stored only if 13+)
- Consent timestamp
- App version at consent

### What We DON'T Collect (Under 13)
- No date of birth stored
- No profile data
- No usage analytics
- Complete access block

### Parental Rights
- Under-13 users cannot create accounts
- If a parent contacts you about data, use the `clearVerification()` function

---

## 🔧 Configuration

### Update App Version (for re-consent)
Edit `hooks/useAgeVerification.ts`:
```typescript
const CURRENT_APP_VERSION = '1.0.1' // Increment when terms change
```

### Modify Terms Links
Edit `components/AgeGate.tsx`:
```typescript
<Link href="/terms" ...>
<Link href="/privacy" ...>
```

### Custom Age Requirement
Edit `components/AgeGate.tsx` line ~70:
```typescript
return age >= 13 // Change to 16 or 18 if needed
```

---

## 🐛 Troubleshooting

### Age gate not showing
- Check browser console for errors
- Verify Supabase connection
- Check localStorage/Preferences cleared

### Database errors
- Ensure SQL migration ran successfully
- Check RLS policies on profiles table
- Verify user_id matches auth.users.id

### Mobile app issues
- Ensure Capacitor Preferences plugin is installed
- Run `npx cap sync` after npm install
- Check iOS/Android console logs

---

## 📄 Files Modified/Created

```
urepp/
├── sql/
│   └── add_age_verification.sql    (NEW)
├── hooks/
│   └── useAgeVerification.ts       (NEW)
├── components/
│   ├── AgeGate.tsx                 (NEW)
│   ├── AgeVerificationWrapper.tsx  (NEW)
│   └── AppInit.tsx                 (MODIFIED - no changes needed)
├── app/
│   ├── layout.tsx                  (MODIFIED - added wrapper)
│   └── age-verification/
│       └── page.tsx                (NEW)
├── middleware.ts                  (MODIFIED - added age checks)
└── AGE_VERIFICATION_SETUP.md      (THIS FILE)
```

---

## 📝 Legal Disclaimer

This implementation provides a foundation for COPPA compliance but:
- Review with legal counsel before production
- Ensure your Terms of Service and Privacy Policy are COPPA-compliant
- Implement parental consent mechanism if collecting data from 13-17 year olds
- Document your data retention and deletion policies

---

Built by Agent Alex 🦊 | Report-only mode compliance