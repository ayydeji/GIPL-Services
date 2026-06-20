import { EPC_BOOKING_URL, siteConfig } from "@/lib/site-config";
import FloorPlanClient from "@/components/FloorPlanClient";

export function Hero() {
  return (
    <>
      {/* ── Full-viewport hero ─────────────────────────────────────── */}
      <section
        id="home"
        className="bg-paper flex flex-col"
        style={{ height: "100dvh", minHeight: "560px" }}
      >
        {/* Headline + CTA */}
        <div className="mx-auto w-full max-w-[1400px] px-5 pt-14 sm:px-8 sm:pt-16 shrink-0">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
            <h1
              className="max-w-[28ch] font-medium tracking-[-0.02em] leading-[1.1] text-espresso-900 text-balance"
              style={{ fontSize: "clamp(1.6rem, 3.2vw, 3.5rem)" }}
            >
              Your property, fully covered by{" "}
              <span className="text-bronze-500">GIPL Services.</span> EPC,
              virtual tours and photography in{" "}
              <span className="text-bronze-500">one visit.</span>
            </h1>

            <a
              href={EPC_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-espresso-900 px-7 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-bronze-600 sm:mt-2"
            >
              Book an EPC
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* Floor plan canvas — fills remaining viewport height */}
        <div className="mx-auto mt-8 w-full max-w-[1400px] px-5 sm:px-8 flex-1 min-h-0">
          <div className="relative w-full h-full overflow-hidden rounded-2xl">
            <FloorPlanClient />
          </div>
        </div>

        {/* Sub-headline */}
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 shrink-0">
          <div className="py-12 sm:py-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-12">
            <p className="max-w-xl text-base leading-relaxed text-espresso-900/60">
              Accredited Energy Performance Certificates, immersive 3D virtual
              tours, and magazine-standard photography for landlords, estate
              agents &amp; property managers across {siteConfig.serviceArea}.
            </p>
            <a
              href="#services"
              className="shrink-0 text-sm font-medium text-espresso-900/70 underline-offset-4 transition-colors hover:text-espresso-900 hover:underline"
            >
              Explore services &rarr;
            </a>
          </div>
        </div>
      </section>

    </>
  );
}
