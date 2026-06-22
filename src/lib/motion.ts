import type { Transition, Variants } from "framer-motion";

export const EASE_ENTER = [0.22, 1, 0.36, 1] as const;
export const EASE_EXIT = [0.4, 0, 0.8, 0.4] as const;

export const DURATION = {
  enter: 0.7,
  exit: 0.45,
  leaving: 0.35,
  stagger: 0.09,
  hero: 0.85,
  micro: 0.35,
} as const;

export const VIEWPORT_ENTER = {
  once: false,
  amount: 0.18,
  margin: "0px 0px -40px 0px",
} as const;

export const VIEWPORT_EXIT = {
  once: false,
  amount: 0.06,
} as const;

const enterTransition: Transition = {
  duration: DURATION.enter,
  ease: EASE_ENTER,
};

const leavingTransition: Transition = {
  duration: DURATION.leaving,
  ease: EASE_EXIT,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  leaving: {
    opacity: 0.35,
    y: 12,
    transition: leavingTransition,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: enterTransition,
  },
};

export const fadeUpStagger: Variants = {
  hidden: {},
  leaving: {
    transition: {
      staggerChildren: 0,
      staggerDirection: -1,
    },
  },
  visible: {
    transition: {
      staggerChildren: DURATION.stagger,
      delayChildren: 0.05,
    },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  leaving: {
    opacity: 0.35,
    y: 12,
    transition: leavingTransition,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: enterTransition,
  },
};

export const fadeInItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  leaving: {
    opacity: 0.35,
    y: 8,
    transition: leavingTransition,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_ENTER },
  },
};

export const trustSignalItem: Variants = {
  hidden: { opacity: 0, x: -12 },
  leaving: {
    opacity: 0.35,
    y: 8,
    x: 0,
    transition: leavingTransition,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.6, ease: EASE_ENTER },
  },
};

export const splitFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  leaving: {
    opacity: 0.35,
    x: -8,
    transition: leavingTransition,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: enterTransition,
  },
};

export const splitFromRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  leaving: {
    opacity: 0.35,
    x: 8,
    transition: leavingTransition,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: enterTransition,
  },
};

export const scaleReveal: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 12 },
  leaving: {
    opacity: 0.4,
    scale: 0.99,
    y: 8,
    transition: leavingTransition,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE_ENTER },
  },
};

export const headerLoad: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_ENTER },
  },
};

export const heroHeadline: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.hero, ease: EASE_ENTER },
  },
};

export const heroCanvas: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.hero, ease: EASE_ENTER, delay: 0.12 },
  },
};

export const heroSubcopy: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_ENTER, delay: 0.2 },
  },
};

export const personaContentEnter: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.micro, ease: EASE_ENTER },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: DURATION.micro, ease: EASE_EXIT },
  },
};

export const cardSwap: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_ENTER },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.25, ease: EASE_EXIT },
  },
};

export const wordmarkReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  leaving: {
    opacity: 0.2,
    y: 8,
    transition: { duration: 0.4, ease: EASE_EXIT },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE_ENTER, delay: 0.2 },
  },
};

export const mobileMenuPanel: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.45,
      ease: EASE_ENTER,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.32,
      ease: EASE_EXIT,
      when: "afterChildren",
    },
  },
};

export const mobileMenuStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const mobileMenuItem: Variants = {
  hidden: { opacity: 0, x: -10, y: -4 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.38, ease: EASE_ENTER },
  },
  exit: {
    opacity: 0,
    x: -6,
    y: -2,
    transition: { duration: 0.22, ease: EASE_EXIT },
  },
};

export type ScrollRevealState = "hidden" | "leaving" | "visible";
