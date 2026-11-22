"use client";

import { m, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

type SectionRevealProps = {
  variants?: Variants;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function SectionReveal({
  variants = fadeUp,
  children,
  className,
  id,
}: SectionRevealProps) {
  const { ref, state } = useScrollReveal<HTMLDivElement>();

  return (
    <m.div
      ref={ref}
      className={className}
      id={id}
      variants={variants}
      initial="hidden"
      animate={state}
    >
      {children}
    </m.div>
  );
}
