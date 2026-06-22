"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { ServiceTierIllustration } from "@/components/ServiceTierIllustration";
import { isConsultationHref, openConsultationBooking } from "@/lib/cal-consultation";
import {
  OVER_200_LABEL,
  SERVICE_BOOKING_FALLBACK_HREF,
  serviceBookingConfig,
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

type ServicesBookButtonProps = {
  serviceKey: ServiceKey;
  menuAnchorRef: RefObject<HTMLElement | null>;
  className?: string;
};

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
    <m.li role="none" variants={itemVariants} className="min-w-0">
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
        className={`group flex cursor-pointer flex-col items-center gap-1.5 px-2 py-2.5 text-center transition-colors ${
          focused ? "bg-surface" : "hover:bg-surface/80"
        }`}
      >
        <span
          className={`flex h-9 w-11 shrink-0 items-center justify-center rounded-lg border bg-surface text-espresso-900/55 transition-[transform,border-color,color] duration-200 group-hover:border-bronze-500/40 group-hover:text-espresso-900/70 group-focus-visible:border-bronze-500/50 ${
            focused ? "border-bronze-500/40" : "border-espresso-900/10"
          } ${reducedMotion ? "" : "group-hover:scale-[1.04]"}`}
        >
          <ServiceTierIllustration variant={tier.illustration} className="h-6 w-8" />
        </span>
        <span className="min-w-0">
          <span className="block text-[12px] font-semibold leading-snug text-espresso-900 transition-colors group-hover:text-espresso-900">
            {tier.label}
          </span>
          <span className="mt-0.5 block text-[10px] leading-snug text-espresso-900/55 transition-colors group-hover:text-espresso-900/70">
            {tier.propertyHint}
          </span>
        </span>
      </a>
    </m.li>
  );
}

export function ServicesBookButton({
  serviceKey,
  menuAnchorRef,
  className = "",
}: ServicesBookButtonProps) {
  const config = serviceBookingConfig[serviceKey];
  const tiers = config.tiers;
  const label = config.triggerLabel;

  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
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
    void openConsultationBooking();
  }

  useEffect(() => {
    setMounted(true);
  }, []);

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

  function isInsideMenu(target: Node) {
    if (rootRef.current?.contains(target)) return true;
    if (menuAnchorRef.current?.contains(target)) return true;
    return false;
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!isInsideMenu(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

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
  }, [open, tiers.length, menuAnchorRef]);

  useEffect(() => {
    if (!open) return;
    const scope = menuAnchorRef.current ?? rootRef.current;
    const item = scope?.querySelector<HTMLElement>(`[data-index="${focusedIndex}"]`);
    item?.focus();
  }, [open, focusedIndex, menuAnchorRef]);

  const menuPanel = (
    <AnimatePresence>
      {open && (
        <m.div
          key={`${serviceKey}-services-dropdown`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={panelVariants}
          className="absolute bottom-0 left-1/2 z-[100] w-40 -translate-x-1/2"
        >
          <div className="overflow-hidden rounded-xl border border-espresso-900/10 bg-paper shadow-card">
            <m.ul
              id={menuId}
              role="menu"
              aria-labelledby={triggerId}
              variants={staggerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col divide-y divide-espresso-900/10"
            >
              {tiers.map((tier, index) => (
                <TierCell
                  key={tier.tierIndex}
                  tier={tier}
                  index={index}
                  focused={focusedIndex === index}
                  onFocus={() => setFocusedIndex(index)}
                  onSelect={closeMenu}
                  reducedMotion={reducedMotion}
                />
              ))}
            </m.ul>

            <m.div
              variants={footerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="border-t border-espresso-900/10 px-2 py-2 text-center"
            >
              <p className="text-[10px] leading-relaxed text-espresso-900/55">
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
  );

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggleOpen}
        className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-espresso-900 px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-espresso-800 ${
          open ? "ring-1 ring-bronze-500/30" : ""
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

      {mounted && menuAnchorRef.current
        ? createPortal(menuPanel, menuAnchorRef.current)
        : null}
    </div>
  );
}
