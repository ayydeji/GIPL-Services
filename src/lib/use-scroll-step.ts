"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Derives an active step index (0-based) from the vertical scroll position
 * of a track element relative to the viewport.
 *
 * The track is divided into `count` equal slices. As the user scrolls the
 * track's top edge from 0 → -(trackHeight - viewportHeight), the returned
 * index advances 0 → count-1.
 *
 * Uses rAF throttling and is reduced-motion safe (step changes still work;
 * only visual transitions are skipped in CSS/component code).
 */
export function useScrollStep(count: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafId = useRef<number>(0);

  const compute = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // How far the top edge has scrolled past the top of the viewport (negative = above).
    const scrolled = -rect.top;
    const trackH = rect.height;
    const viewH = window.innerHeight;
    // Scrollable distance is trackH - viewH (the sticky element stops when the
    // track bottom reaches the viewport bottom).
    const scrollable = Math.max(1, trackH - viewH);
    const progress = Math.min(1, Math.max(0, scrolled / scrollable));
    // Map progress to step index, clamping to [0, count-1].
    const raw = progress * count;
    const idx = Math.min(count - 1, Math.floor(raw));
    setActiveIndex(idx);
  }, [count]);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial compute
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [compute]);

  /**
   * Scroll so that `targetIndex` is the active step.
   * Centres the requested step's slice in the scrollable range.
   */
  const scrollToStep = useCallback(
    (targetIndex: number) => {
      const el = trackRef.current;
      if (!el) return;
      const trackH = el.getBoundingClientRect().height;
      const viewH = window.innerHeight;
      const scrollable = Math.max(1, trackH - viewH);
      const sliceH = scrollable / count;
      // Aim for the midpoint of the target slice.
      const targetScrolled = sliceH * (targetIndex + 0.5);
      const elTop = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elTop + targetScrolled, behavior: "smooth" });
    },
    [count],
  );

  return { trackRef, activeIndex, scrollToStep };
}
