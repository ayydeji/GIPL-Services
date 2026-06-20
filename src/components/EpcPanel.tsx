import { roomEpcData, EPC_COLORS } from "@/lib/floor-plan-data";

const BANDS = ["A", "B", "C", "D", "E", "F", "G"] as const;

export function EpcPanel({ roomId }: { roomId: string }) {
  const data = roomEpcData[roomId];
  if (!data) return null;

  const color = EPC_COLORS[data.rating] ?? EPC_COLORS["D"];

  return (
    <div
      style={{
        background: "transparent",
        border: `1.5px dashed ${color}`,
        borderRadius: "10px",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "7px",
      }}
    >
      {/* Title + rating badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            lineHeight: 1.2,
            color: "var(--color-espresso-900)",
          }}
        >
          {data.title}
        </p>
        <span
          style={{
            background: color,
            color: "#fff",
            fontSize: "11px",
            fontWeight: 800,
            padding: "2px 7px",
            borderRadius: "4px",
            letterSpacing: "0.06em",
            flexShrink: 0,
          }}
        >
          {data.rating}
        </span>
      </div>

      {/* Floor area + heating */}
      <p
        style={{
          fontSize: "10px",
          color: "var(--color-espresso-900)",
          opacity: 0.55,
          lineHeight: 1.3,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {data.floorArea} m² &middot; {data.heating}
      </p>

      {/* A–G mini scale */}
      <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
        {BANDS.map((band) => (
          <div
            key={band}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background: band === data.rating ? EPC_COLORS[band] : "rgba(61,49,38,0.1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
