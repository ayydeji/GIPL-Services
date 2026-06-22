"use client";

import { m } from "framer-motion";
import { BookServiceButton } from "@/components/BookServiceButton";
import {
  bundleSavingLabel,
  bundleStartingPriceLabel,
  OVER_200_LABEL,
  packageCards,
  pricingTerms,
  serviceBundles,
  type PackageCard,
} from "@/lib/site-config";
import { useSectionEnterParallax } from "@/lib/use-section-enter-parallax";

function CheckIcon() {
  return (
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
  );
}

function PackageCardView({ card }: { card: PackageCard }) {
  const bundle = serviceBundles.find((b) => b.key === card.bundleKey)!;
  const highlighted = card.highlighted ?? false;

  return (
    <article
      className={`flex h-full flex-col rounded-[1.75rem] border bg-surface p-6 sm:p-7 ${
        highlighted
          ? "border-bronze-500 shadow-[0_0_0_1px_rgba(179,139,93,0.35)]"
          : "border-espresso-900/10"
      }`}
    >
      <div className="flex flex-col gap-5 border-b border-espresso-900/8 pb-6">
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
            highlighted
              ? "bg-bronze-500 text-paper"
              : "bg-paper text-espresso-900/70"
          }`}
        >
          {card.tag}
        </span>

        <div>
          <h3 className="text-2xl font-medium tracking-[-0.02em] text-espresso-900">
            {bundle.name}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-espresso-900/60">
            {card.description}
          </p>
        </div>

        <div>
          <p className="text-[2rem] font-medium leading-none tracking-[-0.03em] text-espresso-900">
            {bundleStartingPriceLabel(card.bundleKey)}
          </p>
          <p className="mt-2 text-xs font-medium text-bronze-600">
            {bundleSavingLabel(card.bundleKey)}
          </p>
          <p className="mt-1 text-xs text-espresso-900/45">Based on floor area</p>
        </div>

        <p className="text-sm leading-relaxed text-espresso-900/55">{card.audience}</p>

        <BookServiceButton
          bundleKey={card.bundleKey}
          longLabel
          fullWidth
          menuAlign="left"
          variant={highlighted ? "primary" : "outline"}
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 pt-6">
        {card.featureGroups.map((group) => (
          <div key={group.title}>
            <p className="text-sm font-semibold text-espresso-900">{group.title}</p>
            <ul className="mt-3 space-y-2.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-espresso-900/65"
                >
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="mt-auto pt-2 text-xs leading-relaxed text-espresso-900/45">
          Includes {bundle.includes.join(" + ")} · pricing by m² band
        </p>
      </div>
    </article>
  );
}

export function Packages() {
  const { ref, headerY, headerOpacity, cardY, footnoteY, footnoteOpacity } =
    useSectionEnterParallax();

  return (
    <section
      ref={ref}
      id="packages"
      className="relative overflow-hidden section-space scroll-mt-14 bg-paper sm:scroll-mt-16"
    >
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <m.div
          className="mx-auto max-w-3xl text-center"
          style={{ y: headerY, opacity: headerOpacity }}
        >
          <h2
            className="section-heading text-balance"
          >
            Bundle and save on every visit.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-espresso-900/60">
            Combine the services you need into one appointment. Same floor-area
            bands as individual bookings — with a fixed discount on every tier.
          </p>
        </m.div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-5 xl:gap-6">
          {packageCards.map((card, index) => (
            <m.div key={card.bundleKey} style={{ y: cardY[index] }}>
              <PackageCardView card={card} />
            </m.div>
          ))}
        </div>

        <m.p
          className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-espresso-900/45"
          style={{ y: footnoteY, opacity: footnoteOpacity }}
        >
          {pricingTerms[0]} Larger properties ({OVER_200_LABEL.toLowerCase()}) — book a free consultation.
        </m.p>
      </div>
    </section>
  );
}
