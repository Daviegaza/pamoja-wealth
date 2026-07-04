/**
 * SwipeableRow — swipe left to reveal action buttons (edit, delete, archive).
 *
 * Native-feel gesture for list items on mobile. Uses CSS transforms for
 * 60fps performance. Provides haptic feedback when actions are revealed.
 */
import { useState, useRef, useCallback, type ReactNode } from 'react';

interface SwipeAction {
  label: string;
  icon?: ReactNode;
  color: 'danger' | 'primary' | 'warning' | 'neutral';
  onPress: () => void;
}

interface SwipeableRowProps {
  children: ReactNode;
  actions: SwipeAction[];
  /** Disable swipe for certain items */
  disabled?: boolean;
  /** Threshold to trigger full reveal (px, default: 80) */
  revealThreshold?: number;
}

const ACTION_COLORS: Record<string, string> = {
  danger: 'bg-red-500',
  primary: 'bg-brand-500',
  warning: 'bg-amber-500',
  neutral: 'bg-gray-400',
};

export function SwipeableRow({
  children,
  actions,
  disabled = false,
  revealThreshold = 80,
}: SwipeableRowProps) {
  const [translateX, setTranslateX] = useState(0);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const totalActionWidth = actions.length * 72; // each action button = 72px

  const reset = useCallback(() => {
    setTranslateX(0);
    currentX.current = 0;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    rowRef.current?.style.setProperty('transition', 'none');
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || disabled) return;
    const delta = startX.current - e.touches[0].clientX;
    // Only allow swipe left (positive delta)
    currentX.current = Math.max(0, Math.min(delta, totalActionWidth + 40));
    setTranslateX(-currentX.current);
  }, [disabled, totalActionWidth]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current || disabled) return;
    isDragging.current = false;
    rowRef.current?.style.removeProperty('transition');

    if (currentX.current > revealThreshold) {
      // Snap to fully revealed
      setTranslateX(-totalActionWidth);
      try { import('@/lib/capacitor').then(m => m.haptics.selectionChanged()); } catch {}
    } else {
      // Snap back
      reset();
    }
  }, [disabled, revealThreshold, totalActionWidth, reset]);

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons (behind the row) */}
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              action.onPress();
              reset();
              try { import('@/lib/capacitor').then(m => m.haptics.button()); } catch {}
            }}
            className={`${ACTION_COLORS[action.color]} flex items-center justify-center text-white font-medium text-xs touch-target`}
            style={{ width: 72 }}
          >
            <div className="flex flex-col items-center gap-0.5">
              {action.icon}
              {action.label}
            </div>
          </button>
        ))}
      </div>

      {/* Content row */}
      <div
        ref={rowRef}
        className="relative bg-white dark:bg-neutral-950 transition-transform duration-200"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
