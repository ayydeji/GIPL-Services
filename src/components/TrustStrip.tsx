import { trustSignals } from "@/lib/site-config";

export function TrustStrip() {
  return (
    <section className="border-y border-espresso-900/10 bg-paper">
      <div className="mx-auto max-w-[1400px] section-space-tight px-5 sm:px-8">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center lg:gap-12">
          <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-espresso-900/40">
            Trusted &amp; accredited
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            {trustSignals.map((signal) => (
              <span
                key={signal}
                className="text-base font-semibold tracking-[-0.01em] text-espresso-900/70"
              >
                {signal}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
