"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  rooms,
  walls,
  openings,
  furniture,
  balcony,
  TOKENS,
  readToken,
  roomEpcData,
  EPC_COLORS,
  type WallSegment,
  type Opening,
  type Room,
  type Furniture,
} from "@/lib/floor-plan-data";
import { EpcPanel } from "@/components/EpcPanel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Mutable string copy of the brand token map (CSS vars resolved at runtime). */
type TokMap = Record<keyof typeof TOKENS, string>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hex(token: string): number {
  return parseInt(token.replace("#", ""), 16);
}

/** Clamp a value between min and max */
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Build a flat floor quad for a room.
 * We inset slightly so wall bases cover the seam.
 */
function buildFloor(room: Room, inset = 0.02): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(room.w - inset * 2, room.d - inset * 2);
  const mat = new THREE.MeshLambertMaterial({ color: hex(room.floorColor) });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(
    room.x + room.w / 2,
    0.001,
    room.z + room.d / 2,
  );
  mesh.receiveShadow = true;
  mesh.userData = { roomId: room.id, label: room.label };
  return mesh;
}

/**
 * Build balcony slab (slightly lower) with a perforated appearance.
 */
function buildBalcony(tok: TokMap): THREE.Group {
  const g = new THREE.Group();
  const floorGeo = new THREE.PlaneGeometry(balcony.w - 0.04, balcony.d - 0.04);
  const floorMat = new THREE.MeshLambertMaterial({ color: hex(tok.sand200) });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(
    balcony.x + balcony.w / 2,
    -0.02,
    balcony.z + balcony.d / 2,
  );
  floor.receiveShadow = true;
  floor.userData = { roomId: "balcony", label: "Balcony" };
  g.add(floor);
  return g;
}

/**
 * Build the base plinth under the entire model.
 */
function buildPlinth(tok: TokMap): THREE.Mesh {
  const totalW = 9.0;
  const totalD = 8.0 + 1.6; // include balcony
  const geo = new THREE.BoxGeometry(totalW + 0.4, 0.12, totalD + 0.4);
  const mat = new THREE.MeshLambertMaterial({ color: hex(tok.espresso900) });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(totalW / 2, -0.06, (8.0 + 1.6) / 2 - 1.6);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}

/**
 * Given a wall segment and its list of openings, return an array of
 * BoxGeometry-backed meshes that together represent the solid wall portions
 * (gaps cut at each opening's position).
 *
 * The wall runs from start→end in the XZ plane.
 * Thickness is extruded perpendicular to travel, height is Y.
 */
function buildWallSegment(
  wall: WallSegment,
  wallOpenings: Opening[],
  tok: TokMap,
): THREE.Group {
  const g = new THREE.Group();

  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.z - wall.start.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx); // rotation around Y

  const wallColor = hex(tok.espresso900);
  const edgeMat = () => new THREE.LineBasicMaterial({ color: wallColor });

  // Sort openings by offset
  const sorted = [...wallOpenings].sort((a, b) => a.offset - b.offset);

  // Collect cut intervals [lo, hi] along the wall length
  const cuts: [number, number][] = sorted.map((o) => [
    clamp(o.offset, 0, length),
    clamp(o.offset + o.width, 0, length),
  ]);

  // Build transparent-fill / outline-only wall segments
  let cursor = 0;
  const segments: [number, number][] = [];
  for (const [lo, hi] of cuts) {
    if (cursor < lo) segments.push([cursor, lo]);
    cursor = hi;
  }
  if (cursor < length) segments.push([cursor, length]);

  for (const [lo, hi] of segments) {
    const segLen = hi - lo;
    if (segLen < 0.01) continue;
    const box = new THREE.BoxGeometry(segLen, wall.height, wall.thickness);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose(); // box itself is only needed to derive edges
    const line = new THREE.LineSegments(edges, edgeMat());

    const midOffset = lo + segLen / 2;
    const wx = wall.start.x + Math.cos(angle) * midOffset;
    const wz = wall.start.z + Math.sin(angle) * midOffset;
    line.position.set(wx, wall.height / 2, wz);
    line.rotation.y = -angle;
    g.add(line);
  }

  // ---- Window glazing ----
  for (const op of wallOpenings.filter((o) => o.type === "window")) {
    const midOff = op.offset + op.width / 2;
    const wx = wall.start.x + Math.cos(angle) * midOff;
    const wz = wall.start.z + Math.sin(angle) * midOff;

    // Translucent pane
    const paneH = wall.height * 0.5;
    const paneGeo = new THREE.PlaneGeometry(op.width - 0.04, paneH);
    const paneMat = new THREE.MeshBasicMaterial({
      color: 0xb8d8f0,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const pane = new THREE.Mesh(paneGeo, paneMat);
    pane.position.set(wx, wall.height * 0.62, wz);
    pane.rotation.y = -angle;
    g.add(pane);

    // Window sill — outline only
    const sillBox = new THREE.BoxGeometry(op.width + 0.05, 0.06, wall.thickness + 0.06);
    const sillEdges = new THREE.EdgesGeometry(sillBox);
    sillBox.dispose();
    const sillLine = new THREE.LineSegments(sillEdges, edgeMat());
    sillLine.position.set(wx, wall.height * 0.37, wz);
    sillLine.rotation.y = -angle;
    g.add(sillLine);
  }

  // ---- Doors: drawn as the classic floor-plan symbol (swing arc + open
  //      leaf), kept flat on the floor so nothing reads as a tall cabinet. ----
  for (const op of wallOpenings.filter((o) => o.type === "door")) {
    const side = op.swingSide ?? 1;
    const doorColor = hex(op.accent ? tok.bronze500 : tok.tan400);

    // Hinge at one edge of the opening
    const hingeOff = op.offset;
    const hx = wall.start.x + Math.cos(angle) * hingeOff;
    const hz = wall.start.z + Math.sin(angle) * hingeOff;

    // The door opens 90° toward the room. Leaf + arc share this same angle so
    // they always point the same direction.
    const openAngle = angle + side * (Math.PI / 2);

    // Quarter-circle swing arc on the floor. The angular span is baked into the
    // geometry and rotation.x = +π/2 lays it flat WITHOUT mirroring, so the arc
    // sweeps from the closed jamb (along the wall) to the open leaf position.
    const arcRadius = op.width;
    const arcStart = side > 0 ? angle : angle - Math.PI / 2;
    const arcGeo = new THREE.RingGeometry(arcRadius - 0.03, arcRadius, 32, 1, arcStart, Math.PI / 2);
    const arcMat = new THREE.MeshBasicMaterial({
      color: doorColor,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const arc = new THREE.Mesh(arcGeo, arcMat);
    arc.rotation.x = Math.PI / 2;
    arc.position.set(hx, 0.022, hz);
    g.add(arc);

    // Open leaf as a thin flat board from the hinge to the fully-open (90°)
    // position — flat on the floor, so it never juts up like a panel.
    const leafGeo = new THREE.BoxGeometry(op.width, 0.05, 0.07);
    leafGeo.translate(op.width / 2, 0, 0); // move pivot to the hinge end
    const leaf = new THREE.Mesh(leafGeo, new THREE.MeshLambertMaterial({ color: doorColor }));
    leaf.position.set(hx, 0.025, hz);
    leaf.rotation.y = -openAngle;
    g.add(leaf);
  }

  return g;
}

/** Build a furniture piece as a rounded box proxy */
function buildFurniture(f: Furniture): THREE.Group {
  const g = new THREE.Group();
  const color = f.color ? hex(f.color) : hex(TOKENS.tan400);
  const mat = new THREE.MeshLambertMaterial({ color });

  if (f.type === "wc") {
    // Toilet: cylinder body
    const cGeo = new THREE.CylinderGeometry(0.22, 0.22, f.h, 16);
    const c = new THREE.Mesh(cGeo, mat);
    c.position.set(f.x + f.w / 2, f.h / 2, f.z + f.d / 2);
    c.castShadow = true;
    g.add(c);
  } else if (f.type === "basin") {
    const bGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16);
    const b = new THREE.Mesh(bGeo, mat);
    b.position.set(f.x + f.w / 2, f.h, f.z + f.d / 2);
    b.castShadow = true;
    g.add(b);
  } else if (f.type === "tub") {
    // Bath tub: box with interior cutout (just render as a wide low box)
    const geo = new THREE.BoxGeometry(f.w, f.h, f.d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(f.x + f.w / 2, f.h / 2, f.z + f.d / 2);
    m.castShadow = true;
    g.add(m);
    // Inner cutout suggestion (darker inset)
    const innW = f.w - 0.1;
    const innD = f.d - 0.1;
    const innGeo = new THREE.BoxGeometry(innW, 0.02, innD);
    const innMat = new THREE.MeshLambertMaterial({ color: hex(TOKENS.sand200) });
    const inn = new THREE.Mesh(innGeo, innMat);
    inn.position.set(f.x + f.w / 2, f.h + 0.01, f.z + f.d / 2);
    g.add(inn);
  } else if (f.type === "shower") {
    // Shower tray
    const geo = new THREE.BoxGeometry(f.w, 0.06, f.d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(f.x + f.w / 2, 0.03, f.z + f.d / 2);
    // Glass panels (three sides)
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0xd4eaf7, transparent: true, opacity: 0.25, side: THREE.DoubleSide,
    });
    const glassH = 1.5;
    const backGeo = new THREE.PlaneGeometry(f.w, glassH);
    const backPane = new THREE.Mesh(backGeo, glassMat);
    backPane.position.set(f.x + f.w / 2, glassH / 2, f.z);
    g.add(backPane);
    const sideGeo = new THREE.PlaneGeometry(f.d, glassH);
    const sidePane = new THREE.Mesh(sideGeo, glassMat);
    sidePane.rotation.y = Math.PI / 2;
    sidePane.position.set(f.x, glassH / 2, f.z + f.d / 2);
    g.add(sidePane);
    g.add(m);
  } else if (f.type === "sofa") {
    // Sofa: seat + back cushion
    const seatGeo = new THREE.BoxGeometry(f.w, f.h * 0.6, f.d);
    const seat = new THREE.Mesh(seatGeo, mat);
    seat.position.set(f.x + f.w / 2, f.h * 0.3, f.z + f.d / 2);
    seat.castShadow = true;
    g.add(seat);
    const backGeo = new THREE.BoxGeometry(f.w, f.h * 0.8, 0.2);
    const back = new THREE.Mesh(backGeo, mat);
    back.position.set(f.x + f.w / 2, f.h * 0.5, f.z + 0.1);
    back.castShadow = true;
    g.add(back);
  } else if (f.type === "bed") {
    // Bed: frame + mattress + pillow
    const frameGeo = new THREE.BoxGeometry(f.w + 0.1, 0.12, f.d + 0.1);
    const frameMat = new THREE.MeshLambertMaterial({ color: hex(TOKENS.espresso700) });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(f.x + f.w / 2, 0.06, f.z + f.d / 2);
    frame.castShadow = true;
    g.add(frame);
    const mattressGeo = new THREE.BoxGeometry(f.w - 0.05, 0.22, f.d - 0.15);
    const mattress = new THREE.Mesh(mattressGeo, mat);
    mattress.position.set(f.x + f.w / 2, 0.23, f.z + f.d / 2 + 0.05);
    mattress.castShadow = true;
    g.add(mattress);
    // Pillow
    const pilGeo = new THREE.BoxGeometry(f.w * 0.35, 0.1, 0.2);
    const pilMat = new THREE.MeshLambertMaterial({ color: hex(TOKENS.paper) });
    const pil1 = new THREE.Mesh(pilGeo, pilMat);
    pil1.position.set(f.x + f.w * 0.28, 0.39, f.z + 0.25);
    g.add(pil1);
    const pil2 = new THREE.Mesh(pilGeo, pilMat);
    pil2.position.set(f.x + f.w * 0.72, 0.39, f.z + 0.25);
    g.add(pil2);
  } else if (f.type === "rug") {
    const geo = new THREE.PlaneGeometry(f.w, f.d);
    const m = new THREE.Mesh(geo, mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(f.x + f.w / 2, 0.003, f.z + f.d / 2);
    g.add(m);
  } else {
    // Generic box for counters, shelves, tables, chairs, wardrobes, etc.
    const geo = new THREE.BoxGeometry(f.w, f.h, f.d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(f.x + f.w / 2, f.h / 2, f.z + f.d / 2);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  }

  if (f.rotY) g.rotation.y = f.rotY;
  return g;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// Dimensions of the floating EPC card (used for edge-flip logic).
const PANEL_W = 200;
const PANEL_H = 90;
const PAD     = 14;

interface HoverState {
  roomId: string;
  /** Room centre projected to canvas pixels — used for the leader dot. */
  dotX: number;
  dotY: number;
  /** Panel top-left corner in canvas pixels. */
  panelX: number;
  panelY: number;
  /** Accent colour from the room's EPC rating, used for SVG connector. */
  accentColor: string;
}

export default function FloorPlan3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverState, setHoverState] = useState<HoverState | null>(null);

  const buildScene = useCallback((container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = container.clientHeight;

    // ---- Read brand tokens ----
    const tok: TokMap = {
      paper:       readToken("--color-paper",       TOKENS.paper),
      sand100:     readToken("--color-sand-100",     TOKENS.sand100),
      sand200:     readToken("--color-sand-200",     TOKENS.sand200),
      tan300:      readToken("--color-tan-300",      TOKENS.tan300),
      tan400:      readToken("--color-tan-400",      TOKENS.tan400),
      bronze500:   readToken("--color-bronze-500",   TOKENS.bronze500),
      bronze600:   readToken("--color-bronze-600",   TOKENS.bronze600),
      espresso700: readToken("--color-espresso-700", TOKENS.espresso700),
      espresso800: readToken("--color-espresso-800", TOKENS.espresso800),
      espresso900: readToken("--color-espresso-900", TOKENS.espresso900),
    };

    // ---- Renderer ----
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // ---- Scene ----
    const scene = new THREE.Scene();
    scene.background = null; // transparent, shows page bg

    // ---- Camera ----
    // Orthographic camera looking down at ~32° tilt
    const planW = 9.0;
    const planD = 8.0 + 1.6; // +balcony
    const aspect = W / H;
    const frustumH = planD * 1.5;
    const frustumW = frustumH * aspect;
    const camera = new THREE.OrthographicCamera(
      -frustumW / 2, frustumW / 2,
       frustumH / 2, -frustumH / 2,
      0.1, 100,
    );
    // Centre the plan
    const cx = planW / 2;
    const cz = planD / 2 - 1.6; // offset for balcony
    const camDist = 18;
    const tiltRad  = THREE.MathUtils.degToRad(58);
    // Fixed south-east view, more top-down so the whole floor plan is visible.
    const hAngle = Math.PI * 0.18; // ~32° toward east
    camera.position.set(
      cx + Math.sin(hAngle) * Math.cos(tiltRad) * camDist,
      Math.sin(tiltRad) * camDist,
      cz + Math.cos(hAngle) * Math.cos(tiltRad) * camDist,
    );
    camera.lookAt(cx, 0, cz);

    // ---- Building screen-bbox helper ----
    // Eight corners of the building world-space bounding box.
    const wallH = 2.7;
    const bldgCorners = [
      new THREE.Vector3(0,     0,     0),     new THREE.Vector3(planW, 0,     0),
      new THREE.Vector3(planW, 0,     planD), new THREE.Vector3(0,     0,     planD),
      new THREE.Vector3(0,     wallH, 0),     new THREE.Vector3(planW, wallH, 0),
      new THREE.Vector3(planW, wallH, planD), new THREE.Vector3(0,     wallH, planD),
    ];
    /** Returns the axis-aligned screen bbox of the model at the current camera angle. */
    function modelScreenBbox(cw: number, ch: number) {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const c of bldgCorners) {
        const p = c.clone().project(camera);
        const sx = ((p.x + 1) / 2) * cw;
        const sy = ((-p.y + 1) / 2) * ch;
        if (sx < x0) x0 = sx;  if (sx > x1) x1 = sx;
        if (sy < y0) y0 = sy;  if (sy > y1) y1 = sy;
      }
      return { x0, x1, y0, y1 };
    }

    // ---- Controls ----
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan  = false;
    controls.enableZoom = false;
    controls.minZoom = 0.6;
    controls.maxZoom = 2.5;
    controls.maxPolarAngle = THREE.MathUtils.degToRad(75);
    controls.minPolarAngle = THREE.MathUtils.degToRad(10);
    controls.target.set(cx, 0, cz);
    controls.update();

    // ---- Lights ----
    const hemi = new THREE.HemisphereLight(
      hex(tok.paper), hex(tok.tan300), 0.85,
    );
    scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xfff8f0, 1.4);
    dirLight.position.set(cx + 6, 14, cz - 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -12;
    dirLight.shadow.camera.right = 14;
    dirLight.shadow.camera.top = 12;
    dirLight.shadow.camera.bottom = -12;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Shadow-catcher plane
    const catcherGeo = new THREE.PlaneGeometry(planW + 4, planD + 4);
    const catcherMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const catcher = new THREE.Mesh(catcherGeo, catcherMat);
    catcher.rotation.x = -Math.PI / 2;
    catcher.position.set(cx, -0.001, cz);
    catcher.receiveShadow = true;
    scene.add(catcher);

    // ---- Build geometry ----
    // Plinth
    scene.add(buildPlinth(tok));

    // Room floors
    const floorMeshes: THREE.Mesh[] = [];
    for (const room of rooms) {
      const m = buildFloor(room);
      floorMeshes.push(m);
      scene.add(m);
    }

    // Balcony
    scene.add(buildBalcony(tok));

    // Walls (with openings)
    const openingsByWall = new Map<string, Opening[]>();
    for (const op of openings) {
      if (!openingsByWall.has(op.wallId)) openingsByWall.set(op.wallId, []);
      openingsByWall.get(op.wallId)!.push(op);
    }
    for (const wall of walls) {
      const wallGroup = buildWallSegment(wall, openingsByWall.get(wall.id) ?? [], tok);
      scene.add(wallGroup);
    }

    // Furniture
    for (const f of furniture) {
      scene.add(buildFurniture(f));
    }

    // ---- Raycaster for hover ----
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoverId: string | null = null;
    const originalColors = new Map<THREE.Mesh, number>();

    /** Compute the full HoverState for a roomId at the current camera angle. */
    function computeLabelState(id: string): HoverState | null {
      const mesh = floorMeshes.find((m) => m.userData.roomId === id);
      if (!mesh) return null;
      const cw = renderer.domElement.clientWidth;
      const ch = renderer.domElement.clientHeight;
      if (!cw || !ch) return null;

      const centre = new THREE.Vector3(mesh.position.x, 0, mesh.position.z);
      centre.project(camera);
      const dotX = ((centre.x + 1) / 2) * cw;
      const dotY = ((-centre.y + 1) / 2) * ch;

      // GAP: px gap between model screen-edge and panel edge
      const GAP = 52;
      const bb  = modelScreenBbox(cw, ch);
      let panelX: number;
      if (dotX >= cw / 2) {
        panelX = bb.x1 + GAP;
      } else {
        panelX = bb.x0 - GAP - PANEL_W;
      }
      panelX = Math.max(PAD, Math.min(panelX, cw - PANEL_W - PAD));
      const panelY = Math.max(PAD, Math.min(dotY - PANEL_H / 2, ch - PANEL_H - PAD));

      const rating = roomEpcData[id]?.rating ?? "D";
      const accentColor = EPC_COLORS[rating] ?? EPC_COLORS["D"];
      return { roomId: id, dotX, dotY, panelX, panelY, accentColor };
    }

    // ---- Auto-cycling label ----
    // Cycles through rooms when nothing is manually hovered.
    let isManualHover = false;
    let autoRoomId: string | null = null;
    let autoHighlightMesh: THREE.Mesh | null = null;
    const autoRoomIds = rooms.map((r) => r.id);
    let autoIndex = 0;

    function setAutoHighlight(id: string | null) {
      if (autoHighlightMesh) {
        const orig = originalColors.get(autoHighlightMesh);
        if (orig !== undefined)
          (autoHighlightMesh.material as THREE.MeshLambertMaterial).color.set(orig);
        autoHighlightMesh = null;
      }
      if (!id) return;
      const mesh = floorMeshes.find((m) => m.userData.roomId === id);
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshLambertMaterial;
      if (!originalColors.has(mesh)) originalColors.set(mesh, mat.color.getHex());
      mat.color.set(hex(tok.tan300));
      autoHighlightMesh = mesh;
    }

    function showAutoLabel(id: string) {
      autoRoomId = id;
      setAutoHighlight(id);
      const state = computeLabelState(id);
      if (state) setHoverState(state);
    }

    // Advance room every 2.5 s
    const initialDelay = setTimeout(() => {
      showAutoLabel(autoRoomIds[0]);
    }, 600);

    const cycleInterval = setInterval(() => {
      if (isManualHover) return;
      autoIndex = (autoIndex + 1) % autoRoomIds.length;
      showAutoLabel(autoRoomIds[autoIndex]);
    }, 2500);

    // Re-project label position as model rotates (~8 fps is smooth enough)
    const positionInterval = setInterval(() => {
      if (isManualHover || !autoRoomId) return;
      const state = computeLabelState(autoRoomId);
      if (state) setHoverState(state);
    }, 120);

    function onPointerMove(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(floorMeshes);

      if (hits.length > 0) {
        const hit = hits[0].object as THREE.Mesh;
        const id: string = hit.userData.roomId;

        // Transition auto → manual: clear auto highlight first
        if (!isManualHover) {
          isManualHover = true;
          setAutoHighlight(null);
        }

        if (id !== hoverId) {
          if (hoverId) {
            const prev = floorMeshes.find((m) => m.userData.roomId === hoverId);
            if (prev) {
              const orig = originalColors.get(prev);
              if (orig !== undefined)
                (prev.material as THREE.MeshLambertMaterial).color.set(orig);
            }
          }
          const mat = hit.material as THREE.MeshLambertMaterial;
          if (!originalColors.has(hit)) originalColors.set(hit, mat.color.getHex());
          mat.color.set(hex(tok.tan300));
          hoverId = id;

          const state = computeLabelState(id);
          if (state) setHoverState(state);
        }
      } else if (hoverId) {
        // Restore manual highlight and hand back to auto-cycling
        const prev = floorMeshes.find((m) => m.userData.roomId === hoverId);
        if (prev) {
          const orig = originalColors.get(prev);
          if (orig !== undefined)
            (prev.material as THREE.MeshLambertMaterial).color.set(orig);
        }
        hoverId = null;
        isManualHover = false;
        if (autoRoomId) {
          setAutoHighlight(autoRoomId);
          const state = computeLabelState(autoRoomId);
          if (state) setHoverState(state);
        }
      }
    }
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    // ---- Auto-rotate — slow clockwise spin ----
    controls.autoRotate      = true;
    controls.autoRotateSpeed = -0.6; // negative = clockwise viewed from above

    // ---- Render loop — continuous for auto-rotation ----
    let rafId = 0;
    let isVisible = true;

    function loop() {
      rafId = requestAnimationFrame(loop);
      if (!isVisible) return;
      controls.update(); // drives auto-rotation + damping
      renderer.render(scene, camera);
    }
    loop();

    // ---- Resize ----
    function onResize() {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const asp = cw / ch;
      const fh = planD * 1.5;
      const fw = fh * asp;
      (camera as THREE.OrthographicCamera).left = -fw / 2;
      (camera as THREE.OrthographicCamera).right = fw / 2;
      (camera as THREE.OrthographicCamera).top = fh / 2;
      (camera as THREE.OrthographicCamera).bottom = -fh / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // ---- IntersectionObserver: track visibility for loop gating ----
    const io = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 },
    );
    io.observe(container);

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(initialDelay);
      clearInterval(cycleInterval);
      clearInterval(positionInterval);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);

      controls.dispose();
      // Dispose all geometries and materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cleanup = buildScene(container);
    return cleanup;
  }, [buildScene]);

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {hoverState && (() => {
        const { roomId, dotX, dotY, panelX, panelY, accentColor } = hoverState;
        // Connect dot to the nearest vertical edge midpoint of the panel.
        const lineX = panelX > dotX ? panelX : panelX + PANEL_W;
        const lineY = panelY + PANEL_H / 2;
        return (
          <>
            {/* SVG overlay: dashed leader line + dot at room centre */}
            <svg
              className="pointer-events-none absolute inset-0 w-full h-full"
              style={{ zIndex: 15 }}
            >
              <line
                x1={dotX} y1={dotY}
                x2={lineX} y2={lineY}
                stroke={accentColor}
                strokeWidth="1"
                strokeDasharray="5 4"
                opacity="0.6"
              />
              <circle
                cx={dotX} cy={dotY} r="3.5"
                fill={accentColor}
                opacity="0.9"
              />
            </svg>

            {/* EPC panel — always in a canvas corner, never over the model */}
            <div
              className="pointer-events-none absolute"
              style={{ zIndex: 20, left: panelX, top: panelY, width: PANEL_W }}
            >
              <EpcPanel roomId={roomId} />
            </div>
          </>
        );
      })()}
    </div>
  );
}
