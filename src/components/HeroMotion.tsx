"use client";

import { m } from "framer-motion";
import { siteConfig } from "@/lib/site-config";
import { heroHeadline, heroSubcopy } from "@/lib/motion";

export function HeroMotion() {
  return (
    <>
      <div className="mx-auto w-full max-w-[1400px] px-5 pt-8 sm:px-8 shrink-0">
        <m.h1
          className="hero-headline mt-7 max-w-[28ch] font-bold tracking-[-0.02em] leading-[1.1] text-espresso-900 text-balance"
          variants={heroHeadline}
          initial="hidden"
          animate="visible"
        >
          Your property,{" "}
          <span className="box-decoration-clone bg-green-200 px-1.5 text-espresso-900">
            fully covered.
          </span>{" "}
          EPC, virtual tours and floor plans in{" "}
          <span className="box-decoration-clone bg-green-200 px-1.5 text-espresso-900">
            one visit.
          </span>
        </m.h1>
      </div>

      <m.div
        className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 shrink-0"
        variants={heroSubcopy}
        initial="hidden"
        animate="visible"
      >
        <div className="py-12 sm:py-16">
          <p className="max-w-xl text-base leading-relaxed text-espresso-900/60">
            Accredited Energy Performance Certificates, immersive 3D virtual
<<<<<<< HEAD
            tours, accurate floor plans, and independent property inventories
            for landlords, estate agents &amp; property managers across{" "}
            {siteConfig.serviceArea}.
=======
            tours, and accurate floor plans for landlords, estate
            agents &amp; property managers across {siteConfig.serviceArea}.
>>>>>>> c3f0168a8f450a9ae1cfd1a1bd3994cc161f9461
          </p>
        </div>
      </m.div>
    </>
  );
}
