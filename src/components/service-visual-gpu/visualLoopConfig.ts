import type { ServiceVisual } from "@/lib/site-config";

/** Must match the recorder and MediaRecorder captureStream rate. */
export const SERVICE_VISUAL_RECORD_FPS = 30;

export type VisualLoopConfig = {
  frameCount: number;
  durationSec: number;
  durationMs: number;
  /** Pivot rotation speed (rad/s) — one full turn per loop. */
  rotationSpeed: number;
  /** Walk-path parameter speed (tour-room). */
  pathSpeed: number;
  /** Highlight lift oscillation speed (epc-ladder). */
  liftSpeed: number;
};

function loopConfig(
  periodSec: number,
  opts: { pathSpeed?: number; liftSpeed?: number },
): VisualLoopConfig {
  const frameCount = Math.round(periodSec * SERVICE_VISUAL_RECORD_FPS);
  const durationSec = frameCount / SERVICE_VISUAL_RECORD_FPS;
  return {
    frameCount,
    durationSec,
    durationMs: durationSec * 1000,
    rotationSpeed: (2 * Math.PI) / durationSec,
    pathSpeed: opts.pathSpeed ?? 0,
    liftSpeed: opts.liftSpeed ?? 0,
  };
}

/**
 * Loop periods chosen so every animated channel returns to t=0:
 * - epc-ladder: lift sin period 2π/1.2 + one pivot revolution
 * - tour-room: path period 12.5s (0.08 Hz) + one pivot revolution
 * - floor-plan: one pivot revolution every 10s
 */
export const serviceVisualLoopConfig: Record<ServiceVisual, VisualLoopConfig> = {
  // sin(time × 1.2) repeats every 2π/1.2 s ≈ 5.236 s → 157 frames @ 30fps
  "epc-ladder": loopConfig((2 * Math.PI) / 1.2, { liftSpeed: 1.2 }),
  // (time × 0.08) mod 1 repeats every 12.5 s → 375 frames @ 30fps
  "tour-room": loopConfig(12.5, { pathSpeed: 0.08 }),
  // Rotation-only — 10 s loop → 300 frames @ 30fps
  "floor-plan": loopConfig(10, {}),
};

export function serviceVisualLoopDurationMs(visual: ServiceVisual): number {
  return serviceVisualLoopConfig[visual].durationMs;
}
