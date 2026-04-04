'use client'

import { useState, useCallback, useRef, TouchEvent } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullProgress: number;
  pullDistance: number;
}

export function usePullToRefresh(options: UsePullToRefreshOptions) {
  const { onRefresh, threshold = 80, maxPullDistance = 120 } = options;
  
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullProgress: 0,
    pullDistance: 0
  });
  
  const touchStartY = useRef<number>(0);
  const currentPullDistance = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    // Only enable pull-to-refresh when at top of scroll
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) return;
    
    touchStartY.current = e.touches[0].clientY;
    setState(prev => ({ ...prev, isPulling: true }));
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!state.isPulling || state.isRefreshing) return;
    
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) {
      // Reset if scrolled down
      currentPullDistance.current = 0;
      setState(prev => ({ ...prev, pullDistance: 0, pullProgress: 0 }));
      return;
    }
    
    const touchY = e.touches[0].clientY;
    const pullDistance = Math.max(0, touchY - touchStartY.current);
    
    // Apply resistance - harder to pull as you go further
    const resistance = 0.4;
    const adjustedDistance = Math.min(pullDistance * resistance, maxPullDistance);
    
    currentPullDistance.current = adjustedDistance;
    const progress = Math.min(adjustedDistance / threshold, 1);
    
    setState(prev => ({
      ...prev,
      pullDistance: adjustedDistance,
      pullProgress: progress
    }));
    
    // Prevent default scrolling when pulling
    if (pullDistance > 0 && scrollTop === 0) {
      e.preventDefault();
    }
  }, [state.isPulling, state.isRefreshing, threshold, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!state.isPulling) return;
    
    const wasTriggered = currentPullDistance.current >= threshold;
    
    setState(prev => ({
      ...prev,
      isPulling: false,
      pullDistance: 0,
      pullProgress: 0,
      isRefreshing: wasTriggered
    }));
    
    currentPullDistance.current = 0;
    
    if (wasTriggered) {
      try {
        await onRefresh();
      } finally {
        setState(prev => ({ ...prev, isRefreshing: false }));
      }
    }
  }, [state.isPulling, threshold, onRefresh]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    try {
      await onRefresh();
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [onRefresh]);

  return {
    containerRef,
    ...state,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    },
    refresh
  };
}
