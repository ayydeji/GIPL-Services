import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GIPL Services | EPC Certificates, 3D Virtual Tours & Property Photography",
    template: "%s | GIPL Services",
  },
  description:
    "Groove Park Investment Limited (GIPL Services) provides accredited EPC certificates, 3D virtual tours, and property photography for landlords, estate agents, and property professionals across London and the South East.",
  keywords: [
    "EPC certificate",
    "Energy Performance Certificate",
    "3D virtual tours",
    "property photography",
    "estate agent photography",
    "London property marketing",
    "EPC London",
    "EPC Kent",
  ],
  authors: [{ name: "Groove Park Investment Limited" }],
  openGraph: {
    title: "GIPL Services | EPC Certificates & Property Marketing",
    description:
      "Accredited EPC Certificates, 3D Virtual Tours, and Property Photography for landlords, estate agents, and property professionals.",
    url: siteUrl,
    siteName: "GIPL Services",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIPL Services | EPC Certificates & Property Marketing",
    description:
      "Accredited EPC Certificates, 3D Virtual Tours, and Property Photography for landlords, estate agents, and property professionals.",
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
  description:
    "Accredited EPC certificates, 3D virtual tours, and property photography for landlords, estate agents, and property professionals.",
  areaServed: ["London", "Kent", "South East England"],
  telephone: "+44-20-3598-2318",
  email: "contact@gipl-services.co.uk",
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
        <Header />
        {children}
      </body>
    </html>
  );
}
