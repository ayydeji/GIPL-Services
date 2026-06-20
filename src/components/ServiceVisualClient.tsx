"use client";

import dynamic from "next/dynamic";
import type { ServiceVisual } from "@/lib/site-config";

const ServiceVisual3D = dynamic(() => import("@/components/ServiceVisual3D"), {
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

interface Props {
  active: ServiceVisual;
  fallbackSrc: string;
  fallbackAlt: string;
}

export default function ServiceVisualClient(props: Props) {
  return <ServiceVisual3D {...props} />;
}
