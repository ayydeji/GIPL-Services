"use client";

import { m } from "framer-motion";
import { navLinks, siteConfig, services } from "@/lib/site-config";
import {
  fadeUpItem,
  fadeUpStagger,
  wordmarkReveal,
} from "@/lib/motion";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export function Footer() {
  const year = new Date().getFullYear();
  const { ref: footerRef, state: footerState } = useScrollReveal<HTMLElement>();
  const { ref: wordmarkRef, state: wordmarkState } = useScrollReveal<HTMLDivElement>();

  const wordmarkAnimate =
    footerState === "hidden"
      ? "hidden"
      : footerState === "leaving"
        ? "leaving"
        : wordmarkState === "visible"
          ? "visible"
          : "leaving";

  return (
    <m.footer
      ref={footerRef}
      className="bg-paper text-espresso-900/65"
      variants={fadeUpStagger}
      initial="hidden"
      animate={footerState}
    >
      <div className="mx-auto max-w-[1400px] px-5 pt-[clamp(5rem,7vw,7.5rem)] pb-4 sm:px-8 sm:pb-6">
        <m.div
          className="grid justify-items-center gap-12 text-center sm:grid-cols-2 lg:grid-cols-4"
          variants={fadeUpStagger}
        >
          <m.div variants={fadeUpItem}>
            <span className="text-xl font-bold tracking-[-0.02em] text-espresso-900">
              GIPL <span className="text-bronze-600">Services</span>
            </span>
            <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-espresso-900/55">
              {siteConfig.companyLegalName} — professional property marketing
              for landlords, agents, and homeowners across{" "}
              {siteConfig.serviceArea}.
            </p>
          </m.div>

          <m.div variants={fadeUpItem}>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-bronze-600">
              Services
            </h3>
            <ul className="space-y-3 text-sm">
              {services.map((s) => (
                <li key={s.key}>
                  <a
                    href={`#${s.id}`}
                    className="text-espresso-900/70 transition-colors hover:text-bronze-600"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>

          <m.div variants={fadeUpItem}>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-bronze-600">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={siteConfig.phoneHref}
                  className="text-espresso-900/70 transition-colors hover:text-bronze-600"
                >
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.emailHref}
                  className="break-all text-espresso-900/70 transition-colors hover:text-bronze-600"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="text-espresso-900/45">{siteConfig.address}</li>
            </ul>
          </m.div>

          <m.div variants={fadeUpItem}>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-bronze-600">
              Navigate
            </h3>
            <ul className="space-y-3 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-espresso-900/70 transition-colors hover:text-bronze-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>
        </m.div>

        <m.div
          className="mt-16 flex flex-col items-center gap-3 border-t border-espresso-900/10 pt-8 text-center text-xs text-espresso-900/40"
          variants={fadeUpItem}
        >
          <p>
            © {year} {siteConfig.companyLegalName}. All rights reserved.
          </p>
          <p>{siteConfig.brandName} · EPC · 3D Tours · Floor Plans</p>
        </m.div>
      </div>

      <m.div
        ref={wordmarkRef}
        aria-hidden="true"
        className="footer-wordmark-wrap w-full px-5 pt-2 pb-6 sm:px-8 sm:pb-8"
        variants={wordmarkReveal}
        initial="hidden"
        animate={wordmarkAnimate}
      >
        <p className="footer-wordmark select-none text-center font-bold tracking-[-0.05em] text-espresso-900/20">
          GIPL Services
        </p>
      </m.div>
    </m.footer>
  );
}
