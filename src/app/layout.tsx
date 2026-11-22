import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { CalConsultationInit } from "@/components/CalConsultationInit";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Analytics } from "@vercel/analytics/next";

const generalSans = localFont({
  src: [
    {
      path: "../../public/fonts/GeneralSans-Variable.woff2",
      style: "normal",
    },
    {
      path: "../../public/fonts/GeneralSans-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = "https://www.gipl-services.co.uk";
const servicesDescription =
  "Accredited EPC certificates, 3D virtual tours, floor plans, and independent property inventories for landlords, estate agents, and property professionals.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GIPL Services | EPCs, 3D Tours, Floor Plans & Property Inventory",
    template: "%s | GIPL Services",
  },
  description:
    "GIPL Services provides accredited EPC certificates, 3D virtual tours, floor plans, and independent property inventories across London and the South East.",
  keywords: [
    "EPC certificate",
    "Energy Performance Certificate",
    "3D virtual tours",
    "floor plans",
    "property floor plans",
    "property inventory",
    "London property marketing",
    "EPC London",
    "EPC Kent",
  ],
  authors: [{ name: "Groove Park Investment Limited" }],
  openGraph: {
    title: "GIPL Services | EPCs, Property Marketing & Inventories",
    description: servicesDescription,
    url: siteUrl,
    siteName: "GIPL Services",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIPL Services | EPCs, Property Marketing & Inventories",
    description: servicesDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "GIPL Services (Groove Park Investment Limited)",
  description: servicesDescription,
  areaServed: ["London", "Kent", "South East England"],
  telephone: "+44-7495-331757",
  email: "muhammad@gipl.uk",
  url: siteUrl,
  priceRange: "££",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={generalSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-paper text-ink antialiased font-sans">
        <MotionProvider>
          <Sidebar />
          <div className="sm:pl-[var(--sidebar-w)]">
            <TopBar />
            {children}
          </div>
          <CalConsultationInit />
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
