/**
 * Pull-to-Refresh wrapper — provides native-feel pull-to-refresh on mobile.
 *
 * Uses the CSS overscroll-behavior approach combined with a state-based refresh
 * trigger. In Capacitor, the native WebView handles pull-to-refresh natively
 * on iOS; this component provides a cross-platform fallback with haptic feedback.
 */
import { useState, useCallback, useRef, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  /** Custom refresh threshold in px (default: 80) */
  threshold?: number;
  /** Whether pull-to-refresh is disabled */
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing || disabled) return;
    setRefreshing(true);
    try {
      // Haptic feedback on refresh start
      try { import('@/lib/capacitor').then(m => m.haptics.impact('medium')); } catch {}
      await onRefresh();
    } finally {
      setRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, refreshing, disabled]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    // Only trigger pull-to-refresh when scrolled to top
    const target = e.currentTarget;
    if (target.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || disabled) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      // Apply resistance — the farther you pull, the harder it gets
      const resisted = Math.min(delta * 0.4, threshold * 1.5);
      setPullDistance(resisted);
    }
  }, [threshold, disabled]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance >= threshold) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, handleRefresh]);

  return (
    <div
      className="relative overflow-y-auto hide-scrollbar"
      style={{ overscrollBehavior: disabled ? 'auto' : 'contain' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance, opacity: Math.min(pullDistance / threshold, 1) }}
      >
        <RefreshCw
          className={`h-5 w-5 text-brand-500 ${refreshing ? 'animate-spin' : ''}`}
          style={{ transform: `rotate(${(pullDistance / threshold) * 360}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}
