// Add this to your subscription page temporarily
useEffect(() => {
  console.log('Platform:', Capacitor.getPlatform());
  console.log('Is Native:', Capacitor.isNativePlatform());
  console.log('Is iOS Native:', isIOSNative());
}, []);
