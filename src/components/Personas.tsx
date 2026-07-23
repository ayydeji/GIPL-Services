"use client";

import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  personas,
  type Persona,
  type PersonaRecommendation,
  type ServiceKey,
} from "@/lib/site-config";
import { BookServiceButton } from "@/components/BookServiceButton";
import {
  fadeUpItem,
  fadeUpStagger,
  personaContentEnter,
  splitFromLeft,
} from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const DESKTOP_QUERY = "(min-width: 1024px)";

// Display order differs from the data array (Estate Agent → Landlord → Building
// Manager); we walk Landlord → Estate Agent → Building Manager.
const PERSONA_ORDER = ["landlords", "estate-agents", "building-managers"];
const orderedPersonas = PERSONA_ORDER.map((slug) =>
  personas.find((p) => p.slug === slug),
).filter(Boolean) as Persona[];

function isBookingRecommendation(
  rec: PersonaRecommendation,
): rec is { label: string; serviceKey: ServiceKey } {
  return "serviceKey" in rec;
}

// ---------------------------------------------------------------------------
// Segmented pill switcher
// ---------------------------------------------------------------------------

function PersonaSwitcher({
  orderIndex,
  onSelect,
}: {
  orderIndex: number;
  onSelect: (index: number) => void;
}) {
  const reduceMotion = useReducedMotion() ?? false;

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      onSelect((orderIndex + 1) % orderedPersonas.length);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      onSelect(
        (orderIndex - 1 + orderedPersonas.length) % orderedPersonas.length,
      );
    } else if (event.key === "Home") {
      event.preventDefault();
      onSelect(0);
    } else if (event.key === "End") {
      event.preventDefault();
      onSelect(orderedPersonas.length - 1);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Who we help"
      onKeyDown={handleKeyDown}
      className="inline-flex max-w-full flex-wrap gap-1 border border-espresso-900/15 bg-surface p-1"
    >
      {orderedPersonas.map((p, i) => {
        const isActive = i === orderIndex;
        return (
          <button
            key={p.number}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(i)}
            className={`relative cursor-pointer px-4 py-2.5 text-sm font-medium tracking-[-0.01em] transition-colors sm:px-6 sm:text-base ${
              isActive
                ? "text-espresso-900"
                : "text-espresso-900/55 hover:text-espresso-900/80"
            }`}
          >
            {isActive && (
              <m.span
                aria-hidden="true"
                layoutId="persona-pill"
                layout={!reduceMotion}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 34 }
                }
                className="absolute inset-0 bg-green-200"
              />
            )}
            <span className="relative z-10 whitespace-nowrap">
              {p.selectLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Description body (unchanged content, swaps per active role)
// ---------------------------------------------------------------------------

function PersonaContent({ persona }: { persona: Persona }) {
  return (
    <>
      <m.p
        className="max-w-2xl text-lg leading-relaxed text-espresso-900/70"
        variants={fadeUpItem}
      >
        {persona.intro}
      </m.p>

      <m.ul className="mt-8 space-y-5" variants={fadeUpStagger}>
        {persona.highlights.map((item) => (
          <m.li
            key={item.point}
            className="flex max-w-2xl items-start gap-3.5 text-base leading-relaxed text-espresso-900/65"
            variants={fadeUpItem}
          >
            <span
              aria-hidden="true"
              className="mt-2 h-2 w-2 shrink-0 rounded-full border border-espresso-900/30"
            />
            <span>
              <strong className="font-semibold text-espresso-900">
                {item.point}.
              </strong>{" "}
              {item.detail}
            </span>
          </m.li>
        ))}
      </m.ul>

      <m.div className="mt-10" variants={fadeUpItem}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-espresso-800/55">
          Recommendations
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {persona.recommended.map((rec) => {
            if (isBookingRecommendation(rec)) {
              return (
                <BookServiceButton
                  key={rec.label}
                  serviceKey={rec.serviceKey}
                  variant="outline"
                  compact
                />
              );
            }

            return (
              <a
                key={rec.label}
                href={rec.href}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-espresso-900/15 px-6 py-3 text-sm font-semibold text-espresso-900 transition-colors hover:border-bronze-500/60 hover:text-bronze-600"
              >
                {rec.label}
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
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
          })}
        </div>
      </m.div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main export — sticky scroll on desktop, tap-to-switch on mobile
// ---------------------------------------------------------------------------

export function Personas() {
  const { ref: revealRef, state } = useScrollReveal<HTMLDivElement>();
  const sectionRef = useRef<HTMLElement>(null);
  const [orderIndex, setOrderIndex] = useState(0);
  const isDesktopRef = useRef(false);

  const persona = orderedPersonas[orderIndex];
  const total = orderedPersonas.length;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Track desktop viewport so scroll-driving only runs where the frame pins.
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const update = () => {
      isDesktopRef.current = mql.matches;
    };
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Scroll progress → active role (desktop only).
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!isDesktopRef.current) return;
    const next = Math.min(total - 1, Math.max(0, Math.floor(value * total)));
    setOrderIndex((current) => (current === next ? current : next));
  });

  // Scroll the window so a given role's segment is centred within the track.
  const scrollToSegment = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section) return;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollRange = section.offsetHeight - window.innerHeight;
      const target = sectionTop + ((index + 0.5) / total) * scrollRange;
      window.scrollTo({ top: target, behavior: "smooth" });
    },
    [total],
  );

  const handleSelect = useCallback(
    (index: number) => {
      if (isDesktopRef.current) {
        scrollToSegment(index);
      } else {
        setOrderIndex(index);
      }
    },
    [scrollToSegment],
  );

  // Deep links: #who-<slug> selects that role (and scrolls into view).
  useEffect(() => {
    function applyHash() {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash.startsWith("who-")) return;
      const slug = hash.slice("who-".length);
      const index = orderedPersonas.findIndex((p) => p.slug === slug);
      if (index === -1) return;

      if (isDesktopRef.current) {
        setOrderIndex(index);
        // Wait a frame so layout is settled before measuring the track.
        requestAnimationFrame(() => scrollToSegment(index));
      } else {
        setOrderIndex(index);
        document
          .getElementById("who")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [scrollToSegment]);

  return (
    <section
      ref={sectionRef}
      id="who"
      className="relative bg-paper py-[clamp(5rem,7vw,7.5rem)] lg:h-[300vh] lg:py-0"
    >
      <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <m.div
            ref={revealRef}
            variants={fadeUpStagger}
            initial="hidden"
            animate={state}
          >
            <m.div variants={splitFromLeft}>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[clamp(1.6rem,3.2vw,2.75rem)] font-bold leading-[1.1] tracking-[-0.02em] text-espresso-900">
                  Who we{" "}
                  <span className="box-decoration-clone bg-green-200 px-1.5 text-espresso-900">
                    help
                  </span>
                </h2>
                <span
                  aria-hidden="true"
                  className="mt-1 hidden shrink-0 text-sm font-semibold tracking-[0.14em] text-espresso-900/35 lg:block"
                >
                  {String(orderIndex + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
              </div>

              <div className="mt-7">
                <PersonaSwitcher
                  orderIndex={orderIndex}
                  onSelect={handleSelect}
                />
              </div>
            </m.div>
          </m.div>

          <div className="mt-10 lg:min-h-[26rem]">
            <AnimatePresence mode="wait">
              <m.div
                key={persona.number}
                variants={personaContentEnter}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <m.div
                  variants={fadeUpStagger}
                  initial="hidden"
                  animate="visible"
                >
                  <PersonaContent persona={persona} />
                </m.div>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
