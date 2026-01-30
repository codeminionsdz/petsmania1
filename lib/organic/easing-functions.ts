/**
 * Easing Functions for Natural Motion
 * Curves that create organic, flowing movement
 */

/**
 * Linear easing (for reference - not natural)
 */
export function easeLinear(t: number): number {
  return t
}

/**
 * Ease-in-out cubic (smooth acceleration and deceleration)
 */
export function easeCubicInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Ease-in-out quad (gentle curve)
 */
export function easeQuadInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/**
 * Ease-out cubic (quick start, smooth end)
 */
export function easeCubicOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Ease-in cubic (slow start, quick end)
 */
export function easeCubicIn(t: number): number {
  return t * t * t
}

/**
 * Ease-out sine (very smooth deceleration)
 */
export function easeSineOut(t: number): number {
  return Math.sin((t * Math.PI) / 2)
}

/**
 * Ease-in-out sine (gentle wave-like)
 */
export function easeSineInOut(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

/**
 * Ease-out elastic (bouncy ending)
 */
export function easeElasticOut(t: number): number {
  const c5 = (2 * Math.PI) / 4.5

  return t === 0
    ? 0
    : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * c5) + 1
}

/**
 * Ease-out back (slight overshoot)
 */
export function easeBackOut(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1

  return c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) + 1
}

/**
 * Ease-in-out back (springy)
 */
export function easeBackInOut(t: number): number {
  const c1 = 1.70158
  const c2 = c1 * 1.525

  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
}

/**
 * Custom ease-out exponential (smooth power curve)
 */
export function easeExpoOut(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Custom ease-in-out exponential (deep S-curve)
 */
export function easeExpoInOut(t: number): number {
  return t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2
}

/**
 * Spring-like ease with natural oscillation
 */
export function easeSpring(t: number, stiffness: number = 80): number {
  const dampingRatio = 0.6
  const omega = Math.sqrt(stiffness)
  const zeta = dampingRatio

  const x = t * omega
  const envelope = Math.exp(-zeta * x)
  const oscillation = Math.cos(omega * Math.sqrt(1 - zeta * zeta) * t)

  return 1 - envelope * oscillation
}

/**
 * Organic ease (smooth and natural)
 */
export function easeOrganic(t: number): number {
  // Combines sine and quadratic for very organic feel
  const sineComponent = Math.sin((t * Math.PI) / 2)
  const quadComponent = t * t
  return sineComponent * 0.6 + quadComponent * 0.4
}

/**
 * Ease map for string references
 */
export const easeMap: Record<string, (t: number) => number> = {
  linear: easeLinear,
  cubicInOut: easeCubicInOut,
  quadInOut: easeQuadInOut,
  cubicOut: easeCubicOut,
  cubicIn: easeCubicIn,
  sineOut: easeSineOut,
  sineInOut: easeSineInOut,
  elasticOut: easeElasticOut,
  backOut: easeBackOut,
  backInOut: easeBackInOut,
  expoOut: easeExpoOut,
  expoInOut: easeExpoInOut,
  organic: easeOrganic,
}

/**
 * Get easing function by name
 */
export function getEasingFunction(
  name: string
): (t: number) => number {
  return easeMap[name] || easeOrganic
}

/**
 * Create CSS easing string
 */
export function createCSSEasing(name: string): string {
  const easing: Record<string, string> = {
    linear: "linear",
    cubicInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    quadInOut: "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
    cubicOut: "cubic-bezier(0.215, 0.61, 0.355, 1)",
    cubicIn: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
    sineOut: "cubic-bezier(0.39, 0.575, 0.565, 1)",
    sineInOut: "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
    elasticOut:
      "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    backOut: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    expoOut: "cubic-bezier(0.19, 1, 0.22, 1)",
    organic: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  }

  return easing[name] || easing.organic
}

/**
 * Apply easing function to progress (0-1)
 */
export function applyEasing(
  progress: number,
  easingName: string
): number {
  const fn = getEasingFunction(easingName)
  return Math.min(1, Math.max(0, fn(progress)))
}
