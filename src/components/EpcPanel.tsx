import { roomEpcData, EPC_COLORS } from "@/lib/floor-plan-data";

const BANDS = ["A", "B", "C", "D", "E", "F", "G"] as const;

export function EpcPanel({ roomId }: { roomId: string }) {
  const data = roomEpcData[roomId];
  if (!data) return null;

  const color = EPC_COLORS[data.rating] ?? EPC_COLORS["D"];

  return (
    <div className="flex flex-col gap-1.5 rounded-xl bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] leading-tight text-espresso-900">
          {data.title}
        </p>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-extrabold tracking-[0.06em] text-white"
          style={{ background: color }}
        >
          {data.rating}
        </span>
      </div>

      <p className="truncate text-[10px] leading-snug text-espresso-900/55">
        {data.floorArea} m² &middot; {data.heating}
      </p>

      <div className="flex items-center gap-0.5">
        {BANDS.map((band) => (
          <div
            key={band}
            className="h-1 flex-1 rounded-sm"
            style={{
              background: band === data.rating ? EPC_COLORS[band] : "rgba(61,49,38,0.1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
