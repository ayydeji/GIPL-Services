"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { personas, type PersonaRecommendation, type ServiceKey } from "@/lib/site-config";
import { BookServiceButton } from "@/components/BookServiceButton";
import {
  fadeUpItem,
  fadeUpStagger,
  personaContentEnter,
  splitFromLeft,
} from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

const DEFAULT_PERSONA_INDEX = personas.findIndex((p) => p.selectLabel === "Landlord");
const selectSize = "clamp(1.35rem, 2.6vw, 2.35rem)";

function PersonaSelect({
  selectedIndex,
  onChange,
}: {
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [keyboardIndex, setKeyboardIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();
  const activeIndex = open ? keyboardIndex : selectedIndex;

  function toggleOpen() {
    setOpen((wasOpen) => {
      if (!wasOpen) setKeyboardIndex(selectedIndex);
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
        setOpen(false);
        return;
      }

      if (!open) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setKeyboardIndex((i) => (i + 1) % personas.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setKeyboardIndex((i) => (i - 1 + personas.length) % personas.length);
          break;
        case "Home":
          event.preventDefault();
          setKeyboardIndex(0);
          break;
        case "End":
          event.preventDefault();
          setKeyboardIndex(personas.length - 1);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          onChange(activeIndex);
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
  }, [open, activeIndex, onChange]);

  useEffect(() => {
    if (!open) return;
    const option = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    option?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function select(index: number) {
    onChange(index);
    setKeyboardIndex(index);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative w-fit max-w-full">
      <button
        type="button"
        id="persona-select"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={toggleOpen}
        className="inline-flex max-w-full cursor-pointer items-center gap-2.5 rounded-full border border-espresso-900/20 bg-surface px-5 py-3 font-medium leading-normal tracking-[-0.02em] text-ink whitespace-nowrap transition-colors hover:border-espresso-900/35"
        style={{ fontSize: selectSize }}
      >
        <span>{personas[selectedIndex].selectLabel}</span>
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
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby="persona-select"
          className="absolute top-[calc(100%+0.5rem)] left-0 z-20 w-full min-w-[12rem] overflow-hidden rounded-2xl border border-espresso-900/10 bg-paper py-1.5 shadow-card"
        >
          {personas.map((p, i) => {
            const isSelected = i === selectedIndex;
            const isActive = i === activeIndex;
            return (
              <li
                key={p.number}
                role="option"
                aria-selected={isSelected}
                data-index={i}
                onMouseEnter={() => setKeyboardIndex(i)}
                onClick={() => select(i)}
                className={`cursor-pointer px-5 py-2.5 text-base transition-colors ${
                  isActive
                    ? "bg-surface text-espresso-900"
                    : "text-espresso-900/70 hover:bg-surface/80 hover:text-espresso-900"
                } ${isSelected ? "font-semibold" : "font-normal"}`}
              >
                {p.selectLabel}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function isBookingRecommendation(
  rec: PersonaRecommendation,
): rec is { label: string; serviceKey: ServiceKey } {
  return "serviceKey" in rec;
}

function PersonaContent({ persona }: { persona: (typeof personas)[number] }) {
  return (
    <>
      <m.p
        className="text-lg leading-relaxed text-espresso-900/70"
        variants={fadeUpItem}
      >
        {persona.intro}
      </m.p>

      <m.ul className="mt-8 space-y-5" variants={fadeUpStagger}>
        {persona.highlights.map((item) => (
          <m.li
            key={item.point}
            className="flex items-start gap-3.5 text-base leading-relaxed text-espresso-900/65"
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
                />
              );
            }

            return (
              <a
                key={rec.label}
                href={rec.href}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-espresso-900/15 px-6 py-3 text-sm font-semibold text-espresso-900 transition-colors hover:border-bronze-500/60 hover:text-bronze-600"
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

export function Personas() {
  const { ref, state } = useScrollReveal<HTMLDivElement>();
  const [selectedIndex, setSelectedIndex] = useState(
    DEFAULT_PERSONA_INDEX >= 0 ? DEFAULT_PERSONA_INDEX : 0,
  );
  const persona = personas[selectedIndex];

  return (
    <section
      id="who"
      className="bg-paper pt-[clamp(5rem,7vw,7.5rem)] pb-[clamp(6.5rem,10vw,10rem)]"
    >
      <div className="mx-auto max-w-[1400px] overflow-x-clip px-5 sm:px-8">
        <m.div
          ref={ref}
          className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.35fr)] lg:gap-16 xl:gap-24"
          variants={fadeUpStagger}
          initial="hidden"
          animate={state}
        >
          <m.div className="lg:pt-1" variants={splitFromLeft}>
            <h2
              className="section-heading flex flex-wrap items-center gap-x-3 gap-y-2 leading-[1.1]"
            >
              <span className="shrink-0">I am a</span>
              <PersonaSelect
                selectedIndex={selectedIndex}
                onChange={setSelectedIndex}
              />
            </h2>
          </m.div>

          <div className="min-h-0">
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
                  animate={state === "visible" ? "visible" : "leaving"}
                >
                  <PersonaContent persona={persona} />
                </m.div>
              </m.div>
            </AnimatePresence>
          </div>
        </m.div>
      </div>
    </section>
  );
}
