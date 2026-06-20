import Link from "next/link";
import FloorPlanClient from "@/components/FloorPlanClient";

export const metadata = {
  title: "Floor Plan Illustration — GIPL Services",
  description:
    "An interactive 3D dollhouse floor plan — part of the GIPL Services virtual tour offering.",
};

export default function FloorPlanPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--color-paper)", color: "var(--color-ink)" }}
    >
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 pt-16 pb-20">

        {/* Eyebrow */}
        <p
          className="text-xs font-semibold uppercase tracking-[0.14em] mb-5"
          style={{ color: "var(--color-bronze-500)" }}
        >
          Illustration
        </p>

        {/* Headline + caption row */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-12 mb-10">
          <h1
            className="font-semibold tracking-[-0.03em] leading-[1.05]"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 4rem)",
              color: "var(--color-espresso-900)",
              maxWidth: "20ch",
            }}
          >
            See the space before{" "}
            <span style={{ color: "var(--color-bronze-500)" }}>you visit.</span>
          </h1>

          <p
            className="max-w-sm text-base leading-relaxed"
            style={{ color: "var(--color-espresso-900)", opacity: 0.6 }}
          >
            Drag to orbit &middot; hover any room to see its EPC details. Our
            3D virtual tours bring this level of clarity to every property we
            scan.
          </p>
        </div>

        {/* Hairline rule */}
        <div
          className="w-full mb-10"
          style={{ borderTop: "1px solid var(--color-espresso-900)", opacity: 0.1 }}
        />

        {/* Three.js canvas */}
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            aspectRatio: "16 / 10",
          }}
        >
          <FloorPlanClient />
        </div>

        {/* Controls legend */}
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
          {[
            ["Drag", "Orbit"],
            ["Hover", "EPC room details"],
          ].map(([key, desc]) => (
            <p
              key={key}
              className="text-xs leading-relaxed"
              style={{ color: "var(--color-espresso-900)", opacity: 0.45 }}
            >
              <span className="font-semibold" style={{ opacity: 1 }}>
                {key}
              </span>{" "}
              — {desc}
            </p>
          ))}
        </div>

        {/* Hairline rule */}
        <div
          className="w-full mt-14 mb-10"
          style={{ borderTop: "1px solid var(--color-espresso-900)", opacity: 0.1 }}
        />

        {/* Back link */}
        <Link
          href="/"
          className="text-sm font-medium"
          style={{
            color: "var(--color-espresso-900)",
            opacity: 0.55,
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          ← Back to GIPL Services
        </Link>
      </div>
    </main>
  );
}
