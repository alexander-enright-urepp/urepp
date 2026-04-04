# UREPP iOS In-App Purchase Setup Guide

## Overview
Native iOS IAP for $10/month Premium subscriptions. Uses Apple's StoreKit directly - no Stripe in iOS app.

## Files Created

### Native iOS
- `ios/App/App/IAPPlugin.swift` - StoreKit bridge plugin

### Frontend
- `src/plugins/IAPPlugin.ts` - TypeScript bridge definitions
- `src/hooks/useIAP.ts` - React hook for IAP
- `src/components/iOSPremiumButton.tsx` - Premium button component

### Backend
- `app/api/validate-apple-receipt/route.ts` - Receipt validation API

## App Store Connect Setup Required

### 1. Create IAP Product
1. Go to App Store Connect → Your App → Features → In-App Purchases
2. Click "+" to create new product
3. Select "Auto-Renewable Subscription"
4. **Product ID:** `com.urepp.premium.monthly`
5. **Price:** $9.99/month
6. **Subscription Group:** Create "Premium" group
7. **Duration:** 1 Month

### 2. Configure Subscription
- Add reference name: "UREPP Premium Monthly"
- Set up localized display name: "UREPP Premium"
- Add description: "Unlock all premium features and themes"
- Add screenshot (required for review)

### 3. Generate Shared Secret
1. App Store Connect → App → Features → In-App Purchases
2. Click "App-Specific Shared Secret"
3. Generate and copy the secret

## Environment Variables

Add to `.env.local`:
```
APPLE_SHARED_SECRET=your_shared_secret_here
```

Add to Vercel production:
- `APPLE_SHARED_SECRET` (same value)

## Testing

### Local Testing
1. Build iOS app: `npx cap sync ios`
2. Open Xcode: `npx cap open ios`
3. Run on physical device (IAP doesn't work in simulator)
4. Use Sandbox Apple ID for testing

### Sandbox Testing
1. Create sandbox tester account in App Store Connect
2. Sign out of App Store on test device
3. IAP prompts will use sandbox automatically

## Flow

1. User taps "Upgrade" on iOS app
2. Component detects iOS native platform
3. Loads products from App Store
4. Shows native Apple purchase sheet
5. User confirms with Face ID/Touch ID
6. Receipt sent to backend
7. Backend validates with Apple servers
8. Supabase updated with premium status
9. User gets premium access

## App Store Guidelines Compliance

✅ **3.1.1** - Uses Apple IAP for digital goods
✅ **3.1.2** - No redirect to external payment (Stripe only on web)
✅ Shows native Apple purchase UI
✅ Receipt validation with Apple servers
✅ Proper sandbox/production environment detection

## Notes

- Product ID must match exactly: `com.urepp.premium.monthly`
- IAP only works on physical devices, not simulator
- Sandbox environment uses special test accounts
- Must complete App Store review before production IAP works
