# GIPL Services — Marketing Website

Production-ready one-page marketing site for **Groove Park Investment
Limited (GIPL Services)** — built with Next.js (App Router), TypeScript,
and Tailwind CSS v4.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** (CSS-based theme — see `src/app/globals.css`)
- **Fraunces** (display serif) + **Inter** (body/UI), loaded via `next/font/google`

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build   # production build
npm run start   # serve the production build locally
npm run lint    # ESLint
```

## Project structure

```
src/
  app/
    layout.tsx        Root layout, fonts, SEO metadata, JSON-LD
    page.tsx           Assembles all sections
    globals.css        Tailwind v4 theme tokens (colors, fonts, shadows)
  components/
    Sidebar.tsx         Persistent sidebar nav (drawer on mobile)
    Hero.tsx             Hero section with illustrative listing-card visual
    Services.tsx         3D Tours / EPC / Photography service cards
    Pricing.tsx           Pricing cards (sourced from current public price list)
    About.tsx              Company overview + strengths
    QuoteForm.tsx            Quote request form (validation + submit handling)
    QuoteSection.tsx          Wraps QuoteForm with framing copy
    Contact.tsx                Contact details + embedded map
    FloatingCta.tsx             Fixed "Book Now" button
    Footer.tsx                   Footer
  lib/
    site-config.ts       Single source of truth for copy, contact info,
                          pricing, and placeholder URLs
    use-reveal.ts          Scroll-reveal IntersectionObserver hook
```

## ⚠️ Placeholders to replace before launch

Everything below is clearly marked with `PLACEHOLDER` comments in code.
Search the codebase for `PLACEHOLDER` to find every instance.

| Placeholder | Location | What to do |
|---|---|---|
| `BOOKING_FORM_URL` | `src/lib/site-config.ts` | Point at your real external booking form (Calendly, JotForm, etc). Used by the floating "Book Now" button. |
| `QUOTE_FORM_ENDPOINT` | `src/lib/site-config.ts` | Point at your form backend (Formspree, Getform, a custom API route, etc). Used by the quote request form on submit. |
| `mapEmbedSrc` | `src/lib/site-config.ts` | Currently embeds a generic central-London map. Replace with your real business location embed URL from Google Maps. |
| `address` | `src/lib/site-config.ts` | The source site only published a service area ("London & Kent"), not a street address. Add the real registered address. |
| Hero photo | `src/components/Hero.tsx` | Currently an Unsplash placeholder image clearly labelled as illustrative. Replace with real property photography. |
| 3D Virtual Tours pricing | `src/lib/site-config.ts` (`pricing` array) | No published pricing for this service exists on the source site — tiers currently read "Get a quote." Insert real figures once available. |
| Social links | `src/lib/site-config.ts` (`siteConfig.social`) | No social profiles were found on the source site. Footer currently reads "Social links coming soon." |
| `metadataBase` / canonical domain | `src/app/layout.tsx` | Update `https://www.gipl-services.co.uk` to the real production domain. |
| `email` | `src/lib/site-config.ts` | Source site displayed `contact@am-services.uk` publicly but linked a different placeholder mailbox internally. Confirm the real inbox before launch. |

Pricing for **Photography**, **EPC**, and the **discount/payment notes**
shown in the Pricing section is sourced directly from the current public
price list and is not invented.

## Deploying to Vercel

1. Push this project to a GitHub/GitLab/Bitbucket repo (or use the Vercel CLI directly).
2. Go to https://vercel.com/new and import the repo (or run `vercel` from this directory).
3. Framework preset: **Next.js** (auto-detected). No special build settings needed.
4. Add a custom domain once deployed, and update `metadataBase` in `src/app/layout.tsx` to match.
5. Replace the placeholders listed above before sharing the live link publicly.

## Notes

- All copy beyond the source site's published content (mission statement,
  "why choose us" framing, etc.) was written for this redesign — the
  source site's About page was a two-paragraph blurb.
- The floating "Book Now" button opens `BOOKING_FORM_URL` in a new tab.
- The quote form does client-side validation and posts a `FormData`
  payload to `QUOTE_FORM_ENDPOINT`; adjust the `fetch` call in
  `QuoteForm.tsx` if your chosen backend expects JSON instead.
