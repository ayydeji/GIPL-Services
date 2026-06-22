"use client";

import { m } from "framer-motion";
import { BookServiceButton } from "@/components/BookServiceButton";
import { FreeConsultationButton } from "@/components/FreeConsultationButton";
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
            variants={fadeUpItem}
          >
            Let&apos;s get your EPC sorted this week.
          </m.h2>
          <m.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            variants={fadeUpItem}
          >
            <BookServiceButton serviceKey="epc" longLabel />
            <FreeConsultationButton className="border-espresso-900/20 bg-paper/60 hover:border-espresso-900/35 hover:bg-paper" />
          </m.div>
        </m.div>
      </m.div>
    </section>
  );
}
