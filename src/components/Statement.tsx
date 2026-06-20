"use client";

import { EPC_BOOKING_URL } from "@/lib/site-config";
import { useReveal } from "@/lib/use-reveal";

export function Statement() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <section className="bg-paper py-24 sm:py-36">
      <div ref={revealRef} className="reveal mx-auto max-w-4xl px-5 text-center sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-bronze-600">
          Our approach
        </p>
        <p
          className="mt-6 font-medium tracking-[-0.02em] leading-[1.15] text-espresso-900 text-balance"
          style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.75rem)" }}
        >
          We treat every property like it&apos;s going to market tomorrow —{" "}
          <span className="text-espresso-900/45">
            fast, accredited, and finished to a standard that wins enquiries and
            keeps you fully compliant.
          </span>
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <a
            href={EPC_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-espresso-900 px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-bronze-600"
          >
            Book an EPC Assessment
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href="#contact"
            className="text-sm font-medium text-espresso-900/70 underline-offset-4 transition-colors hover:text-espresso-900 hover:underline"
          >
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
