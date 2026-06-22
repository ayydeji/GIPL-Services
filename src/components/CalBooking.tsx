"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { m } from "framer-motion";
import { useEffect } from "react";
import { fadeUp } from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function CalBooking() {
  const { ref, state } = useScrollReveal<HTMLDivElement>();

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "15min" });
      cal("ui", {
        cssVarsPerTheme: {
          light: { "cal-brand": "#B38B5D" },
          dark:  { "cal-brand": "#FAF8F5" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <section id="book-consultation" className="section-space scroll-mt-14 bg-paper sm:scroll-mt-16">
      <m.div
        ref={ref}
        className="mx-auto max-w-[1400px] px-5 sm:px-8"
        variants={fadeUp}
        initial="hidden"
        animate={state}
      >
        <Cal
          namespace="15min"
          calLink="muhammad-kamal/15min"
          style={{ width: "100%", height: "100%", overflow: "scroll" }}
          config={{ layout: "month_view", useSlotsViewOnSmallScreen: "true" }}
        />
      </m.div>
    </section>
  );
}
