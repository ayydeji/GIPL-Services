import Image from "next/image";
import { Hero } from "@/components/Hero";
import { AboutUs } from "@/components/AboutUs";
import { CalBooking } from "@/components/CalBooking";
import { Services } from "@/components/Services";
import { TrustStrip } from "@/components/TrustStrip";
import { Statement } from "@/components/Statement";
import { Personas } from "@/components/Personas";
import { Faq } from "@/components/Faq";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";
import { FloatingCta } from "@/components/FloatingCta";
import { siteConfig } from "@/lib/site-config";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <TrustStrip />
        <AboutUs />
        <CalBooking />

        

        <Services />
        
        {/* <Statement /> */}
        <Personas />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
      {/* <FloatingCta /> */}
    </>
  );
}
