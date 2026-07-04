/**
 * Motion token helpers.
 *
 * Framer Motion consumers can call `motion({ duration: getMotion("md") })`
 * to stay in sync with CSS tokens defined in globals.css. Values are read
 * once at import time from a mirror map so no runtime CSS parsing happens.
 *
 * CSS-side: use `transition: transform var(--motion-md) var(--ease-out);`.
 */

const DURATIONS = {
  xxs: 0.08,
  xs: 0.12,
  sm: 0.18,
  md: 0.26,
  lg: 0.4,
  xl: 0.6,
} as const;

const EASINGS = {
  "ease-out": [0.22, 1, 0.36, 1] as [number, number, number, number],
  "ease-in": [0.4, 0, 0.9, 0] as [number, number, number, number],
  "ease-in-out": [0.65, 0, 0.35, 1] as [number, number, number, number],
  "ease-spring": [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const;

export type Duration = keyof typeof DURATIONS;
export type Ease = keyof typeof EASINGS;

export function getMotion(name: Duration): number {
  return DURATIONS[name];
}

export function getEase(name: Ease): [number, number, number, number] {
  return EASINGS[name];
}

/**
 * Compose a Framer Motion transition config from tokens.
 *   transition={motionTransition("md", "ease-out")}
 */
export function motionTransition(
  duration: Duration = "md",
  ease: Ease = "ease-out",
): { duration: number; ease: [number, number, number, number] } {
  return { duration: getMotion(duration), ease: getEase(ease) };
}

/**
 * Standard fade-slide variant for AnimatePresence entries.
 */
export const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: motionTransition("sm", "ease-out"),
};
