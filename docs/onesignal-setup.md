# OneSignal Push Notification Integration

## Configuration
- **App ID:** 209456e7-6318-4254-aad7-54df0d7198f4
- **Bundle ID:** com.urepp.app

## Setup Steps

### 1. Install Plugin
```bash
npm install onesignal-cordova-plugin
npx cap sync
```

### 2. iOS Configuration
Already configured in Xcode:
- Push Notifications capability enabled
- Background Modes: Remote notifications enabled
- .p8 file uploaded to OneSignal

### 3. Initialize OneSignal
Add to your app initialization (see lib/onesignal.ts)

### 4. Test
- Build and run on device (simulator doesn't support push)
- Check OneSignal dashboard for subscribed users

## Sending Notifications
From OneSignal dashboard:
1. Go to Messages → New Push
2. Select audience
3. Compose message
4. Send

## API Usage (Optional)
To send notifications from server:
```javascript
import OneSignal from '@onesignal/node-onesignal';
```
