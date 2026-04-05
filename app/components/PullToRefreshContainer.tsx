'use client'

import { usePullToRefresh } from './usePullToRefresh';
import { Loader2, ArrowDown } from 'lucide-react';
import { ReactNode, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface PullToRefreshContainerProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
  pullIndicator?: ReactNode;
}

export default function PullToRefreshContainer({
  children,
  onRefresh,
  className = '',
  threshold = 80,
  pullIndicator
}: PullToRefreshContainerProps) {
  const isNativeiOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

  // If not on native iOS, just render children without pull-to-refresh
  if (!isNativeiOS) {
    return <div className={className}>{children}</div>;
  }

  const { 
    containerRef, 
    isPulling, 
    isRefreshing, 
    pullProgress, 
    pullDistance,
    handlers 
  } = usePullToRefresh({ onRefresh, threshold });

  // iOS-style elastic bounce effect
  const getTransform = () => {
    if (!isPulling && !isRefreshing) return 'translateY(0)';
    const distance = isRefreshing ? 60 : pullDistance;
    return `translateY(${distance}px)`;
  };

  const getOpacity = () => {
    if (isRefreshing) return 1;
    return Math.min(pullProgress * 2, 1);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto overscroll-y-contain ${className}`}
      style={{ WebkitOverflowScrolling: 'touch' }}
      {...handlers}
    >
      {/* Pull Indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-10"
        style={{
          transform: getTransform(),
          opacity: getOpacity(),
          transition: isPulling ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
        }}
      >
        {pullIndicator || (
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-3 mt-4">
            {isRefreshing ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <div
                style={{
                  transform: `rotate(${Math.min(pullProgress * 180, 180)}deg)`,
                  transition: isPulling ? 'none' : 'transform 0.3s ease-out'
                }}
              >
                <ArrowDown 
                  className={`w-6 h-6 transition-colors ${
                    pullProgress >= 1 ? 'text-blue-600' : 'text-gray-400'
                  }`} 
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: getTransform(),
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
