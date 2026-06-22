"use client";

import { m } from "framer-motion";
import { siteConfig } from "@/lib/site-config";
import {
  fadeUpItem,
  fadeUpStagger,
  splitFromLeft,
  splitFromRight,
} from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function AboutUs() {
  const { ref, state } = useScrollReveal<HTMLDivElement>();

  return (
    <section id="about" className="bg-paper">
      <div className="mx-auto w-full max-w-[1400px] section-space px-5 sm:px-8">
        <m.div
          ref={ref}
          className="flex min-w-0 flex-col gap-10 overflow-x-clip sm:flex-row sm:gap-16"
          variants={fadeUpStagger}
          initial="hidden"
          animate={state}
        >
          <m.div className="min-w-0 sm:w-[30%] sm:shrink-0" variants={splitFromLeft}>
            <h2
              className="section-heading leading-none"
            >
              Our Story
            </h2>
          </m.div>

          <m.div className="flex min-w-0 flex-col gap-10 sm:flex-1" variants={fadeUpStagger}>
            <m.p
              className="font-medium leading-[1.35] tracking-[-0.01em] text-espresso-900 text-balance"
              style={{ fontSize: "clamp(1.05rem, 1.6vw, 1.35rem)" }}
              variants={splitFromRight}
            >
              It started with a simple frustration: getting a property
              compliant, photographed, and market-ready meant calling three
              different companies and hoping they all showed up. We built{" "}
              {siteConfig.brandName} to fix that — one visit, everything handled,
              no chasing.
            </m.p>

            <m.div
              className="grid grid-cols-1 gap-8 sm:grid-cols-2"
              variants={fadeUpStagger}
            >
              <m.p
                className="text-sm leading-relaxed text-espresso-900/60"
                variants={fadeUpItem}
              >
                Based across {siteConfig.serviceArea}, our team includes
                qualified Domestic Energy Assessors registered on the National
                EPC Register, alongside experienced property photographers and
                virtual-tour specialists. Every assessor is fully accredited and
                every certificate we issue is compliant, lodged, and sent to you
                the same day.
              </m.p>
              <m.p
                className="text-sm leading-relaxed text-espresso-900/60"
                variants={fadeUpItem}
              >
                We work with landlords, estate agents, and building managers who
                need things done properly — not just quickly. That means showing
                up on time, communicating clearly, and delivering work that
                holds up to scrutiny. We&rsquo;re just getting started, and
                we&rsquo;re building the property services team we always wished
                existed.
              </m.p>
            </m.div>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
