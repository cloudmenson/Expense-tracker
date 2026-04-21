"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  /** Target numeric value */
  target: number;
  /** Animation duration in ms (default 1200) */
  duration?: number;
  /** Delay before animation starts in ms (default 0) */
  delay?: number;
}

/**
 * Animates a number from 0 → target with easeOutCubic.
 * Re-runs whenever `target` changes.
 */
export function useCountUp({
  target,
  duration = 1200,
  delay = 0,
}: UseCountUpOptions): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    fromRef.current = 0; // always start from 0 on mount / target change

    const startAnimation = () => {
      startRef.current = null;

      const step = (timestamp: number) => {
        if (startRef.current === null) startRef.current = timestamp;
        const elapsed = timestamp - startRef.current;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCurrent(
          Math.round(fromRef.current + (target - fromRef.current) * eased),
        );

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setCurrent(target);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    };

    if (delay > 0) {
      const t = setTimeout(startAnimation, delay);
      return () => {
        clearTimeout(t);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    } else {
      startAnimation();
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
  }, [target, duration, delay]);

  return current;
}
