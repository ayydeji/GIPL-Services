import Link from "next/link";
import FloorPlanClient from "@/components/FloorPlanClient";

export function FloorPlanSection() {
  return (
    <section className="bg-paper pb-24 sm:pb-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">

        {/* Hairline rule */}
        <div
          className="w-full mb-10"
          style={{ borderTop: "1px solid rgba(61,49,38,0.1)" }}
        />

        {/* Label row */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-bronze-500">
            Virtual floor plan
          </p>
          <Link
            href="/floor-plan"
            className="text-xs font-medium text-espresso-900/50 underline-offset-4 transition-colors hover:text-espresso-900 hover:underline"
          >
            Open full view →
          </Link>
        </div>

        {/* Canvas */}
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            aspectRatio: "16 / 9",
            background: "var(--color-sand-100)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <FloorPlanClient />
        </div>

        {/* Caption */}
        <p className="mt-5 text-xs text-espresso-900/40 leading-relaxed">
          Drag to orbit &middot; hover any room to see its EPC details
        </p>
      </div>
    </section>
  );
}
