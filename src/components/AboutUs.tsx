import { siteConfig } from "@/lib/site-config";

export function AboutUs() {
  return (
    <section
      id="about"
      className="bg-paper"
    >
      <div className="mx-auto w-full max-w-[1400px] section-space px-5 sm:px-8">
        {/* Top row: label left, opening statement right */}
        <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
          {/* Left: section label */}
          <div className="sm:w-[30%] shrink-0">
            <h2
              className="section-heading leading-none"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Our Story
            </h2>
          </div>

          {/* Right: all copy */}
          <div className="flex flex-col gap-10 sm:flex-1">
            {/* Opening statement */}
            <p
              className="font-medium leading-[1.35] tracking-[-0.01em] text-espresso-900 text-balance"
              style={{ fontSize: "clamp(1.05rem, 1.6vw, 1.35rem)" }}
            >
              It started with a simple frustration: getting a property
              compliant, photographed, and market-ready meant calling three
              different companies and hoping they all showed up. We built{" "}
              {siteConfig.brandName} to fix that — one visit, everything handled,
              no chasing.
            </p>

            {/* Two-column supporting copy */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <p className="text-sm leading-relaxed text-espresso-900/60">
                Based across {siteConfig.serviceArea}, our team includes
                qualified Domestic Energy Assessors registered on the National
                EPC Register, alongside experienced property photographers and
                virtual-tour specialists. Every assessor is fully accredited and
                every certificate we issue is compliant, lodged, and sent to you
                the same day.
              </p>
              <p className="text-sm leading-relaxed text-espresso-900/60">
                We work with landlords, estate agents, and building managers who
                need things done properly — not just quickly. That means showing
                up on time, communicating clearly, and delivering work that
                holds up to scrutiny. We&rsquo;re just getting started, and
                we&rsquo;re building the property services team we always wished
                existed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
