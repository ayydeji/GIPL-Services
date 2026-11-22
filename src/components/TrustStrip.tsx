"use client";

import { m } from "framer-motion";
import { trustSignals } from "@/lib/site-config";
import { fadeUp } from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function TrustStrip() {
  const { ref, state } = useScrollReveal<HTMLElement>();

  return (
    <m.section
      ref={ref}
      aria-label="Trusted and accredited"
      className="border-y border-espresso-900/10 bg-paper"
      variants={fadeUp}
      initial="hidden"
      animate={state}
    >
      <div className="mx-auto max-w-[1400px] px-5 py-4 sm:px-8">
        <div className="trust-marquee">
          <div className="trust-marquee-track">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex shrink-0 items-center"
                aria-hidden={copy === 1}
              >
                {trustSignals.map((signal) => (
                  <span key={signal} className="flex shrink-0 items-center gap-10 pr-10">
                    <span className="whitespace-nowrap text-base font-semibold uppercase tracking-[-0.01em] text-espresso-900/70">
                      {signal}
                    </span>
                    <span
                      className="h-1 w-1 shrink-0 rounded-full bg-bronze-500/50"
                      aria-hidden="true"
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </m.section>
  );
}
