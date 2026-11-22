"use client";

import { m } from "framer-motion";
import { useEffect, useState } from "react";
import {
  getHighlightedSeasonalPromotion,
  seasonalPromotionHref,
  type SeasonalPromotion,
} from "@/lib/site-config";
import { isConsultationHref, openCalBooking, openConsultationBooking } from "@/lib/cal-consultation";
import { heroHeadline } from "@/lib/motion";

export function HeroSeasonalBanner() {
  const [promo, setPromo] = useState<SeasonalPromotion | null>(null);

  useEffect(() => {
    setPromo(getHighlightedSeasonalPromotion());
  }, []);

  if (!promo) return null;

  const href = seasonalPromotionHref(promo);
  const consultation = isConsultationHref(href);
  const calBookingUrl = promo.calBookingUrl.trim();
  const opensModal = consultation || Boolean(calBookingUrl);

  return (
    <m.a
      href={opensModal ? "#" : href}
      onClick={
        opensModal
          ? (event) => {
              event.preventDefault();
              void (calBookingUrl
                ? openCalBooking(calBookingUrl)
                : openConsultationBooking());
            }
          : undefined
      }
      className="group inline-flex w-fit max-w-full items-center gap-x-2 rounded-full border border-bronze-600/25 bg-tan-400/85 px-3 py-1.5 shadow-sm transition-[background-color,border-color,box-shadow] hover:border-bronze-600/40 hover:bg-tan-400 hover:shadow-card sm:gap-x-4 sm:px-5 sm:py-2.5"
      variants={heroHeadline}
      initial="hidden"
      animate="visible"
      transition={{ delay: 0.04 }}
    >
      <span className="shrink-0 rounded-full bg-espresso-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-paper sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.14em]">
        {promo.badge}
      </span>

      <span className="text-xs font-semibold leading-snug text-espresso-900 sm:text-[15px]">
        {promo.headline}
      </span>

      <span className="hidden text-xs leading-snug text-espresso-900/70 sm:inline">
        {promo.detail}
      </span>

      <svg
        className="size-3 shrink-0 -rotate-90 text-bronze-700 transition-colors group-hover:text-espresso-900 sm:size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 9L12 15L18 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </m.a>
  );
}
