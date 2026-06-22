"use client";

import { useEffect } from "react";
import {
  initConsultationCal,
  isConsultationHref,
  openConsultationBooking,
} from "@/lib/cal-consultation";

/** Preloads Cal.com and intercepts any legacy #book-consultation links. */
export function CalConsultationInit() {
  useEffect(() => {
    void initConsultationCal();

    async function handleClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest("a[href]");
      if (!link || !(link instanceof HTMLAnchorElement)) return;
      if (!isConsultationHref(link.getAttribute("href") ?? "")) return;

      event.preventDefault();
      await openConsultationBooking();
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
