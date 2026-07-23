"use client";

import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  services,
  serviceStartingPriceLabel,
  type ServiceKey,
} from "@/lib/site-config";
import { fadeUp, mobileMenuPanel } from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import ServiceVisualClient from "@/components/ServiceVisualClient";
import { BookServiceButton } from "@/components/BookServiceButton";

type Service = (typeof services)[number];

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function Benefits({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((b) => (
        <li
          key={b}
          className="flex items-start gap-3 text-sm leading-relaxed text-espresso-900/65"
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-bronze-500"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 10.5L8 14.5L16 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {b}
        </li>
      ))}
    </ul>
  );
}

function PricePill({ serviceKey }: { serviceKey: ServiceKey }) {
  return (
    <span className="shrink-0 rounded-full bg-bronze-500 px-3 py-1 text-xs font-semibold text-paper">
      {serviceStartingPriceLabel(serviceKey)}
    </span>
  );
}

function ServiceModel({ service }: { service: Service }) {
  if (service.key === "epc") {
    return (
      <Image
        src={service.image}
        alt="Example EPC certificate"
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="origin-top scale-150 object-contain object-top pt-6"
      />
    );
  }

  if (service.key === "floor-plans") {
    return (
      <Image
        src={service.image}
        alt="Example floor plan"
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-contain p-4"
      />
    );
  }

  if (service.key === "virtual-tours") {
    return (
      <div className="h-full w-full p-6">
        <iframe
          src="https://www.madesnappy.co.uk/tour/1g477g206b7"
          title="3D virtual tour"
          className="h-full w-full border-0"
          allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <ServiceVisualClient
      active={service.visual}
      singleScene
      fallbackSrc={service.image}
      fallbackAlt={service.name}
    />
  );
}

/**
 * The stacked body shared by an open desktop panel and an expanded mobile card.
 * `overlayOptions` (desktop) floats the house-size tiers over the 3D model instead
 * of expanding inline, so the model keeps its full height; mobile expands inline
 * (its model is a fixed-aspect box, so pushing it down doesn't shrink it).
 */
function OpenServiceBody({
  service,
  overlayOptions = false,
}: {
  service: Service;
  overlayOptions?: boolean;
}) {
  return (
    <>
      <p className="max-w-xl text-sm leading-relaxed text-espresso-900/65">
        {service.description}
      </p>
      <Benefits items={service.benefits} />
      <BookServiceButton
        serviceKey={service.key}
        compact
        expandInline={!overlayOptions}
        menuAlign="left"
        className={overlayOptions ? "mt-5" : "mt-5 w-fit"}
      />
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`shrink-0 text-espresso-900/45 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      width="16"
      height="16"
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
  );
}

function SectionHeader() {
  const { ref, state } = useScrollReveal<HTMLDivElement>();

  return (
    <m.div
      ref={ref}
      className="section-header-space"
      variants={fadeUp}
      initial="hidden"
      animate={state}
    >
      <h2 className="text-[clamp(1.6rem,3.2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-espresso-900">
        <span className="box-decoration-clone bg-green-200 px-1.5 text-espresso-900">
          Services
        </span>{" "}
        we offer
      </h2>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-espresso-900/60">
        EPC certificates, floor plans, and 3D virtual tours — each priced by
        property size, ready to book in one visit.
      </p>
    </m.div>
  );
}

// ---------------------------------------------------------------------------
// Desktop — horizontal accordion
// ---------------------------------------------------------------------------

function DesktopAccordion({
  activeIndex,
  onOpen,
}: {
  activeIndex: number;
  onOpen: (index: number) => void;
}) {
  return (
    <div className="flex h-[clamp(30rem,72vh,44rem)] gap-3">
      {services.map((s, i) => {
        const isOpen = i === activeIndex;
        return (
          <div
            key={s.id}
            className="relative overflow-hidden border border-espresso-900/10 bg-surface"
            style={{
              flexGrow: isOpen ? 1 : 0,
              flexBasis: "5rem",
              transition: "flex-grow 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {isOpen ? (
              <div className="flex h-full min-w-[28rem] flex-col p-6 xl:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-espresso-900/40">
                      {s.tag}
                    </p>
                    <h3 className="mt-1 text-2xl font-medium tracking-[-0.01em] text-espresso-900">
                      {s.name}
                    </h3>
                  </div>
                  <PricePill serviceKey={s.key} />
                </div>

                <OpenServiceBody service={s} overlayOptions />

                <div className="relative mt-5 min-h-0 flex-1 overflow-hidden border border-espresso-900/8 bg-paper">
                  <ServiceModel service={s} />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpen(i)}
                aria-label={`Show ${s.name}`}
                className="group flex h-full w-full flex-col items-center justify-between py-6 transition-colors hover:bg-sand-200"
              >
                <span className="text-xs font-semibold tracking-[0.1em] text-espresso-900/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="rotate-180 whitespace-nowrap text-base font-semibold uppercase tracking-[0.2em] text-espresso-900/65 transition-colors [writing-mode:vertical-rl] group-hover:text-espresso-900">
                  {s.name}
                </span>
                <span className="whitespace-nowrap rounded-full bg-bronze-500/10 px-2.5 py-1 text-[10px] font-semibold text-bronze-600">
                  {serviceStartingPriceLabel(s.key)}
                </span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile — vertical accordion
// ---------------------------------------------------------------------------

function MobileAccordion({
  openIndex,
  onToggle,
}: {
  openIndex: number;
  onToggle: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {services.map((s, i) => {
        const isOpen = i === openIndex;
        return (
          <div
            key={s.id}
            className="overflow-hidden border border-espresso-900/10 bg-surface"
          >
            <button
              type="button"
              onClick={() => onToggle(i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="text-lg font-medium tracking-[-0.01em] text-espresso-900">
                {s.name}
              </span>
              <span className="flex items-center gap-3">
                <PricePill serviceKey={s.key} />
                <Chevron open={isOpen} />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  key="panel"
                  variants={mobileMenuPanel}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5">
                    <OpenServiceBody service={s} />
                    <div className="relative mt-4 aspect-[3/2] overflow-hidden border border-espresso-900/8 bg-paper">
                      <ServiceModel service={s} />
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function Services() {
  const [openIndex, setOpenIndex] = useState(0);

  useEffect(() => {
    function applyHash() {
      const hash = window.location.hash.replace(/^#/, "");
      const index = services.findIndex((s) => s.id === hash);
      if (index === -1) return;
      setOpenIndex(index);
      document
        .getElementById("services")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return (
    <section
      id="services"
      className="section-space scroll-mt-14 bg-paper sm:scroll-mt-8"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <SectionHeader />

        <div className="hidden lg:block">
          <DesktopAccordion
            activeIndex={openIndex < 0 ? 0 : openIndex}
            onOpen={setOpenIndex}
          />
        </div>

        <div className="lg:hidden">
          <MobileAccordion
            openIndex={openIndex}
            onToggle={(i) => setOpenIndex((cur) => (cur === i ? -1 : i))}
          />
        </div>
      </div>
    </section>
  );
}
