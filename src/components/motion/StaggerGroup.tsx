"use client";

import { m, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUpItem, fadeUpStagger } from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  variants?: Variants;
};

export function StaggerGroup({
  children,
  className,
  variants = fadeUpStagger,
}: StaggerGroupProps) {
  const { ref, state } = useScrollReveal<HTMLDivElement>();

  return (
    <m.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={state}
    >
      {children}
    </m.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  variants?: Variants;
};

export function StaggerItem({
  children,
  className,
  variants = fadeUpItem,
}: StaggerItemProps) {
  return (
    <m.div className={className} variants={variants}>
      {children}
    </m.div>
  );
}
