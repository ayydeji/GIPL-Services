"use client";

import { EPC_BOOKING_URL } from "@/lib/site-config";
import { useReveal } from "@/lib/use-reveal";

export function CtaBanner() {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <section id="contact" className="section-space bg-paper px-5 sm:px-8">
      <div
        ref={revealRef}
        className="reveal mx-auto flex max-w-[1400px] flex-col items-center rounded-[2rem] bg-tan-400 px-6 py-20 text-center sm:py-28"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-espresso-900/55">
          Ready when you are
        </p>
        <h2
          className="section-heading mt-5 max-w-[16ch] leading-[0.98]"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
        >
          Let&apos;s get your EPC sorted this week.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
        </div>
      </div>
    </section>
  );
}
