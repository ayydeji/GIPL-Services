"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { services, serviceStartingPriceLabel, type ServiceKey } from "@/lib/site-config";
import { useScrollStep } from "@/lib/use-scroll-step";
import { cardSwap, fadeUp } from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import ServiceVisualClient from "@/components/ServiceVisualClient";
import { BookServiceButton } from "@/components/BookServiceButton";
import { ServicesBookButton } from "@/components/ServicesBookButton";

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

type Service = (typeof services)[number];

function Benefits({ items, compact }: { items: string[]; compact?: boolean }) {
  return (
    <ul className={`space-y-2.5 ${compact ? "mt-3 space-y-1.5" : "mt-5"}`}>
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

function Cta({ service, compact }: { service: Service; compact?: boolean }) {
  return (
    <BookServiceButton
      serviceKey={service.key}
      compact={compact}
      className={compact ? "mt-4" : "mt-7"}
    />
  );
}

function StartingPriceBadge({ serviceKey }: { serviceKey: ServiceKey }) {
  return (
    <span className="absolute right-4 top-4 rounded-full bg-bronze-500 px-3.5 py-1.5 text-xs font-semibold text-paper shadow-sm">
      {serviceStartingPriceLabel(serviceKey)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ compact = false }: { compact?: boolean }) {
  const { ref, state } = useScrollReveal<HTMLDivElement>();

  return (
    <m.div
      ref={ref}
      className={`mx-auto w-full text-center section-header-space ${
        compact ? "!mb-0 !pb-2" : ""
      }`}
      variants={fadeUp}
      initial="hidden"
      animate={state}
    >
      <h2
        className="section-heading mx-auto w-full max-w-full text-balance lg:w-max lg:whitespace-nowrap lg:[text-wrap:nowrap]"
      >
        Three services, one trusted partner.
      </h2>
      <p
        className={`mx-auto max-w-2xl leading-relaxed text-espresso-900/60 ${
          compact ? "mt-3 text-sm" : "mt-5 text-base"
        }`}
      >
        EPC certificates, floor plans, and 3D virtual tours — each priced by
        property size, ready to book in one visit.
      </p>
    </m.div>
  );
}

// ---------------------------------------------------------------------------
// Desktop sticky stepper — header + nav + card pin together
// ---------------------------------------------------------------------------

function DesktopStepper() {
  const { trackRef, activeIndex, scrollToStep } = useScrollStep(services.length);
  const menuAnchorRef = useRef<HTMLDivElement>(null);

  const activeService = services[activeIndex];
  const posLabel = `${String(activeIndex + 1).padStart(2, "0")} / ${String(services.length).padStart(2, "0")}`;

  return (
    <div
      ref={trackRef}
      className="bg-paper"
      style={{ height: `${services.length * 100}dvh` }}
    >
      <div className="sticky top-14 sm:top-16 flex h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] flex-col bg-paper sm:h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-4rem)]">
        {/* Section title — always visible while stepping through services */}
        <div className="relative z-10 mx-auto w-full max-w-[1400px] shrink-0 bg-paper px-5 pb-2 pt-0 sm:px-8">
          <SectionHeader compact />
        </div>

        {/* Nav + showcase card */}
        <div className="relative z-20 mx-auto flex min-h-0 flex-1 w-full max-w-[1400px] items-stretch justify-center gap-10 overflow-visible px-5 pb-4 sm:px-8 sm:pb-5">
          <nav
            className="relative flex w-52 shrink-0 flex-col gap-1"
            aria-label="Services"
          >
              {services.map((s, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollToStep(i)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-espresso-900/5"
                        : "hover:bg-espresso-900/3"
                    }`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span
                      className={`h-5 w-0.5 shrink-0 rounded-full transition-all duration-300 ${
                        isActive ? "bg-bronze-500" : "bg-espresso-900/15"
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        isActive ? "text-espresso-900" : "text-espresso-900/40"
                      }`}
                    >
                      {s.name}
                    </span>
                  </button>
                );
              })}

              <div className="mt-5 flex items-center gap-2 px-3" aria-hidden="true">
                {services.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => scrollToStep(i)}
                    tabIndex={-1}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? "w-5 bg-espresso-900"
                        : "w-1.5 bg-espresso-900/20"
                    }`}
                    aria-label={`Go to ${s.name}`}
                  />
                ))}
              </div>

              <div
                ref={menuAnchorRef}
                className="relative mt-auto min-h-28 flex-1"
                aria-hidden="true"
              />
            </nav>

            {/* Showcase card */}
            <div className="flex min-h-[min(640px,calc(100dvh-10rem))] w-full max-w-96 flex-col self-stretch overflow-visible xl:max-w-104">
              <div className="flex min-h-0 flex-1 flex-col overflow-visible rounded-2xl bg-surface">
                <div className="relative min-h-[min(320px,42dvh)] flex-1 overflow-hidden">
                  <ServiceVisualClient
                    active={activeService.visual}
                    fallbackSrc={activeService.image}
                    fallbackAlt={activeService.name}
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-paper/95 px-3.5 py-1.5 text-xs font-semibold text-espresso-900 shadow-sm">
                    {activeService.tag}
                  </span>
                  <StartingPriceBadge serviceKey={activeService.key} />
                </div>

                <AnimatePresence mode="wait">
                  <m.div
                    key={activeService.id}
                    className="relative z-30 shrink-0 overflow-visible border-t border-espresso-900/8 px-5 py-4 sm:px-6"
                    variants={cardSwap}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-espresso-900/40">
                          {posLabel}
                        </p>
                        <h3 className="mt-0.5 text-lg font-medium tracking-[-0.01em] text-espresso-900">
                          {activeService.name}
                        </h3>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => scrollToStep(Math.max(0, activeIndex - 1))}
                          disabled={activeIndex === 0}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso-900/12 text-espresso-900/50 transition-colors hover:border-espresso-900/30 hover:text-espresso-900 disabled:pointer-events-none disabled:opacity-25"
                          aria-label="Previous service"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M8 6H4M4 6L6.5 3.5M4 6L6.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          onClick={() => scrollToStep(Math.min(services.length - 1, activeIndex + 1))}
                          disabled={activeIndex === services.length - 1}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso-900/12 text-espresso-900/50 transition-colors hover:border-espresso-900/30 hover:text-espresso-900 disabled:pointer-events-none disabled:opacity-25"
                          aria-label="Next service"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M4 6H8M8 6L5.5 3.5M8 6L5.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-espresso-900/65">
                      {activeService.description}
                    </p>
                    <Benefits items={activeService.benefits} compact />
                    <ServicesBookButton
                      serviceKey={activeService.key}
                      menuAnchorRef={menuAnchorRef}
                      className="mt-4"
                    />
                  </m.div>
                </AnimatePresence>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile stacked cards
// ---------------------------------------------------------------------------

function MobileServiceArticle({
  service,
  index,
  onActive,
}: {
  service: Service;
  index: number;
  onActive: (index: number) => void;
}) {
  const { ref, state } = useScrollReveal<HTMLElement>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onActive(index);
      },
      { threshold: 0.35, rootMargin: "-42% 0px -25% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index, onActive, ref]);

  return (
    <m.article
      ref={ref}
      id={service.id}
      className="scroll-mt-[calc(3.5rem+min(38vw,260px)+6rem)]"
      variants={fadeUp}
      initial="hidden"
      animate={state}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-espresso-900/40">
        {String(index + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
      </p>
      <h3 className="mt-1 text-2xl font-medium tracking-[-0.01em] text-espresso-900">
        {service.name}
      </h3>
      <p className="mt-3 max-w-md text-base leading-relaxed text-espresso-900/65">
        {service.description}
      </p>
      <Benefits items={service.benefits} />
      <Cta service={service} />
    </m.article>
  );
}

function MobileStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const onActive = useCallback((index: number) => setActiveIndex(index), []);

  return (
    <div className="flex flex-col gap-12">
      <div className="sticky top-14 z-10 -mx-5 bg-paper px-5 pb-4 sm:-mx-8 sm:px-8">
        <SectionHeader compact />
        <div
          className="relative overflow-hidden rounded-2xl bg-surface"
          style={{ height: "38vw", minHeight: 180, maxHeight: 260 }}
        >
          <ServiceVisualClient
            active={services[activeIndex].visual}
            fallbackSrc={services[activeIndex].image}
            fallbackAlt={services[activeIndex].name}
          />
          <span className="absolute left-4 top-4 rounded-full bg-paper/95 px-3.5 py-1.5 text-xs font-semibold text-espresso-900 shadow-sm">
            {services[activeIndex].tag}
          </span>
          <StartingPriceBadge serviceKey={services[activeIndex].key} />
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5" aria-hidden="true">
            {services.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-5 bg-espresso-900" : "w-1.5 bg-espresso-900/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {services.map((s, i) => (
        <MobileServiceArticle key={s.id} service={s} index={i} onActive={onActive} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function Services() {
  return (
    <section id="services" className="section-space scroll-mt-14 bg-paper sm:scroll-mt-16">
      <div className="hidden lg:block">
        <DesktopStepper />
      </div>

      <div className="lg:hidden">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <MobileStack />
        </div>
      </div>
    </section>
  );
}
