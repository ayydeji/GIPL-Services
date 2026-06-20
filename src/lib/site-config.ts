// Central configuration for site-wide content, contact details, and
// external links. Edit values here to update copy across the whole site.

/**
 * PLACEHOLDER — replace with the real Cal.com booking link (with payment)
 * before going live.
 */
export const EPC_BOOKING_URL = "https://example.com/REPLACE_WITH_EPC_BOOKING_URL";

export const siteConfig = {
  companyLegalName: "Groove Park Investment Limited",
  brandName: "GIPL Services",
  tagline: "EPC Certificates, 3D Virtual Tours & Property Photography",
  phone: "020 3598 2318",
  phoneHref: "tel:+442035982318",
  email: "contact@gipl-services.co.uk",
  emailHref: "mailto:contact@gipl-services.co.uk",
  address: "London & Kent, United Kingdom",
  serviceArea: "London & Kent",
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
  },
};

export const navLinks = [
  { label: "Services", href: "#services" },
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

export type ServiceKey = "epc" | "virtual-tours" | "photography";
export type ServiceVisual = "epc-ladder" | "tour-room" | "photo-frames";

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
    ctaHref: EPC_BOOKING_URL,
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
    ctaLabel: "Enquire",
    ctaHref: "mailto:contact@gipl-services.co.uk",
  },
  {
    key: "photography",
    id: "photography",
    name: "Property Photography",
    shortName: "Photography",
    tag: "Marketing",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    visual: "photo-frames",
    description:
      "Crisp, professionally lit photography that presents a property at its absolute best across every listing platform.",
    benefits: [
      "Magazine-standard imagery",
      "Stronger marketing across every portal",
      "More enquiries from the very first impression",
    ],
    ctaLabel: "Enquire",
    ctaHref: "mailto:contact@gipl-services.co.uk",
  },
];

export type PersonaHighlight = {
  point: string;
  detail: string;
};

export type Persona = {
  number: string;
  title: string;
  selectLabel: string;
  intro: string;
  highlights: PersonaHighlight[];
  recommended: { label: string; href: string }[];
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
          "Reliable turnaround on EPCs, photography, and virtual tours — so properties reach Rightmove and Zoopla without unnecessary delays.",
      },
      {
        point: "Consistent quality across every property",
        detail:
          "Magazine-standard imagery and accredited certificates that reflect well on your agency, instruction after instruction.",
      },
      {
        point: "One partner for compliance and marketing",
        detail:
          "Book EPC, photography, and 3D tours together in a single visit — less coordination, fewer vendors to manage.",
      },
    ],
    recommended: [
      { label: "Property Photography", href: "#photography" },
      { label: "3D Virtual Tours", href: "#tours" },
      { label: "Book an EPC", href: EPC_BOOKING_URL },
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
          "High-quality photography presents your property at its best and helps secure enquiries from day one.",
      },
      {
        point: "Qualified, accredited support you can trust",
        detail:
          "Every assessment is carried out by a registered Domestic Energy Assessor — one reliable team, no chasing multiple suppliers.",
      },
    ],
    recommended: [
      { label: "Book an EPC", href: EPC_BOOKING_URL },
      { label: "Property Photography", href: "#photography" },
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
          "Professional photography and 3D tours to the same standard across all units, strengthening every listing.",
      },
    ],
    recommended: [
      { label: "Book an EPC", href: EPC_BOOKING_URL },
      { label: "3D Virtual Tours", href: "#tours" },
      { label: "Property Photography", href: "#photography" },
    ],
  },
];

export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "How quickly can I get an EPC?",
    answer:
      "In most cases we can carry out the assessment within 1–3 working days of booking. Once complete, the certificate is lodged on the national register and issued to you the same day.",
  },
  {
    question: "What areas do you cover?",
    answer:
      "We cover London and Kent. If you're just outside these areas, get in touch and we'll do our best to accommodate you.",
  },
  {
    question: "How does booking and payment work?",
    answer:
      "You can book directly online via our booking page — pick a date and time that suits, and pay securely at checkout. We accept all major credit and debit cards as well as bank transfer.",
  },
  {
    question: "Can I book more than one service in a single visit?",
    answer:
      "Yes — and we'd recommend it. Combining an EPC with property photography or a 3D virtual tour in a single visit saves you time and qualifies for a multi-service discount. Get in touch to arrange a combined booking.",
  },
  {
    question: "Who carries out the EPC assessment?",
    answer:
      "All assessments are conducted by a qualified and accredited Domestic Energy Assessor (DEA), registered on an approved accreditation scheme. Every certificate we issue is fully compliant and lodged on the national EPC register.",
  },
];
