"use client";

import { useCallback } from "react";
import { openConsultationBooking } from "@/lib/cal-consultation";
import { calConsultationConfig } from "@/lib/site-config";

type FreeConsultationButtonProps = {
  className?: string;
  size?: "sm" | "lg";
  onActivate?: () => void;
};

export function FreeConsultationButton({
  className = "",
  size = "sm",
  onActivate,
}: FreeConsultationButtonProps) {
  const onClick = useCallback(async () => {
    onActivate?.();
    await openConsultationBooking();
  }, [onActivate]);

  const sizeClass = size === "lg" ? "text-base" : "text-sm";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-center font-semibold text-espresso-900/70 transition-colors hover:text-espresso-900 sm:inline-flex sm:w-auto sm:shrink-0 ${sizeClass} ${className}`}
    >
      {calConsultationConfig.buttonText}
    </button>
  );
}
