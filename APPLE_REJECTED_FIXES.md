# Apple Rejection Fixes - April 11, 2026

## Issues Found:

### 1. ✅ 2.1(a) - Camera Crash (FIXED)
**Problem:** App crashed when tapping "Take Photo"
**Fix:** Added Info.plist permissions:
- NSCameraUsageDescription
- NSPhotoLibraryUsageDescription
- NSPhotoLibraryAddUsageDescription

### 2. ❌ 2.3.2 - Duplicate Promotional Images
**Problem:** Same image used for monthly AND yearly subscriptions
**Fix:** Create unique images for each:
- Monthly: Blue themed "UREPP Premium Monthly"
- Yearly: Gold themed "UREPP Premium Yearly"

### 3. ⚠️ 2.1(b) - IAP Bug (Expected in sandbox)
**Problem:** "Error message displayed when tapping Subscribe"
**Note:** This is the sandbox product not found error (6777003). Apple should test in production where products exist. Add a note in App Review Information.

### 4. ❌ 3.1.2(c) - Missing Terms & Privacy in App
**Problem:** No links to Terms of Use or Privacy Policy in the app itself
**Fix:** Add links in the subscription page

### 5. ❌ 1.5 - Support URL Not Working
**Problem:** https://www.urepp.app/ doesn't go to a support page
**Fix:** Need to create /support page on the website

### 6. ❌ 3.1.2(c) - Missing Subscription Details in App
**Problem:** Must show in the app:
- Title of subscription
- Length of subscription
- Price of subscription
- Links to privacy policy and Terms of Use
**Fix:** Add this info to subscription page

## Action Items:

### App Code Changes:
1. [ ] Add Terms & Privacy links to subscription page
2. [ ] Add subscription details (title, length, price) to subscription page
3. [ ] Create /support page

### App Store Connect:
1. [ ] Upload unique promotional images (monthly vs yearly)
2. [ ] Update Support URL to /support
3. [ ] Add note in App Review Information about sandbox IAP
