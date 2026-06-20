import { navLinks, siteConfig, services } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-paper text-espresso-900/65">
      {/* Main footer grid */}
      <div className="mx-auto max-w-[1400px] px-5 pt-[clamp(5rem,7vw,7.5rem)] pb-4 sm:px-8 sm:pb-6">
        <div className="grid justify-items-center gap-12 text-center sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <span className="text-xl font-bold tracking-[-0.02em] text-espresso-900">
              GIPL <span className="text-bronze-600">Services</span>
            </span>
            <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-espresso-900/55">
              {siteConfig.companyLegalName} — professional property marketing
              for landlords, agents, and homeowners across{" "}
              {siteConfig.serviceArea}.
            </p>
          </div>

          {/* Services */}
          <div>
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
          </div>

          {/* Contact */}
          <div>
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
          </div>

          {/* Navigate */}
          <div>
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
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center gap-3 border-t border-espresso-900/10 pt-8 text-center text-xs text-espresso-900/40">
          <p>
            © {year} {siteConfig.companyLegalName}. All rights reserved.
          </p>
          <p>{siteConfig.brandName} · EPC · 3D Tours · Photography</p>
        </div>
      </div>

      {/* Giant wordmark */}
      <div
        aria-hidden="true"
        className="footer-wordmark-wrap w-full px-5 pt-2 pb-6 sm:px-8 sm:pb-8"
      >
        <p className="footer-wordmark select-none text-center font-bold tracking-[-0.05em] text-espresso-900/20">
          GIPL Services
        </p>
      </div>
    </footer>
  );
}
