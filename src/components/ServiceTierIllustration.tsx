import type { ServiceIllustration } from "@/lib/site-config";

type Props = {
  variant: ServiceIllustration;
  className?: string;
};

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

/** Minimal line-art floorplan silhouettes for property size tiers. */
export function ServiceTierIllustration({ variant, className }: Props) {
  return (
    <svg
      viewBox="0 0 72 56"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {variant === "compact" && (
        <>
          <rect x="8" y="10" width="56" height="36" rx="2" {...stroke} />
          <line x1="32" y1="10" x2="32" y2="46" {...stroke} />
          <rect x="38" y="18" width="10" height="8" rx="1" {...stroke} />
          <circle cx="20" cy="18" r="1.5" fill="currentColor" stroke="none" />
        </>
      )}
      {variant === "medium" && (
        <>
          <rect x="6" y="12" width="38" height="32" rx="2" {...stroke} />
          <rect x="48" y="20" width="18" height="24" rx="2" {...stroke} />
          <line x1="6" y1="28" x2="44" y2="28" {...stroke} />
          <line x1="24" y1="12" x2="24" y2="28" {...stroke} />
          <circle cx="14" cy="20" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="54" cy="26" r="1.5" fill="currentColor" stroke="none" />
        </>
      )}
      {variant === "large" && (
        <>
          <rect x="4" y="8" width="64" height="40" rx="2" {...stroke} />
          <line x1="4" y1="24" x2="68" y2="24" {...stroke} />
          <line x1="36" y1="8" x2="36" y2="48" {...stroke} />
          <line x1="4" y1="36" x2="36" y2="36" {...stroke} />
          <line x1="36" y1="36" x2="68" y2="36" {...stroke} />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="52" cy="16" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="52" cy="42" r="1.5" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
