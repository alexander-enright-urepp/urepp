import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

// Hook for native iOS pull-to-refresh
export const usePullToRefresh = (onRefresh: () => Promise<void> | void) => {
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    }
  }, [onRefresh]);

  useEffect(() => {
    // Only enable on iOS native
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      return;
    }

    // Add pull-to-refresh using native iOS UIRefreshControl
    const setupPullToRefresh = () => {
      // Listen for pull-to-refresh events from native layer
      window.addEventListener('ionRefresh', handleRefresh as EventListener);
      
      // Alternative: Use Capacitor plugin if available
      if ((window as any).Capacitor?.Plugins?.App) {
        // Native refresh handling
      }
    };

    setupPullToRefresh();

    return () => {
      window.removeEventListener('ionRefresh', handleRefresh as EventListener);
    };
  }, [handleRefresh]);

  return { refresh: handleRefresh };
};

// Simpler approach: Use CSS-based pull to refresh for web/hybrid
export const useNativePullToRefresh = (refreshCallback: () => Promise<void>) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      return;
    }

    // For native iOS, we'll add a simple touch handler
    let startY = 0;
    let isRefreshing = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if at top of page
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = async (e: TouchEvent) => {
      if (isRefreshing) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      
      // Pull down more than 100px from top
      if (window.scrollY === 0 && diff > 100 && startY > 0) {
        isRefreshing = true;
        
        // Show native loading indicator
        if ((window as any).cordova?.plugins?.spinnerDialog) {
          (window as any).cordova.plugins.spinnerDialog.show('Loading...', '');
        }
        
        await refreshCallback();
        
        // Hide loading indicator
        if ((window as any).cordova?.plugins?.spinnerDialog) {
          (window as any).cordova.plugins.spinnerDialog.hide();
        }
        
        startY = 0;
        
        // Debounce
        setTimeout(() => {
          isRefreshing = false;
        }, 1000);
      }
    };

    const handleTouchEnd = () => {
      startY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [refreshCallback]);
};

// CSS-based pull to refresh indicator
export const PullToRefreshIndicator = ({ isRefreshing }: { isRefreshing: boolean }) => {
  if (!isRefreshing) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-center py-4">
        <div className="w-6 h-6 border-2 border-babyblue-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-2 text-sm text-gray-600">Refreshing...</span>
      </div>
    </div>
  );
};
