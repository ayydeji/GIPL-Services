import { HeroMotion } from "@/components/HeroMotion";

export function Hero() {
  return (
    <section
      id="home"
      className="bg-paper flex flex-col"
      style={{ height: "100dvh", minHeight: "560px" }}
    >
      <HeroMotion />
    </section>
  );
}
