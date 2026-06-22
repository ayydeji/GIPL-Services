"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { ServiceTierIllustration } from "@/components/ServiceTierIllustration";
import { isConsultationHref, openConsultationBooking } from "@/lib/cal-consultation";
import {
  OVER_200_LABEL,
  SERVICE_BOOKING_FALLBACK_HREF,
  bundleBookingConfig,
  serviceBookingConfig,
  type BundleKey,
  type ServiceBookingConfig,
  type ServiceBookingTier,
  type ServiceKey,
} from "@/lib/site-config";
import {
  epcDropdownFooter,
  epcDropdownFooterReduced,
  epcDropdownPanel,
  epcDropdownPanelReduced,
  epcDropdownStagger,
  epcDropdownStaggerReduced,
  epcTierItem,
  epcTierItemReduced,
} from "@/lib/motion";

export type BookServiceButtonProps = {
  variant?: "primary" | "outline";
  compact?: boolean;
  longLabel?: boolean;
  fullWidth?: boolean;
  menuAlign?: "left" | "right";
  expandInline?: boolean;
  onTierSelect?: () => void;
  className?: string;
} & (
  | { serviceKey: ServiceKey; bundleKey?: never }
  | { bundleKey: BundleKey; serviceKey?: never }
);

function tierHref(tier: ServiceBookingTier): string {
  return tier.calBookingUrl.trim() || SERVICE_BOOKING_FALLBACK_HREF;
}

function tierIsExternal(href: string): boolean {
  return href.startsWith("http");
}

function TierCell({
  tier,
  index,
  focused,
  onFocus,
  onSelect,
  reducedMotion,
}: {
  tier: ServiceBookingTier;
  index: number;
  focused: boolean;
  onFocus: () => void;
  onSelect: () => void;
  reducedMotion: boolean;
}) {
  const href = tierHref(tier);
  const external = tierIsExternal(href);
  const consultation = isConsultationHref(href);
  const itemVariants = reducedMotion ? epcTierItemReduced : epcTierItem;

  return (
    <m.li role="none" variants={itemVariants} className="min-w-0 sm:w-[8.75rem]">
      <a
        href={consultation ? "#" : href}
        role="menuitem"
        data-index={index}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={(event) => {
          if (consultation) {
            event.preventDefault();
            void openConsultationBooking().finally(onSelect);
            return;
          }
          onSelect();
        }}
        onFocus={onFocus}
        className={`group flex cursor-pointer flex-col items-center gap-2 px-3 py-3.5 text-center transition-colors sm:px-4 sm:py-4 max-sm:flex-row max-sm:items-center max-sm:gap-3 max-sm:px-4 max-sm:py-3 max-sm:text-left ${
          focused ? "bg-surface" : "hover:bg-surface/80"
        }`}
      >
        <span
          className={`flex h-11 w-14 shrink-0 items-center justify-center rounded-lg border bg-surface text-espresso-900/55 transition-[transform,border-color,color] duration-200 group-hover:border-bronze-500/40 group-hover:text-espresso-900/70 group-focus-visible:border-bronze-500/50 ${
            focused ? "border-bronze-500/40" : "border-espresso-900/10"
          } ${reducedMotion ? "" : "group-hover:scale-[1.04]"}`}
        >
          <ServiceTierIllustration variant={tier.illustration} className="h-7 w-9" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold leading-snug text-espresso-900 transition-colors group-hover:text-espresso-900">
            {tier.label}
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-espresso-900/55 transition-colors group-hover:text-espresso-900/70">
            {tier.propertyHint}
          </span>
        </span>
      </a>
    </m.li>
  );
}

export function BookServiceButton({
  serviceKey,
  bundleKey,
  variant = "primary",
  compact = false,
  longLabel = false,
  fullWidth = false,
  menuAlign = "right",
  expandInline = false,
  onTierSelect,
  className = "",
}: BookServiceButtonProps) {
  const bookingKey = serviceKey ?? bundleKey!;
  const config: ServiceBookingConfig = serviceKey
    ? serviceBookingConfig[serviceKey]
    : bundleBookingConfig[bundleKey!];
  const tiers = config.tiers;
  const label =
    longLabel && config.triggerLabelLong
      ? config.triggerLabelLong
      : config.triggerLabel;

  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const triggerId = useId();
  const reducedMotion = useReducedMotion() ?? false;

  const panelVariants = reducedMotion ? epcDropdownPanelReduced : epcDropdownPanel;
  const staggerVariants = reducedMotion ? epcDropdownStaggerReduced : epcDropdownStagger;
  const footerVariants = reducedMotion ? epcDropdownFooterReduced : epcDropdownFooter;

  function openConsultationFromMenu() {
    closeMenu();
    onTierSelect?.();
    void openConsultationBooking();
  }

  const alignClass = menuAlign === "left" ? "left-0" : "right-0";
  const caretAlignClass = menuAlign === "left" ? "left-6" : "right-6";

  function closeMenu() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function toggleOpen() {
    setOpen((wasOpen) => {
      if (!wasOpen) setFocusedIndex(0);
      return !wasOpen;
    });
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (!open) return;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((i) => (i + 1) % tiers.length);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((i) => (i - 1 + tiers.length) % tiers.length);
          break;
        case "Home":
          event.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          event.preventDefault();
          setFocusedIndex(tiers.length - 1);
          break;
        case "Tab":
          setOpen(false);
          break;
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, tiers.length]);

  useEffect(() => {
    if (!open) return;
    const item = rootRef.current?.querySelector<HTMLElement>(`[data-index="${focusedIndex}"]`);
    item?.focus();
  }, [open, focusedIndex]);

  const triggerClass =
    variant === "primary"
      ? "bg-espresso-900 text-paper hover:bg-espresso-800"
      : "border border-espresso-900/15 text-espresso-900 hover:border-bronze-500/60 hover:text-bronze-600";

  const sizeClass = compact ? "px-6 py-2.5" : "px-7 py-3.5";

  return (
    <div
      ref={rootRef}
      className={`relative shrink-0 ${fullWidth ? "w-full" : ""} ${className}`}
    >
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggleOpen}
        className={`${fullWidth ? "flex w-full justify-center" : "inline-flex shrink-0"} cursor-pointer items-center gap-2 rounded-full text-sm font-semibold transition-colors ${sizeClass} ${triggerClass} ${
          open && variant === "primary" ? "ring-1 ring-bronze-500/30" : ""
        }`}
      >
        {label}
        <svg
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          width="14"
          height="14"
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
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            key={`${bookingKey}-dropdown`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className={
              expandInline
                ? "relative z-50 mt-2 w-full"
                : `absolute top-[calc(100%+0.5rem)] z-50 w-max max-w-[min(100%,calc(100dvw-2.5rem))] sm:max-w-[min(100dvw-2.5rem,28rem)] ${alignClass}`
            }
          >
            {!expandInline && (
              <>
            <div
              className={`absolute -top-1.5 h-0 w-0 border-x-[6px] border-b-[6px] border-x-transparent border-b-paper ${caretAlignClass}`}
              aria-hidden="true"
            />
            <div
              className={`absolute -top-[7px] h-0 w-0 border-x-[6px] border-b-[6px] border-x-transparent border-b-espresso-900/10 ${caretAlignClass}`}
              aria-hidden="true"
            />
              </>
            )}

            <div className="overflow-hidden rounded-xl border border-espresso-900/10 bg-paper shadow-card">
              <m.ul
                id={menuId}
                role="menu"
                aria-labelledby={triggerId}
                variants={staggerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col divide-y divide-espresso-900/10 sm:flex-row sm:divide-x sm:divide-y-0"
              >
                {tiers.map((tier, index) => (
                  <TierCell
                    key={tier.tierIndex}
                    tier={tier}
                    index={index}
                    focused={focusedIndex === index}
                    onFocus={() => setFocusedIndex(index)}
                    onSelect={() => {
                      closeMenu();
                      onTierSelect?.();
                    }}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </m.ul>

              <m.div
                variants={footerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="border-t border-espresso-900/10 px-4 py-2.5 text-center"
              >
                <p className="text-[11px] leading-relaxed text-espresso-900/55">
                  Larger property ({OVER_200_LABEL.toLowerCase()})?{" "}
                  <button
                    type="button"
                    onClick={openConsultationFromMenu}
                    className="cursor-pointer font-medium text-espresso-900/70 underline-offset-2 transition-colors hover:text-bronze-600 hover:underline"
                  >
                    Book a free consultation
                  </button>
                </p>
              </m.div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** @deprecated Use BookServiceButton with serviceKey="epc" */
export function BookEpcButton(
  props: Omit<Extract<BookServiceButtonProps, { serviceKey: ServiceKey }>, "serviceKey">,
) {
  return <BookServiceButton serviceKey="epc" {...props} />;
}
