import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Packages } from "@/components/Packages";
import { TrustStrip } from "@/components/TrustStrip";
import { Personas } from "@/components/Personas";
import { Faq } from "@/components/Faq";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main className="overflow-x-clip">
        <Hero />
        <TrustStrip />
        <Services />
        <Personas />
        <Packages />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
