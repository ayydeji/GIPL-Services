"use client";

import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { BookServiceButton } from "@/components/BookServiceButton";
import { FreeConsultationButton } from "@/components/FreeConsultationButton";
import { HeroSeasonalBanner } from "@/components/HeroSeasonalBanner";
import { siteConfig } from "@/lib/site-config";
import { heroCanvas, heroCanvasMobile, heroHeadline, heroSubcopy } from "@/lib/motion";
import FloorPlanClient from "@/components/FloorPlanClient";

const MOBILE_MQ = "(max-width: 767px)";

export function HeroMotion() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <>
      <div className="mx-auto w-full max-w-[1400px] px-5 pt-14 sm:px-8 sm:pt-16 shrink-0">
        <div className="mb-4 flex justify-center sm:mb-7">
          <HeroSeasonalBanner />
        </div>
        <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
          <m.h1
            className="hero-headline max-w-[28ch] font-medium tracking-[-0.02em] leading-[1.1] text-espresso-900 text-balance"
            variants={heroHeadline}
            initial="hidden"
            animate="visible"
          >
            Your property, fully covered by{" "}
            <span className="text-bronze-500">GIPL Services.</span> EPC,
            virtual tours and floor plans in{" "}
            <span className="text-bronze-500">one visit.</span>
          </m.h1>

          <m.div
            className="hidden shrink-0 flex-col gap-3 self-start sm:mt-2 sm:flex sm:flex-row sm:items-center"
            variants={heroHeadline}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
          >
            <BookServiceButton serviceKey="epc" />
            <FreeConsultationButton />
          </m.div>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-[1400px] px-5 sm:px-8 flex-1 min-h-0">
        <m.div
          className="relative isolate z-0 w-full h-full overflow-hidden rounded-2xl"
          variants={isMobile ? heroCanvasMobile : heroCanvas}
          initial="hidden"
          animate="visible"
        >
          <FloorPlanClient staticCamera />
        </m.div>
      </div>

      <m.div
        className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 shrink-0"
        variants={heroSubcopy}
        initial="hidden"
        animate="visible"
      >
        <div className="py-12 sm:py-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-12">
          <p className="max-w-xl text-base leading-relaxed text-espresso-900/60">
            Accredited Energy Performance Certificates, immersive 3D virtual
            tours, and accurate floor plans for landlords, estate
            agents &amp; property managers across {siteConfig.serviceArea}.
          </p>
          <a
            href="#services"
            className="shrink-0 text-sm font-medium text-espresso-900/70 underline-offset-4 transition-colors hover:text-espresso-900 hover:underline"
          >
            Explore services &rarr;
          </a>
        </div>
      </m.div>
    </>
  );
}
