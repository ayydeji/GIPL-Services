"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export function CalBooking() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "coffee-w-abdullah" });
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
    <section className="section-space bg-paper">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <Cal
          namespace="coffee-w-abdullah"
          calLink="abdullahii/coffee-w-abdullah"
          style={{ width: "100%", height: "100%", overflow: "scroll" }}
          config={{ layout: "month_view", useSlotsViewOnSmallScreen: "true" }}
        />
      </div>
    </section>
  );
}
