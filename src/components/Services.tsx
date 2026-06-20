"use client";

import { useRef, useEffect, useState } from "react";
import { services } from "@/lib/site-config";
import { useScrollStep } from "@/lib/use-scroll-step";
import ServiceVisualClient from "@/components/ServiceVisualClient";

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
  const isBooking = service.ctaHref.startsWith("http");
  return (
    <a
      href={service.ctaHref}
      target={isBooking ? "_blank" : undefined}
      rel={isBooking ? "noopener noreferrer" : undefined}
      className={`inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
        compact ? "mt-4 py-2.5" : "mt-7"
      } ${
        isBooking
          ? "bg-espresso-900 text-paper hover:bg-bronze-600"
          : "border border-espresso-900/15 text-espresso-900 hover:border-bronze-500/60 hover:text-bronze-600"
      }`}
    >
      {service.ctaLabel}
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2 6H10M10 6L7 3M10 6L7 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ compact = false }: { compact?: boolean }) {
  return (
    <h2
      className={`section-heading text-center whitespace-nowrap section-header-space ${
        compact ? "!mb-0" : ""
      }`}
      style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
    >
      Three services, one trusted partner.
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Desktop sticky stepper — header + nav + card pin together
// ---------------------------------------------------------------------------

function DesktopStepper() {
  const { trackRef, activeIndex, scrollToStep } = useScrollStep(services.length);

  const activeService = services[activeIndex];
  const posLabel = `${String(activeIndex + 1).padStart(2, "0")} / ${String(services.length).padStart(2, "0")}`;

  return (
    <div
      ref={trackRef}
      className="bg-paper"
      style={{ height: `${services.length * 100}dvh` }}
    >
      <div className="sticky top-14 sm:top-16 flex h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-paper sm:h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-4rem)]">
        {/* Section title — always visible while stepping through services */}
        <div className="relative z-10 mx-auto w-full max-w-[1400px] shrink-0 bg-paper px-5 pb-6 pt-0 sm:px-8">
          <SectionHeader compact />
        </div>

        {/* Nav + showcase card */}
        <div className="mx-auto flex min-h-0 flex-1 w-full max-w-[1400px] items-stretch justify-center gap-10 px-5 pb-6 sm:px-8 sm:pb-8">
          <nav className="flex w-52 shrink-0 flex-col gap-1" aria-label="Services">
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
            </nav>

            {/* Showcase card */}
            <div className="flex min-h-0 w-full max-w-96 flex-col xl:max-w-104">
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-surface">
                <div className="relative min-h-0 flex-1">
                  <ServiceVisualClient
                    active={activeService.visual}
                    fallbackSrc={activeService.image}
                    fallbackAlt={activeService.name}
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-paper/95 px-3.5 py-1.5 text-xs font-semibold text-espresso-900 shadow-sm">
                    {activeService.tag}
                  </span>
                </div>

                <div
                  key={activeService.id}
                  className="shrink-0 border-t border-espresso-900/8 px-5 py-4 sm:px-6"
                  style={{ animation: "card-in 0.4s ease both" }}
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
                  <Cta service={activeService} compact />
                </div>
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

function MobileStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio > 0.5) setActiveIndex(i);
        },
        { threshold: [0.5] },
      );
      obs.observe(card);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="flex flex-col gap-16">
      <div
        className="sticky top-4 z-10 rounded-2xl overflow-hidden bg-surface"
        style={{ height: "46vw", minHeight: 220, maxHeight: 380 }}
      >
        <ServiceVisualClient
          active={services[activeIndex].visual}
          fallbackSrc={services[activeIndex].image}
          fallbackAlt={services[activeIndex].name}
        />
        <span className="absolute left-4 top-4 rounded-full bg-paper/95 px-3.5 py-1.5 text-xs font-semibold text-espresso-900 shadow-sm">
          {services[activeIndex].tag}
        </span>
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

      {services.map((s, i) => (
        <article
          key={s.id}
          id={s.id}
          ref={(el) => { cardRefs.current[i] = el as HTMLDivElement | null; }}
          className="reveal"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-espresso-900/40">
            {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
          </p>
          <h3 className="mt-1 text-2xl font-medium tracking-[-0.01em] text-espresso-900">
            {s.name}
          </h3>
          <p className="mt-3 max-w-md text-base leading-relaxed text-espresso-900/65">
            {s.description}
          </p>
          <Benefits items={s.benefits} />
          <Cta service={s} />
        </article>
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
          <SectionHeader />
          <MobileStack />
        </div>
      </div>
    </section>
  );
}
