"use client";

import { BookServiceButton } from "@/components/BookServiceButton";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

export function Statement() {
  return (
    <section className="bg-paper py-24 sm:py-36">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <StaggerGroup>
          <StaggerItem>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-bronze-600">
              Our approach
            </p>
          </StaggerItem>
          <StaggerItem>
            <p
              className="mt-6 font-medium tracking-[-0.02em] leading-[1.15] text-espresso-900 text-balance"
              style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.75rem)" }}
            >
              We treat every property like it&apos;s going to market tomorrow —{" "}
              <span className="text-espresso-900/45">
                fast, accredited, and finished to a standard that wins enquiries and
                keeps you fully compliant.
              </span>
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
              <BookServiceButton serviceKey="epc" longLabel />
              <a
                href="#contact"
                className="text-sm font-medium text-espresso-900/70 underline-offset-4 transition-colors hover:text-espresso-900 hover:underline"
              >
                Get in touch
              </a>
            </div>
          </StaggerItem>
        </StaggerGroup>
      </div>
    </section>
  );
}
