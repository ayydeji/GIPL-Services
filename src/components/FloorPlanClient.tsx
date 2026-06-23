"use client";

import dynamic from "next/dynamic";

const FloorPlan3D = dynamic(() => import("@/components/FloorPlan3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span
        className="text-xs font-semibold uppercase tracking-[0.14em]"
        style={{ color: "var(--color-espresso-700)" }}
      >
        Loading…
      </span>
    </div>
  ),
});

type FloorPlanClientProps = {
  staticCamera?: boolean;
};

export default function FloorPlanClient({ staticCamera }: FloorPlanClientProps) {
  return <FloorPlan3D staticCamera={staticCamera} />;
}
