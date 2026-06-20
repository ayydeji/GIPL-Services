"use client";

import { useEffect, useId, useRef, useState } from "react";
import { personas } from "@/lib/site-config";
import { useReveal } from "@/lib/use-reveal";

const DEFAULT_PERSONA_INDEX = personas.findIndex((p) => p.selectLabel === "Landlord");
const headingSize = "clamp(2rem, 4.5vw, 3.5rem)";

function PersonaSelect({
  selectedIndex,
  onChange,
}: {
  selectedIndex: number;
  onChange: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  useEffect(() => {
    setActiveIndex(selectedIndex);
  }, [selectedIndex]);

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
          setActiveIndex((i) => (i + 1) % personas.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setActiveIndex((i) => (i - 1 + personas.length) % personas.length);
          break;
        case "Home":
          event.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          event.preventDefault();
          setActiveIndex(personas.length - 1);
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
    setActiveIndex(index);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        id="persona-select"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((v) => !v)}
        className="section-heading inline-flex cursor-pointer items-center gap-3 rounded-full border border-espresso-900/20 bg-surface py-1 pr-4 pl-6 transition-colors hover:border-espresso-900/35"
        style={{ fontSize: headingSize }}
      >
        {personas[selectedIndex].selectLabel}
        <svg
          className={`shrink-0 text-espresso-900/50 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          width="20"
          height="20"
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
          className="absolute top-[calc(100%+0.5rem)] left-0 z-20 min-w-full overflow-hidden rounded-2xl border border-espresso-900/10 bg-paper py-1.5 shadow-card"
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
                onMouseEnter={() => setActiveIndex(i)}
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

export function Personas() {
  const revealRef = useReveal<HTMLDivElement>();
  const [selectedIndex, setSelectedIndex] = useState(
    DEFAULT_PERSONA_INDEX >= 0 ? DEFAULT_PERSONA_INDEX : 0,
  );
  const persona = personas[selectedIndex];

  return (
    <section id="who" className="section-space bg-paper">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div
          ref={revealRef}
          className="reveal grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-16 xl:gap-24"
        >
          {/* Left: section title */}
          <div className="lg:pt-2">
            <h2
              className="section-heading flex flex-wrap items-baseline gap-x-3 gap-y-2"
              style={{ fontSize: headingSize }}
            >
              <span>I am a</span>
              <PersonaSelect
                selectedIndex={selectedIndex}
                onChange={setSelectedIndex}
              />
            </h2>
          </div>

          {/* Right: details & recommendations */}
          <div key={persona.number} className="transition-opacity duration-300">
            <p className="text-lg leading-relaxed text-espresso-900/70">
              {persona.intro}
            </p>

            <ul className="mt-8 space-y-5">
              {persona.highlights.map((item) => (
                <li
                  key={item.point}
                  className="flex items-start gap-3.5 text-base leading-relaxed text-espresso-900/65"
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
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-espresso-800/55">
                Recommendations
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {persona.recommended.map((rec) => {
                  const isBooking = rec.href.startsWith("http");
                  return (
                    <a
                      key={rec.label}
                      href={rec.href}
                      target={isBooking ? "_blank" : undefined}
                      rel={isBooking ? "noopener noreferrer" : undefined}
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                        isBooking
                          ? "bg-espresso-900 text-paper hover:bg-bronze-600"
                          : "border border-espresso-900/20 text-espresso-900 hover:border-espresso-900/55"
                      }`}
                    >
                      {rec.label}
                      <svg
                        width="10"
                        height="10"
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
