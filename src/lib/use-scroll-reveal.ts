"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  VIEWPORT_ENTER,
  VIEWPORT_EXIT,
  type ScrollRevealState,
} from "@/lib/motion";

/**
 * Three-state scroll reveal: hidden → visible → leaving → hidden.
 * Enter at 18% visibility; partial fade at 6%; fully hidden when off-screen.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const enterInView = useInView(ref, VIEWPORT_ENTER);
  const exitInView = useInView(ref, VIEWPORT_EXIT);

  let state: ScrollRevealState = "hidden";
  if (!exitInView) {
    state = "hidden";
  } else if (enterInView) {
    state = "visible";
  } else {
    state = "leaving";
  }

  return { ref, state };
}
