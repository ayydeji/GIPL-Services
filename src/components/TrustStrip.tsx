"use client";

import { m } from "framer-motion";
import { trustSignals } from "@/lib/site-config";
import {
  fadeInItem,
  fadeUpStagger,
  trustSignalItem,
} from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function TrustStrip() {
  const { ref, state } = useScrollReveal<HTMLElement>();

  return (
    <m.section
      ref={ref}
      className="border-y border-espresso-900/10 bg-paper"
      variants={fadeUpStagger}
      initial="hidden"
      animate={state}
    >
      <div className="mx-auto max-w-[1400px] section-space-tight px-5 sm:px-8">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-12">
          <m.p
            className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-espresso-900/40"
            variants={fadeInItem}
          >
            Trusted &amp; accredited
          </m.p>
          <m.div
            className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4"
            variants={fadeUpStagger}
          >
            {trustSignals.map((signal) => (
              <m.span
                key={signal}
                className="text-base font-semibold tracking-[-0.01em] text-espresso-900/70"
                variants={trustSignalItem}
              >
                {signal}
              </m.span>
            ))}
          </m.div>
        </div>
      </div>
    </m.section>
  );
}
