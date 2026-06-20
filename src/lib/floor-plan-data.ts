/**
 * Apartment floor plan data — all coordinates in metres (world-space).
 *
 * Layout overview (top-down, not to scale):
 *
 *  ┌╌╌╌╌╌╌╌╌╌╌╌╌┐
 *  ┊  BALCONY   ┊
 * ┌─══──────────┬──────┬──────────══─┐
 * │ LIVING/DINING       │  KITCHEN   │
 * │                     │            │
 * ├─────────────┤  Hall ├────────────┤
 * │  BEDROOM            │  BATHROOM  │
 * │                     │            │
 * └─────────────┴──▲───┴────────────┘
 *                  door
 *
 * Origin (0,0) is front-left corner of the building.
 * X → right, Z → into the plan (top), Y up (Three.js).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Vec2 = { x: number; z: number };

export type WallSegment = {
  id: string;
  start: Vec2;
  end: Vec2;
  thickness: number; // metres
  height: number;    // metres
};

export type Opening = {
  wallId: string;
  /** Distance from the wall's start point to the near edge of the opening */
  offset: number;
  width: number;
  type: "door" | "window";
  /** For doors: which side the swing arc draws (1 = right of travel, -1 = left) */
  swingSide?: 1 | -1;
  /** Tint this door's leaf with the bronze accent (used for the front door) */
  accent?: boolean;
};

export type Room = {
  id: string;
  label: string;
  /** Axis-aligned bounding box on the floor (metres) */
  x: number; z: number; w: number; d: number;
  /** Hex tint for the floor tile */
  floorColor: string;
};

export type Furniture = {
  id: string;
  room: string;
  type: string;
  x: number; z: number;
  w: number; d: number; h: number;
  rotY?: number; // radians
  color?: string;
};

export type Balcony = {
  x: number; z: number; w: number; d: number;
};

export type RoomEpcData = {
  number: string;
  title: string;
  floorArea: number;
  glazing: string;
  heating: string;
  insulation: string;
  lighting: string;
  ventilation: string;
  heatLoss: "Low" | "Medium" | "High";
  heatLossScore: number; // 1–5
  /** EPC band letter A–G */
  rating: string;
};

/** Standard EPC band colours (A = best, G = worst). */
export const EPC_COLORS: Record<string, string> = {
  A: "#008054",
  B: "#19b459",
  C: "#8dce46",
  D: "#ffd500",
  E: "#fcaa65",
  F: "#ef8023",
  G: "#e9153b",
};

// ---------------------------------------------------------------------------
// Brand token colours (hex fallbacks; runtime reads CSS vars from globals.css)
// ---------------------------------------------------------------------------

export const TOKENS = {
  paper:        "#FAF8F5",
  sand100:      "#F5F1EB",
  sand200:      "#ECE3D6",
  tan300:       "#DCC4A3",
  tan400:       "#C8A27A",
  bronze500:    "#B38B5D",
  bronze600:    "#9A7349",
  espresso700:  "#5A4938",
  espresso800:  "#45382B",
  espresso900:  "#3D3126",
} as const;

export function readToken(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

const T = 0.15;  // wall thickness
const H = 1.8;   // wall height (keep low for dollhouse feel)
const W = 9.0;   // total building width
const D = 8.0;   // total building depth

// Hall corridor x-range (centre of plan)
const hallX0 = 3.5;  // left edge of hall
const hallX1 = 5.1;  // right edge of hall (1.6m wide)

// Floor division depth
const midZ  = 4.2;   // horizontal wall at mid-plan
const balD  = 1.6;   // balcony depth (in front of north wall)

// ---------------------------------------------------------------------------
// Rooms
// ---------------------------------------------------------------------------

export const rooms: Room[] = [
  {
    id: "living",
    label: "Living / Dining",
    x: 0,   z: 0,    w: hallX0, d: midZ,
    floorColor: TOKENS.sand100,
  },
  {
    id: "kitchen",
    label: "Kitchen",
    x: hallX1, z: 0,   w: W - hallX1, d: midZ,
    floorColor: TOKENS.sand200,
  },
  {
    id: "hall",
    label: "Hall",
    x: hallX0, z: 0,   w: hallX1 - hallX0, d: D,
    floorColor: TOKENS.paper,
  },
  {
    id: "bedroom",
    label: "Bedroom",
    x: 0,   z: midZ, w: hallX0, d: D - midZ,
    floorColor: TOKENS.sand100,
  },
  {
    id: "bathroom",
    label: "Bathroom",
    x: hallX1, z: midZ, w: W - hallX1, d: D - midZ,
    floorColor: TOKENS.sand200,
  },
];

export const balcony: Balcony = {
  x: 0, z: -balD,
  w: W, d: balD,
};

// ---------------------------------------------------------------------------
// Walls
// ---------------------------------------------------------------------------

export const walls: WallSegment[] = [
  // ---- Exterior north wall (top) ----
  { id: "north", start: { x: 0, z: 0 }, end: { x: W, z: 0 }, thickness: T, height: H },

  // ---- Exterior south wall (bottom/front) ----
  { id: "south", start: { x: 0, z: D }, end: { x: W, z: D }, thickness: T, height: H },

  // ---- Exterior west wall ----
  { id: "west",  start: { x: 0, z: 0 }, end: { x: 0, z: D }, thickness: T, height: H },

  // ---- Exterior east wall ----
  { id: "east",  start: { x: W, z: 0 }, end: { x: W, z: D }, thickness: T, height: H },

  // ---- Interior: west side of hall (living→hall) ----
  { id: "hallW", start: { x: hallX0, z: 0 }, end: { x: hallX0, z: D }, thickness: T, height: H },

  // ---- Interior: east side of hall (hall→kitchen / bathroom) ----
  { id: "hallE", start: { x: hallX1, z: 0 }, end: { x: hallX1, z: D }, thickness: T, height: H },

  // ---- Interior: horizontal mid wall (living→bedroom, kitchen→bathroom) ----
  { id: "midW",  start: { x: 0, z: midZ },    end: { x: hallX0, z: midZ }, thickness: T, height: H },
  { id: "midE",  start: { x: hallX1, z: midZ }, end: { x: W, z: midZ },    thickness: T, height: H },

  // ---- Balcony: south balcony rail (low) ----
  { id: "balcRail", start: { x: 0, z: -balD }, end: { x: W, z: -balD }, thickness: T, height: 0.9 },
  // balcony side rails
  { id: "balcW", start: { x: 0, z: -balD }, end: { x: 0, z: 0 }, thickness: T, height: 0.9 },
  { id: "balcE", start: { x: W, z: -balD }, end: { x: W, z: 0 }, thickness: T, height: 0.9 },
];

// ---------------------------------------------------------------------------
// Openings (doors + windows)
// ---------------------------------------------------------------------------

export const openings: Opening[] = [
  // Front door (south wall, centred in hall) — bronze accent, swings into hall
  {
    wallId: "south",
    offset: hallX0 + 0.1,
    width: hallX1 - hallX0 - 0.2,
    type: "door",
    swingSide: -1,
    accent: true,
  },

  // Living → Hall door (north half of hallW, clear of the mid wall at z=midZ)
  {
    wallId: "hallW",
    offset: 2.6,
    width: 0.9,
    type: "door",
    swingSide: 1,
  },

  // Bedroom → Hall door (south half of hallW)
  {
    wallId: "hallW",
    offset: 6.5,
    width: 0.9,
    type: "door",
    swingSide: 1,
  },

  // Kitchen → Hall door (north half of hallE)
  {
    wallId: "hallE",
    offset: 1.2,
    width: 1.2,
    type: "door",
    swingSide: -1,
  },

  // Bathroom → Hall door (south half of hallE)
  {
    wallId: "hallE",
    offset: 6.4,
    width: 0.8,
    type: "door",
    swingSide: -1,
  },

  // Living room – north window (wide sliding to balcony)
  {
    wallId: "north",
    offset: 0.4,
    width: 2.6,
    type: "window",
  },

  // Kitchen – north window
  {
    wallId: "north",
    offset: hallX1 + 0.4,
    width: 1.8,
    type: "window",
  },

  // Bedroom – west window
  {
    wallId: "west",
    offset: 5.0,
    width: 1.4,
    type: "window",
  },

  // Bathroom – east window (small)
  {
    wallId: "east",
    offset: midZ + 0.6,
    width: 0.8,
    type: "window",
  },

  // Living – west window (side light)
  {
    wallId: "west",
    offset: 0.8,
    width: 1.2,
    type: "window",
  },
];

// ---------------------------------------------------------------------------
// Furniture
// ---------------------------------------------------------------------------

export const furniture: Furniture[] = [
  // ---- Living / Dining ----
  // Seating grouped against the north wall; living→hall door sits at z≈2.6–3.5
  // on the east (hall) wall, and the tv unit lines the mid wall — all clear of it.
  {
    id: "living-rug",  room: "living",  type: "rug",
    x: 0.45, z: 0.5,  w: 2.7, d: 2.2, h: 0.02,
    color: TOKENS.sand200,
  },
  {
    id: "sofa",        room: "living",  type: "sofa",
    x: 1.15, z: 0.55, w: 2.2, d: 0.9, h: 0.45,
    color: TOKENS.tan400,
  },
  {
    id: "coffee",      room: "living",  type: "table",
    x: 1.5,  z: 1.7,  w: 1.0, d: 0.5, h: 0.35,
    color: TOKENS.tan300,
  },
  {
    id: "tv-unit",     room: "living",  type: "shelf",
    x: 1.0,  z: 3.72, w: 1.6, d: 0.28, h: 0.5,
    color: TOKENS.espresso700,
  },

  // ---- Kitchen ----
  // L-shaped run along the north + east walls, island in the middle;
  // kitchen→hall door sits at z≈1.2–2.4 on the west (hall) wall — left clear.
  {
    id: "counter-back", room: "kitchen", type: "counter",
    x: 5.3,  z: 0.12, w: 3.5, d: 0.55, h: 0.9,
    color: TOKENS.sand200,
  },
  {
    id: "counter-side", room: "kitchen", type: "counter",
    x: 8.4,  z: 0.67, w: 0.5, d: 2.6, h: 0.9,
    color: TOKENS.sand200,
  },
  {
    id: "island",       room: "kitchen", type: "table",
    x: 5.95, z: 2.3,  w: 1.5, d: 0.7, h: 0.9,
    color: TOKENS.tan300,
  },

  // ---- Bedroom ----
  // Bed + nightstand on the west side, wardrobe on the north of the hall wall,
  // desk on the south wall; bedroom→hall door at z≈6.5–7.4 is kept clear.
  {
    id: "bed",         room: "bedroom", type: "bed",
    x: 0.3,  z: 4.5,  w: 1.6, d: 2.1, h: 0.5,
    color: TOKENS.sand100,
  },
  {
    id: "nightstand",  room: "bedroom", type: "table",
    x: 2.0,  z: 4.5,  w: 0.4, d: 0.45, h: 0.5,
    color: TOKENS.tan300,
  },
  {
    id: "wardrobe",    room: "bedroom", type: "wardrobe",
    x: 2.9,  z: 4.45, w: 0.5, d: 1.6, h: H * 0.95,
    color: TOKENS.espresso700,
  },
  {
    id: "desk",        room: "bedroom", type: "desk",
    x: 0.4,  z: 7.25, w: 1.5, d: 0.65, h: 0.75,
    color: TOKENS.tan300,
  },

  // ---- Bathroom ----
  // Tub on the north wall, wc + basin on the east wall, shower in the SE corner;
  // bathroom→hall door at z≈6.4–7.2 on the west wall is kept clear.
  {
    id: "tub",         room: "bathroom", type: "tub",
    x: 5.35, z: 4.35, w: 1.6, d: 0.75, h: 0.5,
    color: TOKENS.paper,
  },
  {
    id: "wc",          room: "bathroom", type: "wc",
    x: 8.3,  z: 4.5,  w: 0.55, d: 0.7, h: 0.4,
    color: TOKENS.paper,
  },
  {
    id: "basin",       room: "bathroom", type: "basin",
    x: 8.4,  z: 5.5,  w: 0.5, d: 0.45, h: 0.85,
    color: TOKENS.paper,
  },
  {
    id: "shower",      room: "bathroom", type: "shower",
    x: 7.95, z: 6.5,  w: 0.95, d: 0.95, h: 0.1,
    color: TOKENS.sand200,
  },

  // ---- Hall ----
  // Single bronze entry mat just inside the front door (flat, blocks nothing).
  {
    id: "hallMat",     room: "hall", type: "rug",
    x: 3.75, z: 6.9,  w: 1.1, d: 0.8, h: 0.02,
    color: TOKENS.bronze500,
  },
];

// ---------------------------------------------------------------------------
// EPC room data
// Floor areas derived from plan dimensions:
//   living  = hallX0 × midZ        = 3.5 × 4.2 = 14.7 m²
//   kitchen = (W-hallX1) × midZ    = 3.9 × 4.2 = 16.4 m²
//   hall    = (hallX1-hallX0) × D  = 1.6 × 8.0 = 12.8 m²
//   bedroom = hallX0 × (D-midZ)    = 3.5 × 3.8 = 13.3 m²
//   bathroom= (W-hallX1) × (D-midZ)= 3.9 × 3.8 = 14.8 m²
//   balcony = W × balD             = 9.0 × 1.6 = 14.4 m²
// ---------------------------------------------------------------------------

export const roomEpcData: Record<string, RoomEpcData> = {
  living: {
    number: "01",
    title: "Living / Dining",
    floorArea: 14.7,
    glazing: "Double glazed",
    heating: "Gas central heating",
    insulation: "Cavity wall (filled)",
    lighting: "LED throughout",
    ventilation: "Natural — openable",
    heatLoss: "Medium",
    heatLossScore: 3,
    rating: "C",
  },
  kitchen: {
    number: "02",
    title: "Kitchen",
    floorArea: 16.4,
    glazing: "Double glazed",
    heating: "Gas central heating",
    insulation: "Cavity wall (filled)",
    lighting: "LED task lighting",
    ventilation: "Mech. extract hood",
    heatLoss: "Low",
    heatLossScore: 1,
    rating: "C",
  },
  hall: {
    number: "03",
    title: "Hall",
    floorArea: 12.8,
    glazing: "None",
    heating: "Gas central heating",
    insulation: "Cavity wall (filled)",
    lighting: "LED",
    ventilation: "Natural — via door",
    heatLoss: "Medium",
    heatLossScore: 3,
    rating: "D",
  },
  bedroom: {
    number: "04",
    title: "Bedroom",
    floorArea: 13.3,
    glazing: "Double glazed (W-facing)",
    heating: "Gas central heating",
    insulation: "Cavity wall (filled)",
    lighting: "LED throughout",
    ventilation: "Natural — openable",
    heatLoss: "Low",
    heatLossScore: 2,
    rating: "B",
  },
  bathroom: {
    number: "05",
    title: "Bathroom",
    floorArea: 14.8,
    glazing: "Obscure double glazed",
    heating: "Electric towel rail",
    insulation: "Cavity wall (filled)",
    lighting: "LED IP44 rated",
    ventilation: "Mech. extract fan",
    heatLoss: "Low",
    heatLossScore: 1,
    rating: "C",
  },
  balcony: {
    number: "06",
    title: "Balcony",
    floorArea: 14.4,
    glazing: "Open balustrade",
    heating: "None",
    insulation: "External — uninsulated",
    lighting: "None specified",
    ventilation: "Fully open — external",
    heatLoss: "High",
    heatLossScore: 5,
    rating: "G",
  },
};
