"use client";

import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";
import { BookServiceButton } from "@/components/BookServiceButton";
import { FreeConsultationButton } from "@/components/FreeConsultationButton";
import { navLinks } from "@/lib/site-config";
import {
  headerLoad,
  mobileMenuItem,
  mobileMenuPanel,
  mobileMenuStagger,
} from "@/lib/motion";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <m.header
      className="fixed inset-x-0 top-0 z-50 bg-paper/90 backdrop-blur-md"
      variants={headerLoad}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex h-14 items-center justify-end sm:h-16 sm:justify-center">
          <nav className="hidden sm:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-espresso-900/55 transition-colors hover:text-espresso-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex sm:hidden flex-col justify-center items-center gap-[5px] w-8 h-8"
          >
            <m.span
              className="block h-px w-5 bg-espresso-900 origin-center"
              animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            />
            <m.span
              className="block h-px w-5 bg-espresso-900"
              animate={open ? { opacity: 0, scaleX: 0.6 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            />
            <m.span
              className="block h-px w-5 bg-espresso-900 origin-center"
              animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="mobile-menu"
            className="sm:hidden max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t bg-paper"
            variants={mobileMenuPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <m.nav
              className="flex flex-col gap-4 px-5 pb-6 pt-4"
              variants={mobileMenuStagger}
            >
              {navLinks.map((link) => (
                <m.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-espresso-900/70 transition-colors hover:text-espresso-900"
                  variants={mobileMenuItem}
                >
                  {link.label}
                </m.a>
              ))}

              <m.div
                className="mt-2 flex flex-col gap-3 border-t border-espresso-900/10 pt-4"
                variants={mobileMenuItem}
              >
                <BookServiceButton
                  serviceKey="epc"
                  fullWidth
                  expandInline
                  menuAlign="left"
                  onTierSelect={() => setOpen(false)}
                />
                <FreeConsultationButton
                  className="w-full justify-center"
                  onActivate={() => setOpen(false)}
                />
              </m.div>
            </m.nav>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  );
}
