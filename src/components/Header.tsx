"use client";

import { useState } from "react";
import { navLinks, EPC_BOOKING_URL } from "@/lib/site-config";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex h-14 items-center justify-center sm:h-16">
          {/* Nav — centered */}
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

          {/* Mobile hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex sm:hidden flex-col justify-center items-center gap-[5px] w-8 h-8"
          >
            <span className={`block h-px w-5 bg-espresso-900 transition-transform origin-center ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-espresso-900 transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 bg-espresso-900 transition-transform origin-center ${open ? "translate-y-[-6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-espresso-900/8 bg-paper px-5 pb-6 pt-4">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base text-espresso-900/70 transition-colors hover:text-espresso-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href={EPC_BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-espresso-900 px-5 py-3 text-sm font-semibold text-paper"
          >
            Book an EPC
          </a>
        </div>
      )}
    </header>
  );
}
