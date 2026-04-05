# iOS App Pull-to-Refresh Setup

## How it works

The `PullToRefreshContainer` component automatically detects if it's running on native iOS:
- **On web**: Renders as a normal `<div>` (no pull-to-refresh)
- **On iOS app**: Enables pull-to-refresh gestures

## Files Created

### Components (already in src/)
- `src/hooks/usePullToRefresh.ts` - Touch gesture detection
- `src/components/PullToRefreshContainer.tsx` - iOS-only pull-to-refresh wrapper

### iOS-Only Pages (in ios-pages/)
- `ios-pages/Home-ios.tsx` - Home page with pull-to-refresh

## To Enable Pull-to-Refresh in iOS App:

### Option 1: Replace page.tsx files (Recommended for testing)

Before building for iOS, copy the iOS version:

```bash
cd /Users/alexenright/.openclaw/workspace/urepp

# Backup current pages
cp app/page.tsx app/page.tsx.web-backup

# Replace with iOS version
cp ios-pages/Home-ios.tsx app/page.tsx

# Build for iOS
npm run build
npx cap sync ios
npx cap open ios
```

### Option 2: Use the component directly (Cleaner)

In any page that needs pull-to-refresh:

```tsx
import PullToRefreshContainer from '@/components/PullToRefreshContainer';

// Wrap your content:
<PullToRefreshContainer 
  onRefresh={async () => {
    // Your refresh logic here
    await fetchData();
  }}
  className="min-h-screen"
>
  {/* Your page content */}
</PullToRefreshContainer>
```

The component automatically detects iOS and only enables gestures there.

## Testing in Xcode

1. Replace page.tsx with iOS version (or wrap with PullToRefreshContainer)
2. Build: `npm run build`
3. Sync: `npx cap sync ios`
4. Open: `npx cap open ios`
5. Build to physical device
6. Pull down on the page to see refresh spinner

## To Restore Web Version:

```bash
cp app/page.tsx.web-backup app/page.tsx
npm run dev
```

## Notes

- Pull-to-refresh only works on **physical iOS devices**
- Simulator doesn't support touch gestures properly
- The component gracefully degrades to normal div on web
