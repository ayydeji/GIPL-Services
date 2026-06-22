"use client";

import { m } from "framer-motion";
import { faqs } from "@/lib/site-config";
import { fadeUp, fadeUpItem, fadeUpStagger } from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function Faq() {
  const { ref, state } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="faq" className="section-space bg-paper">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <m.div
          ref={ref}
          className="mx-auto w-full max-w-3xl text-center"
          variants={fadeUpStagger}
          initial="hidden"
          animate={state}
        >
          <m.h2
            className="section-heading mb-12 sm:mb-14"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            variants={fadeUp}
          >
            FAQs
          </m.h2>

          <m.div
            className="border-t border-espresso-900/10 text-center"
            variants={fadeUpStagger}
          >
            {faqs.map((faq) => (
              <m.details
                key={faq.question}
                className="faq-item group border-b border-espresso-900/10"
                variants={fadeUpItem}
              >
                <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto_1fr] items-center gap-4 py-7 sm:py-8">
                  <span aria-hidden="true" />
                  <span className="text-lg font-medium leading-snug tracking-[-0.01em] text-espresso-900 text-balance sm:text-xl">
                    {faq.question}
                  </span>
                  <span
                    className="faq-chevron justify-self-end text-espresso-900/35 group-hover:text-espresso-900/55"
                    aria-hidden="true"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="faq-panel">
                  <div className="faq-panel-inner">
                    <div className="pb-8">
                      <p className="text-center text-base leading-relaxed text-espresso-900/60 sm:text-[1.05rem] sm:leading-[1.7]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </m.details>
            ))}
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
