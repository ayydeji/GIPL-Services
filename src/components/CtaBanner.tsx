"use client";

import { m } from "framer-motion";
import { EPC_BOOKING_URL } from "@/lib/site-config";
import {
  fadeUpItem,
  fadeUpStagger,
  scaleReveal,
} from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function CtaBanner() {
  const { ref, state } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="contact" className="section-space bg-paper px-5 sm:px-8">
      <m.div
        ref={ref}
        className="mx-auto flex max-w-[1400px] flex-col items-center rounded-[2rem] bg-tan-400 px-6 py-20 text-center sm:py-28"
        variants={scaleReveal}
        initial="hidden"
        animate={state}
      >
        <m.div
          className="flex flex-col items-center"
          variants={fadeUpStagger}
          initial="hidden"
          animate={state}
        >
          <m.p
            className="text-xs font-semibold uppercase tracking-[0.16em] text-espresso-900/55"
            variants={fadeUpItem}
          >
            Ready when you are
          </m.p>
          <m.h2
            className="section-heading mt-5 max-w-[16ch] leading-[0.98]"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
            variants={fadeUpItem}
          >
            Let&apos;s get your EPC sorted this week.
          </m.h2>
          <m.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            variants={fadeUpItem}
          >
            <a
              href={EPC_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-espresso-900 px-8 py-4 text-base font-semibold text-paper transition-colors hover:bg-espresso-800"
            >
              Book an EPC Assessment
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#book-consultation"
              className="inline-flex items-center gap-2 rounded-full border border-espresso-900/20 bg-paper/60 px-8 py-4 text-base font-semibold text-espresso-900 transition-colors hover:border-espresso-900/35 hover:bg-paper"
            >
              Book a free consultation
            </a>
          </m.div>
        </m.div>
      </m.div>
    </section>
  );
}
