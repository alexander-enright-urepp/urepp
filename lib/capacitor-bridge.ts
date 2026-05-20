// Capacitor Bridge Injection
// This script enables Capacitor API when app is loaded from external URL

export function injectCapacitorBridge(): void {
  if (typeof window === 'undefined') return;
  
  // Check if already loaded
  if ((window as any).Capacitor) return;
  
  // Check if we're in a Capacitor WebView by looking for native bridge
  const isCapacitorWebView = () => {
    return (
      (window as any).webkit?.messageHandlers?.bridge ||
      (window as any).CapacitorNative ||
      navigator.userAgent.includes('Capacitor')
    );
  };
  
  if (!isCapacitorWebView()) return;
  
  // Wait for Capacitor to be injected by native side
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds
  
  const checkCapacitor = () => {
    if ((window as any).Capacitor) {
      console.log('[CapacitorBridge] Capacitor ready');
      return;
    }
    
    attempts++;
    if (attempts < maxAttempts) {
      setTimeout(checkCapacitor, 100);
    } else {
      console.warn('[CapacitorBridge] Capacitor not available after timeout');
    }
  };
  
  // Start checking
  checkCapacitor();
  
  // Also try immediate check in case it's already there
  if ((window as any).Capacitor) {
    console.log('[CapacitorBridge] Capacitor already available');
  }
}

// Auto-inject on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCapacitorBridge);
  } else {
    injectCapacitorBridge();
  }
}
