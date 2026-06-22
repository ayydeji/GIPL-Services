import * as THREE from "three";
import {
  rooms,
  walls,
  openings,
  furniture,
  balcony,
  TOKENS,
  type WallSegment,
  type Opening,
  type Room,
  type Furniture,
} from "@/lib/floor-plan-data";

export type TokMap = Record<keyof typeof TOKENS, string>;

export const FLOOR_PLAN_WIDTH = 9.0;
export const FLOOR_PLAN_DEPTH = 8.0 + 1.6;
export const FLOOR_PLAN_CENTER_X = FLOOR_PLAN_WIDTH / 2;
export const FLOOR_PLAN_CENTER_Z = FLOOR_PLAN_DEPTH / 2 - 1.6;

export function hex(token: string): number {
  return parseInt(token.replace("#", ""), 16);
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function buildFloor(room: Room, inset = 0.02): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(room.w - inset * 2, room.d - inset * 2);
  const mat = new THREE.MeshLambertMaterial({ color: hex(room.floorColor) });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(room.x + room.w / 2, 0.001, room.z + room.d / 2);
  mesh.receiveShadow = true;
  mesh.userData = { roomId: room.id, label: room.label };
  return mesh;
}

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

function buildPlinth(tok: TokMap): THREE.Mesh {
  const totalW = FLOOR_PLAN_WIDTH;
  const totalD = FLOOR_PLAN_DEPTH;
  const geo = new THREE.BoxGeometry(totalW + 0.4, 0.12, totalD + 0.4);
  const mat = new THREE.MeshLambertMaterial({ color: hex(tok.espresso900) });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(totalW / 2, -0.06, totalD / 2 - 1.6);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  return mesh;
}

function buildWallSegment(
  wall: WallSegment,
  wallOpenings: Opening[],
  tok: TokMap,
): THREE.Group {
  const g = new THREE.Group();

  const dx = wall.end.x - wall.start.x;
  const dz = wall.end.z - wall.start.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);

  const wallColor = hex(tok.espresso900);
  const edgeMatFn = () => new THREE.LineBasicMaterial({ color: wallColor });

  const sorted = [...wallOpenings].sort((a, b) => a.offset - b.offset);
  const cuts: [number, number][] = sorted.map((o) => [
    clamp(o.offset, 0, length),
    clamp(o.offset + o.width, 0, length),
  ]);

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
    box.dispose();
    const line = new THREE.LineSegments(edges, edgeMatFn());

    const midOffset = lo + segLen / 2;
    const wx = wall.start.x + Math.cos(angle) * midOffset;
    const wz = wall.start.z + Math.sin(angle) * midOffset;
    line.position.set(wx, wall.height / 2, wz);
    line.rotation.y = -angle;
    g.add(line);
  }

  for (const op of wallOpenings.filter((o) => o.type === "window")) {
    const midOff = op.offset + op.width / 2;
    const wx = wall.start.x + Math.cos(angle) * midOff;
    const wz = wall.start.z + Math.sin(angle) * midOff;

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

    const sillBox = new THREE.BoxGeometry(op.width + 0.05, 0.06, wall.thickness + 0.06);
    const sillEdges = new THREE.EdgesGeometry(sillBox);
    sillBox.dispose();
    const sillLine = new THREE.LineSegments(sillEdges, edgeMatFn());
    sillLine.position.set(wx, wall.height * 0.37, wz);
    sillLine.rotation.y = -angle;
    g.add(sillLine);
  }

  for (const op of wallOpenings.filter((o) => o.type === "door")) {
    const side = op.swingSide ?? 1;
    const doorColor = hex(op.accent ? tok.bronze500 : tok.tan400);

    const hingeOff = op.offset;
    const hx = wall.start.x + Math.cos(angle) * hingeOff;
    const hz = wall.start.z + Math.sin(angle) * hingeOff;
    const openAngle = angle + side * (Math.PI / 2);

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

    const leafGeo = new THREE.BoxGeometry(op.width, 0.05, 0.07);
    leafGeo.translate(op.width / 2, 0, 0);
    const leaf = new THREE.Mesh(leafGeo, new THREE.MeshLambertMaterial({ color: doorColor }));
    leaf.position.set(hx, 0.025, hz);
    leaf.rotation.y = -openAngle;
    g.add(leaf);
  }

  return g;
}

function buildFurniture(f: Furniture): THREE.Group {
  const g = new THREE.Group();
  const color = f.color ? hex(f.color) : hex(TOKENS.tan400);
  const mat = new THREE.MeshLambertMaterial({ color });

  if (f.type === "wc") {
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
    const geo = new THREE.BoxGeometry(f.w, f.h, f.d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(f.x + f.w / 2, f.h / 2, f.z + f.d / 2);
    m.castShadow = true;
    g.add(m);
    const innW = f.w - 0.1;
    const innD = f.d - 0.1;
    const innGeo = new THREE.BoxGeometry(innW, 0.02, innD);
    const innMat = new THREE.MeshLambertMaterial({ color: hex(TOKENS.sand200) });
    const inn = new THREE.Mesh(innGeo, innMat);
    inn.position.set(f.x + f.w / 2, f.h + 0.01, f.z + f.d / 2);
    g.add(inn);
  } else if (f.type === "shower") {
    const geo = new THREE.BoxGeometry(f.w, 0.06, f.d);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(f.x + f.w / 2, 0.03, f.z + f.d / 2);
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

export interface FloorPlanScene {
  group: THREE.Group;
  floorMeshes: THREE.Mesh[];
}

/** Full apartment floor plan geometry — shared by hero and services showcase. */
export function buildFloorPlanScene(tok: TokMap): FloorPlanScene {
  const group = new THREE.Group();
  const floorMeshes: THREE.Mesh[] = [];

  group.add(buildPlinth(tok));

  for (const room of rooms) {
    const mesh = buildFloor(room);
    floorMeshes.push(mesh);
    group.add(mesh);
  }

  group.add(buildBalcony(tok));

  const openingsByWall = new Map<string, Opening[]>();
  for (const op of openings) {
    if (!openingsByWall.has(op.wallId)) openingsByWall.set(op.wallId, []);
    openingsByWall.get(op.wallId)!.push(op);
  }
  for (const wall of walls) {
    group.add(buildWallSegment(wall, openingsByWall.get(wall.id) ?? [], tok));
  }
  for (const f of furniture) {
    group.add(buildFurniture(f));
  }

  return { group, floorMeshes };
}

/** Target height in the services carousel orthographic frustum (frustumH = 5.0). */
const SERVICE_SHOWCASE_HEIGHT = 2.8;

/** Same model as the hero, centred and scaled for the services carousel card. */
export function buildFloorPlanForServices(tok: TokMap): THREE.Group {
  const { group } = buildFloorPlanScene(tok);
  const wrapper = new THREE.Group();
  wrapper.add(group);

  const scale = SERVICE_SHOWCASE_HEIGHT / FLOOR_PLAN_DEPTH;
  wrapper.scale.setScalar(scale);
  wrapper.position.set(
    -FLOOR_PLAN_CENTER_X * scale,
    0,
    -FLOOR_PLAN_CENTER_Z * scale,
  );

  return wrapper;
}
