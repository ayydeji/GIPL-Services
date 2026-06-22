"use client";

import { BookServiceButton } from "@/components/BookServiceButton";

export function FloatingCta() {
  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7">
      <BookServiceButton
        serviceKey="epc"
        className="shadow-2xl transition-transform duration-300 hover:-translate-y-0.5"
        menuAlign="right"
      />
    </div>
  );
}
