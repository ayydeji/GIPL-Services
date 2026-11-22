"use client";

import {
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";

type SectionEnterParallax = {
  ref: React.RefObject<HTMLElement | null>;
  headerY: MotionValue<number>;
  headerOpacity: MotionValue<number>;
  cardY: [MotionValue<number>, MotionValue<number>, MotionValue<number>];
  footnoteY: MotionValue<number>;
  footnoteOpacity: MotionValue<number>;
};

export function useSectionEnterParallax(): SectionEnterParallax {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.28"],
  });

  const headerY = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [72, 0],
  );
  const headerOpacity = useTransform(
    scrollYProgress,
    [0, 0.75],
    reducedMotion ? [1, 1] : [0, 1],
  );

  const card0Y = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [96, 0],
  );
  const card1Y = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [120, 0],
  );
  const card2Y = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [144, 0],
  );

  const footnoteY = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [36, 0],
  );
  const footnoteOpacity = useTransform(
    scrollYProgress,
    [0.4, 1],
    reducedMotion ? [1, 1] : [0, 1],
  );

  return {
    ref,
    headerY,
    headerOpacity,
    cardY: [card0Y, card1Y, card2Y],
    footnoteY,
    footnoteOpacity,
  };
}
