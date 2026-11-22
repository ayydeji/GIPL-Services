"use client";

import { m } from "framer-motion";
import { BookServiceButton } from "@/components/BookServiceButton";
import { FreeConsultationButton } from "@/components/FreeConsultationButton";
import { headerLoad } from "@/lib/motion";

export function TopBar() {
  return (
    <m.div
      className="sticky top-0 z-30 hidden bg-paper/90 backdrop-blur-md sm:block"
      variants={headerLoad}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <span className="text-xl font-bold uppercase tracking-[-0.02em] text-espresso-900">
          GIPL
        </span>

        <div className="flex flex-row items-center gap-3">
          <BookServiceButton serviceKey="epc" size="lg" />
          <FreeConsultationButton size="lg" />
        </div>
      </div>
    </m.div>
  );
}
