"use client";

import { useCallback } from "react";
import { calConsultationConfig } from "@/lib/site-config";
import { openConsultationBooking } from "@/lib/cal-consultation";

type FreeConsultationButtonProps = {
  className?: string;
  onActivate?: () => void;
};

export function FreeConsultationButton({
  className = "",
  onActivate,
}: FreeConsultationButtonProps) {
  const onClick = useCallback(async () => {
    onActivate?.();
    await openConsultationBooking();
  }, [onActivate]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 cursor-pointer items-center rounded-full border border-espresso-900/15 px-7 py-3.5 text-sm font-semibold text-espresso-900 transition-colors hover:border-bronze-500/60 hover:text-bronze-600 ${className}`}
    >
      {calConsultationConfig.buttonText}
    </button>
  );
}
