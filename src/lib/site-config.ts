// Central configuration for site-wide content, contact details, and
// external links. Edit values here to update copy across the whole site.

export const CAL_USERNAME = "muhammad-kamal";

/** Build a Cal.com booking URL from an event slug. */
export function buildCalBookingUrl(slug: string): string {
  return `https://cal.com/${CAL_USERNAME}/${slug}`;
}

/**
 * Default EPC booking link (smallest tier).
 */
export const EPC_BOOKING_URL = buildCalBookingUrl("epc-up-to-100-m²");

export const JULY_COMPLETE_PROMO_BOOKING_URL = buildCalBookingUrl(
  "july-2026-intro-complete-package-up-to-100-m²",
);

export const calConsultationConfig = {
  namespace: "free-consultation",
  calLink: `${CAL_USERNAME}/free-consultation`,
  buttonText: "Free consultation",
  buttonColor: "#3D3126",
  buttonTextColor: "#FAF8F5",
  brandColor: "#B38B5D",
} as const;

export type PricingTier = {
  label: string;
  pricePence: number;
  priceDisplay: string;
  /** PLACEHOLDER — Cal.com event URL for this tier. Leave empty until events are created. */
  calBookingUrl: string;
};

export type ServicePricing = {
  key: ServiceKey;
  serviceName: string;
  tiers: PricingTier[];
  notes: string[];
  footnote?: string;
};

export type BundleKey = "essential" | "marketing" | "complete";

export type BundlePricing = {
  key: BundleKey;
  name: string;
  includes: string[];
  discountPence: number;
  tiers: PricingTier[];
};

/** Bundle discounts applied to the sum of component list prices at each tier. */
export const bundleDiscounts: Record<BundleKey, number> = {
  essential: 20_00,
  marketing: 35_00,
  complete: 50_00,
};

const CAL_PLACEHOLDER = "";

export const OVER_200_LABEL = "Over 200 m²";
export const OVER_200_CONSULTATION_HINT = "Free consultation";

function tier(
  label: string,
  pricePounds: number,
  calBookingUrl = CAL_PLACEHOLDER,
): PricingTier {
  return {
    label,
    pricePence: pricePounds * 100,
    priceDisplay: `£${pricePounds}`,
    calBookingUrl,
  };
}

export const pricing: ServicePricing[] = [
  {
    key: "epc",
    serviceName: "EPC Certificates",
    tiers: [
      tier("Up to 100 m²", 65, buildCalBookingUrl("epc-up-to-100-m²")),
      tier("101 – 150 m²", 75, buildCalBookingUrl("epc-101-150-m²")),
      tier("151 – 200 m²", 85, buildCalBookingUrl("epc-151-200-m²")),
      {
        label: "Over 200 m²",
        pricePence: 0,
        priceDisplay: OVER_200_CONSULTATION_HINT,
        calBookingUrl: CAL_PLACEHOLDER,
      },
    ],
    notes: [
      "Pricing is based on total internal floor area.",
      "Additional travel charges may apply outside our standard service area.",
    ],
  },
  {
    key: "floor-plans",
    serviceName: "Floor Plans",
    tiers: [
      tier("Up to 100 m²", 85, buildCalBookingUrl("floor-plan-up-to-100-m²")),
      tier("101 – 150 m²", 90, buildCalBookingUrl("floor-plan-101-150-m²")),
      tier("151 – 200 m²", 95, buildCalBookingUrl("floor-plan-151-200-m²")),
      {
        label: "Over 200 m²",
        pricePence: 0,
        priceDisplay: OVER_200_CONSULTATION_HINT,
        calBookingUrl: CAL_PLACEHOLDER,
      },
    ],
    notes: [
      "Includes measurement and production of a professional digital floor plan.",
      "Delivered in high-resolution format suitable for online and print marketing.",
      "Amendments due to client changes may incur additional charges.",
    ],
  },
  {
    key: "virtual-tours",
    serviceName: "3D Virtual Tours",
    tiers: [
      tier("Up to 100 m²", 150, buildCalBookingUrl("3d-virtual-tour-up-to-100-m²")),
      tier("101 – 150 m²", 250, buildCalBookingUrl("3d-virtual-tour-101-150-m²")),
      tier("151 – 200 m²", 300, buildCalBookingUrl("3d-virtual-tour-151-200-m²")),
      {
        label: "Over 200 m²",
        pricePence: 0,
        priceDisplay: OVER_200_CONSULTATION_HINT,
        calBookingUrl: CAL_PLACEHOLDER,
      },
    ],
    notes: [
      "Pricing includes on-site capture and virtual tour creation.",
      "Hosting period and platform terms may apply.",
      "Additional services such as Matterport floor plans, virtual staging, and drone photography are available on request.",
    ],
  },
];

export function serviceStartingPriceLabel(serviceKey: ServiceKey): string {
  const firstPaidTier = pricing.find((p) => p.key === serviceKey)?.tiers.find(
    (t) => t.pricePence > 0,
  );
  return firstPaidTier ? `From ${firstPaidTier.priceDisplay}` : "Contact for quote";
}

export const serviceBundles: BundlePricing[] = [
  {
    key: "essential",
    name: "Essential Package",
    includes: ["EPC", "Floor Plan"],
    discountPence: bundleDiscounts.essential,
    tiers: [
      tier("Up to 100 m²", 130, buildCalBookingUrl("essential-package-up-to-100-m²")),
      tier("101 – 150 m²", 145, buildCalBookingUrl("essential-package-101-150-m²")),
      tier("151 – 200 m²", 160, buildCalBookingUrl("essential-package-151-200-m²")),
      {
        label: "Over 200 m²",
        pricePence: 0,
        priceDisplay: OVER_200_CONSULTATION_HINT,
        calBookingUrl: CAL_PLACEHOLDER,
      },
    ],
  },
  {
    key: "marketing",
    name: "Marketing Package",
    includes: ["Floor Plan", "3D Virtual Tour"],
    discountPence: bundleDiscounts.marketing,
    tiers: [
      tier("Up to 100 m²", 200, buildCalBookingUrl("marketing-package-up-to-100-m²")),
      tier("101 – 150 m²", 305, buildCalBookingUrl("marketing-package-101-150-m²")),
      tier("151 – 200 m²", 360, buildCalBookingUrl("marketing-package-151-200-m²")),
      {
        label: "Over 200 m²",
        pricePence: 0,
        priceDisplay: OVER_200_CONSULTATION_HINT,
        calBookingUrl: CAL_PLACEHOLDER,
      },
    ],
  },
  {
    key: "complete",
    name: "Complete Property Package",
    includes: ["EPC", "Floor Plan", "3D Virtual Tour"],
    discountPence: bundleDiscounts.complete,
    tiers: [
      tier("Up to 100 m²", 250, buildCalBookingUrl("complete-package-up-to-100-m²")),
      tier("101 – 150 m²", 365, buildCalBookingUrl("complete-package-101-150-m²")),
      tier("151 – 200 m²", 430, buildCalBookingUrl("complete-package-151-200-m²")),
      {
        label: "Over 200 m²",
        pricePence: 0,
        priceDisplay: OVER_200_CONSULTATION_HINT,
        calBookingUrl: CAL_PLACEHOLDER,
      },
    ],
  },
];

export const pricingPromotions = [
  {
    key: "july-2026-complete-intro",
    name: "July 2026 intro offer — Complete Property Package",
    badge: "July offer",
    headline: "Complete property package for £200",
    detail: "EPC, floor plan & 3D tour · up to 100 m²",
    pricePence: 200_00,
    priceDisplay: "£200",
    scope: "Properties up to 100 m² only",
    activeFrom: "2026-07-01",
    activeUntil: "2026-07-31",
    highlightOnSite: true,
    calBookingUrl: JULY_COMPLETE_PROMO_BOOKING_URL,
  },
] as const;

export type SeasonalPromotion = (typeof pricingPromotions)[number];

export function getHighlightedSeasonalPromotion(
  now = new Date(),
): SeasonalPromotion | null {
  for (const promo of pricingPromotions) {
    if (!promo.highlightOnSite) continue;

    const until = new Date(`${promo.activeUntil}T23:59:59`);
    if (now > until) continue;

    return promo;
  }

  return null;
}

export function seasonalPromotionHref(promo: SeasonalPromotion): string {
  return promo.calBookingUrl.trim() || SERVICE_BOOKING_FALLBACK_HREF;
}

export const pricingTerms = [
  "All prices are subject to VAT where applicable.",
  "Payment is due upon agreement to complete work unless otherwise agreed.",
  "Cancellations made less than 24 hours before the appointment may be subject to a cancellation fee.",
  "Large portfolios and multiple property bookings may qualify for volume discounts.",
  "Custom quotations are available for commercial properties and specialist projects.",
  "For bookings and enquiries, please contact us for a personalised quotation.",
];

export type ServiceKey = "epc" | "virtual-tours" | "floor-plans";

export type ServiceIllustration = "compact" | "medium" | "large";

export type ServiceBookingTier = {
  tierIndex: number;
  label: string;
  propertyHint: string;
  /** PLACEHOLDER — Cal.com event URL for this tier. Leave empty until events are created. */
  calBookingUrl: string;
  illustration: ServiceIllustration;
};

/** @deprecated Use ServiceBookingTier */
export type EpcBookingTier = ServiceBookingTier;

/** @deprecated Use ServiceIllustration */
export type EpcIllustration = ServiceIllustration;

const SERVICE_TIER_META: { propertyHint: string; illustration: ServiceIllustration }[] = [
  { propertyHint: "Studio / 1-bed flat", illustration: "compact" },
  { propertyHint: "2–3 bed house", illustration: "medium" },
  { propertyHint: "4–5 bed house", illustration: "large" },
];

function buildServiceBookingTiers(serviceKey: ServiceKey): ServiceBookingTier[] {
  const tiers = pricing.find((p) => p.key === serviceKey)!.tiers;
  return tiers
    .filter((t) => t.pricePence > 0)
    .map((t, i) => ({
      tierIndex: i,
      label: t.label,
      propertyHint: SERVICE_TIER_META[i]!.propertyHint,
      calBookingUrl: t.calBookingUrl,
      illustration: SERVICE_TIER_META[i]!.illustration,
    }));
}

export type ServiceBookingConfig = {
  triggerLabel: string;
  triggerLabelLong?: string;
  tiers: ServiceBookingTier[];
};

export const serviceBookingConfig: Record<ServiceKey, ServiceBookingConfig> = {
  epc: {
    triggerLabel: "Book an EPC",
    triggerLabelLong: "Book an EPC Assessment",
    tiers: buildServiceBookingTiers("epc"),
  },
  "floor-plans": {
    triggerLabel: "Book a Floor Plan",
    triggerLabelLong: "Book a Floor Plan",
    tiers: buildServiceBookingTiers("floor-plans"),
  },
  "virtual-tours": {
    triggerLabel: "Book a 3D Tour",
    triggerLabelLong: "Book a 3D Virtual Tour",
    tiers: buildServiceBookingTiers("virtual-tours"),
  },
};

function buildBundleBookingTiers(bundleKey: BundleKey): ServiceBookingTier[] {
  const bundle = serviceBundles.find((b) => b.key === bundleKey)!;
  return bundle.tiers
    .filter((t) => t.pricePence > 0)
    .map((t, i) => ({
      tierIndex: i,
      label: t.label,
      propertyHint: SERVICE_TIER_META[i]!.propertyHint,
      calBookingUrl: t.calBookingUrl,
      illustration: SERVICE_TIER_META[i]!.illustration,
    }));
}

export const bundleBookingConfig: Record<BundleKey, ServiceBookingConfig> = {
  essential: {
    triggerLabel: "Book Essential",
    triggerLabelLong: "Book Essential Package",
    tiers: buildBundleBookingTiers("essential"),
  },
  marketing: {
    triggerLabel: "Book Marketing",
    triggerLabelLong: "Book Marketing Package",
    tiers: buildBundleBookingTiers("marketing"),
  },
  complete: {
    triggerLabel: "Book Complete",
    triggerLabelLong: "Book Complete Package",
    tiers: buildBundleBookingTiers("complete"),
  },
};

export function bundleStartingPriceLabel(bundleKey: BundleKey): string {
  const firstPaidTier = serviceBundles
    .find((b) => b.key === bundleKey)
    ?.tiers.find((t) => t.pricePence > 0);
  return firstPaidTier ? `From ${firstPaidTier.priceDisplay}` : "Contact for quote";
}

export function bundleSavingLabel(bundleKey: BundleKey): string {
  return `Save £${bundleDiscounts[bundleKey] / 100} vs booking separately`;
}

export type PackageCard = {
  bundleKey: BundleKey;
  tag: string;
  description: string;
  audience: string;
  highlighted?: boolean;
  featureGroups: { title: string; items: string[] }[];
};

export const packageCards: PackageCard[] = [
  {
    bundleKey: "essential",
    tag: "Compliance + layout",
    description: "EPC certificate and floor plan in a single visit.",
    audience: "Landlords and agents who need compliance and a clear layout fast.",
    featureGroups: [
      {
        title: "What's included",
        items: ["Accredited EPC certificate", "Professional digital floor plan"],
      },
      {
        title: "Why book together",
        items: [
          "One appointment, one team on site",
          "Fully compliant and listing-ready faster",
          "Fixed bundle discount on every tier",
        ],
      },
    ],
  },
  {
    bundleKey: "marketing",
    tag: "Listing ready",
    description: "Floor plan and immersive 3D tour for standout listings.",
    audience: "Agents and vendors who want stronger online engagement.",
    featureGroups: [
      {
        title: "What's included",
        items: ["Professional digital floor plan", "Immersive 3D virtual tour"],
      },
      {
        title: "Why book together",
        items: [
          "Remote viewing before the first viewing",
          "Rightmove and Zoopla-ready marketing assets",
          "Fixed bundle discount on every tier",
        ],
      },
    ],
  },
  {
    bundleKey: "complete",
    tag: "Full coverage",
    description: "EPC, floor plan and 3D tour — everything in one visit.",
    audience: "Anyone who wants the property fully compliant and market-ready at once.",
    highlighted: true,
    featureGroups: [
      {
        title: "What's included",
        items: [
          "Accredited EPC certificate",
          "Professional digital floor plan",
          "Immersive 3D virtual tour",
        ],
      },
      {
        title: "Why book together",
        items: [
          "Compliance and marketing handled together",
          "One visit instead of three separate bookings",
          "Our largest bundle saving on every tier",
        ],
      },
    ],
  },
];

/** @deprecated Use serviceBookingConfig.epc.tiers */
export const epcBookingTiers = serviceBookingConfig.epc.tiers;

/** Fallback when no Cal.com URL is set for a tier. */
export const SERVICE_BOOKING_FALLBACK_HREF = "#book-consultation";

/** @deprecated Use SERVICE_BOOKING_FALLBACK_HREF */
export const EPC_BOOKING_FALLBACK_HREF = SERVICE_BOOKING_FALLBACK_HREF;

/** @deprecated Use OVER_200_LABEL */
export const EPC_OVER_200_LABEL = OVER_200_LABEL;

export const siteConfig = {
  companyLegalName: "Grove Park Investment Limited",
  brandName: "GIPL Services",
  tagline: "EPC Certificates, 3D Virtual Tours & Floor Plans",
  phone: "07495 331 757",
  phoneHref: "tel:+447495331757",
  email: "muhammad@gipl.uk",
  emailHref: "mailto:muhammad@gipl.uk",
  address: "London & Kent, United Kingdom",
  serviceArea: "London & Kent",
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
  },
};

export function serviceOver200Href(): string {
  return SERVICE_BOOKING_FALLBACK_HREF;
}

/** @deprecated Use serviceOver200Href() */
export const EPC_OVER_200_HREF = serviceOver200Href();

export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Packages", href: "#packages" },
  { label: "Who it's for", href: "#who" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export const trustSignals = [
  "Accredited DEA",
  "National EPC Register",
  "Rightmove-ready",
  "Zoopla-ready",
  "Fully Insured",
  "London & Kent",
];

export type ServiceVisual = "epc-ladder" | "tour-room" | "floor-plan";

export const services: {
  key: ServiceKey;
  id: string;
  name: string;
  shortName: string;
  tag: string;
  image: string;
  visual: ServiceVisual;
  description: string;
  benefits: string[];
  ctaLabel: string;
  ctaHref: string;
}[] = [
  {
    key: "epc",
    id: "epc",
    name: "EPC Certificates",
    shortName: "EPC",
    tag: "Compliance",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    visual: "epc-ladder",
    description:
      "Accredited Energy Performance Certificates carried out quickly and correctly — keeping you on the right side of the law.",
    benefits: [
      "Full legal compliance for sale or let",
      "Fast turnaround, minimal disruption",
      "Carried out by a qualified Domestic Energy Assessor",
    ],
    ctaLabel: "Book an EPC Assessment",
    ctaHref: SERVICE_BOOKING_FALLBACK_HREF,
  },
  {
    key: "virtual-tours",
    id: "tours",
    name: "3D Virtual Tours",
    shortName: "Virtual Tours",
    tag: "Immersive",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    visual: "tour-room",
    description:
      "Immersive, walk-through 3D tours that let buyers and tenants explore a property remotely, any time, from anywhere.",
    benefits: [
      "Remote property viewing, day or night",
      "Higher buyer and tenant engagement",
      "More enquiries and viewing requests",
    ],
    ctaLabel: "Book a 3D Tour",
    ctaHref: SERVICE_BOOKING_FALLBACK_HREF,
  },
  {
    key: "floor-plans",
    id: "floor-plans",
    name: "Floor Plans",
    shortName: "Floor Plans",
    tag: "Layout",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80",
    visual: "floor-plan",
    description:
      "Accurate, professionally drawn floor plans that help buyers and tenants understand a property's layout at a glance.",
    benefits: [
      "Clear room dimensions and layout for every listing",
      "Rightmove and Zoopla-ready marketing assets",
      "Drawn to a consistent standard across your portfolio",
    ],
    ctaLabel: "Book a Floor Plan",
    ctaHref: SERVICE_BOOKING_FALLBACK_HREF,
  },
];

const INCLUDE_TO_VISUAL: Record<string, ServiceVisual> = {
  EPC: "epc-ladder",
  "Floor Plan": "floor-plan",
  "3D Virtual Tour": "tour-room",
};

/** Maps bundle includes to homepage 3D visual keys for overlapping stack art. */
export function bundleVisualKeys(bundleKey: BundleKey): ServiceVisual[] {
  const bundle = serviceBundles.find((b) => b.key === bundleKey);
  if (!bundle) return [];
  return bundle.includes
    .map((item) => INCLUDE_TO_VISUAL[item])
    .filter((visual): visual is ServiceVisual => Boolean(visual));
}

export function getServiceByVisual(visual: ServiceVisual) {
  return services.find((s) => s.visual === visual);
}

export type PersonaHighlight = {
  point: string;
  detail: string;
};

export type PersonaRecommendation =
  | { label: string; href: string }
  | { label: string; serviceKey: ServiceKey };

export type Persona = {
  number: string;
  title: string;
  selectLabel: string;
  intro: string;
  highlights: PersonaHighlight[];
  recommended: PersonaRecommendation[];
};

export const personas: Persona[] = [
  {
    number: "01",
    title: "Estate Agents",
    selectLabel: "Estate Agent",
    intro:
      "Every listing needs to look its best and go live on time. We help you deliver polished, compliant marketing without the supplier runaround.",
    highlights: [
      {
        point: "Listings go live faster",
        detail:
          "Reliable turnaround on EPCs, floor plans, and virtual tours — so properties reach Rightmove and Zoopla without unnecessary delays.",
      },
      {
        point: "Consistent quality across every property",
        detail:
          "Magazine-standard floor plans and accredited certificates that reflect well on your agency, instruction after instruction.",
      },
      {
        point: "One partner for compliance and marketing",
        detail:
          "Book EPC, floor plans, and 3D tours together in a single visit — less coordination, fewer vendors to manage.",
      },
    ],
    recommended: [
      { label: "Book a Floor Plan", serviceKey: "floor-plans" },
      { label: "Book a 3D Tour", serviceKey: "virtual-tours" },
      { label: "Book an EPC", serviceKey: "epc" },
    ],
  },
  {
    number: "02",
    title: "Landlords",
    selectLabel: "Landlord",
    intro:
      "Whether you're letting or selling, you need to stay compliant and get your property in front of tenants or buyers quickly.",
    highlights: [
      {
        point: "Stay legally compliant",
        detail:
          "A valid EPC is required before you can let or sell — we provide accredited assessments lodged on the national register.",
      },
      {
        point: "Reduce costly void periods",
        detail:
          "Fast turnaround means you can list sooner and avoid weeks of lost rental income while waiting on certificates or marketing.",
      },
      {
        point: "Professional marketing that attracts tenants",
        detail:
          "Accurate floor plans help buyers and tenants understand the layout quickly and secure enquiries from day one.",
      },
      {
        point: "Qualified, accredited support you can trust",
        detail:
          "Every assessment is carried out by a registered Domestic Energy Assessor — one reliable team, no chasing multiple suppliers.",
      },
    ],
    recommended: [
      { label: "Book an EPC", serviceKey: "epc" },
      { label: "Book a Floor Plan", serviceKey: "floor-plans" },
    ],
  },
  {
    number: "03",
    title: "Building Managers",
    selectLabel: "Building Manager",
    intro:
      "Managing multiple units means compliance and marketing need to run smoothly at scale — without adding to your workload.",
    highlights: [
      {
        point: "Portfolio-wide EPC compliance",
        detail:
          "Keep every unit legally compliant with accredited assessments across your entire portfolio.",
      },
      {
        point: "Efficient scheduling across properties",
        detail:
          "We coordinate access and visits across multiple units and schedules — one point of contact, less admin for you.",
      },
      {
        point: "Consistent marketing on every listing",
        detail:
          "Professional floor plans and 3D tours to the same standard across all units, strengthening every listing.",
      },
    ],
    recommended: [
      { label: "Book an EPC", serviceKey: "epc" },
      { label: "Book a 3D Tour", serviceKey: "virtual-tours" },
      { label: "Book a Floor Plan", serviceKey: "floor-plans" },
    ],
  },
];

export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "What services do you offer?",
    answer:
      "We provide accredited EPC certificates, professional digital floor plans, and immersive 3D virtual tours. You can book each service individually or choose an Essential, Marketing, or Complete package — all sized by floor area and delivered in as few visits as possible.",
  },
  {
    question: "How quickly can I get an EPC?",
    answer:
      "In most cases we can carry out the assessment within 1–3 working days of booking. Once complete, the certificate is lodged on the national register and issued to you the same day.",
  },
  {
    question: "What do I get with a floor plan or 3D tour?",
    answer:
      "Floor plans include accurate room measurements and a clean digital layout suitable for online listings and print marketing. 3D virtual tours let buyers and tenants explore the property remotely — we handle on-site capture and tour creation, and deliver assets ready to embed in your marketing.",
  },
  {
    question: "Can I book more than one service in a single visit?",
    answer:
      "Yes — and we'd recommend it. Combining services in one appointment saves time on site. Our Essential, Marketing, and Complete packages bundle EPC, floor plan, and 3D tour work with a fixed discount at every floor-area tier.",
  },
  {
    question: "How is pricing calculated?",
    answer:
      "All services and packages are priced by total internal floor area, in the same bands: up to 100 m², 101–150 m², and 151–200 m². Properties over 200 m² can book a free consultation for a tailored quote. Package prices include a bundle saving compared with booking services separately.",
  },
  {
    question: "What areas do you cover?",
    answer:
      "We cover London and Kent. If you're just outside these areas, get in touch and we'll do our best to accommodate you.",
  },
  {
    question: "How does booking and payment work?",
    answer:
      "Choose your service or package, select the tier that matches your property size, and book online. Pay securely at checkout — we accept major credit and debit cards and bank transfer. For properties over 200 m², book a free consultation and we'll confirm pricing for your property.",
  },
  {
    question: "Who carries out the work?",
    answer:
      "EPC assessments are conducted by a qualified, accredited Domestic Energy Assessor (DEA), registered on an approved scheme. Floor plans and 3D virtual tours are produced by our in-house property marketing team to a consistent standard across every job.",
  },
  {
    question: "Are your floor plans and tours listing-ready?",
    answer:
      "Yes. Floor plans are delivered in high-resolution formats suitable for Rightmove, Zoopla, and your own marketing. 3D tours are built for remote viewing and can be shared via a link on your listings and social channels.",
  },
  {
    question: "What if my property is over 200 m²?",
    answer:
      "Properties over 200 m² fall outside our standard online tiers. Book a free consultation with the address and approximate floor area — we'll confirm tailored pricing for EPC, floor plan, 3D tour, or package work.",
  },
];
