import * as THREE from "three";
import { TOKENS, EPC_COLORS, readToken } from "@/lib/floor-plan-data";
import { buildFloorPlanForServices, hex, type TokMap } from "@/lib/floor-plan-scene";
import type { ServiceVisual } from "@/lib/site-config";
import type { VisualSceneBundle } from "@/components/service-visual-gpu/types";
import { serviceVisualLoopConfig } from "@/components/service-visual-gpu/visualLoopConfig";

const FRUSTUM_HEIGHT = 5.0;

export function readBrandTokens(): TokMap {
  return {
    paper: readToken("--color-paper", TOKENS.paper),
    sand100: readToken("--color-sand-100", TOKENS.sand100),
    sand200: readToken("--color-sand-200", TOKENS.sand200),
    tan300: readToken("--color-tan-300", TOKENS.tan300),
    tan400: readToken("--color-tan-400", TOKENS.tan400),
    bronze500: readToken("--color-bronze-500", TOKENS.bronze500),
    bronze600: readToken("--color-bronze-600", TOKENS.bronze600),
    espresso700: readToken("--color-espresso-700", TOKENS.espresso700),
    espresso800: readToken("--color-espresso-800", TOKENS.espresso800),
    espresso900: readToken("--color-espresso-900", TOKENS.espresso900),
  };
}

function buildEpcLadder(tok: TokMap): THREE.Group {
  const g = new THREE.Group();
  const bands = ["A", "B", "C", "D", "E", "F", "G"] as const;
  const highlighted = 1;

  const baseW = 0.9;
  const step = 0.22;
  const bandH = 0.28;
  const depth = 0.18;
  const gap = 0.06;
  const totalH = bands.length * (bandH + gap);

  bands.forEach((band, i) => {
    const w = baseW + i * step;
    const y = totalH / 2 - i * (bandH + gap);
    const isHit = i === highlighted;
    const color = hex(EPC_COLORS[band]);

    const geo = new THREE.BoxGeometry(w, bandH, depth);
    const mat = new THREE.MeshLambertMaterial({
      color,
      transparent: true,
      opacity: isHit ? 0.85 : 0.35,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(-0.5 + w / 2 - baseW / 2, y, isHit ? 0.15 : 0);
    g.add(mesh);

    const edgesGeo = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: isHit ? 1.0 : 0.6,
    });
    const edges = new THREE.LineSegments(edgesGeo, edgeMat);
    edges.position.copy(mesh.position);
    g.add(edges);

    if (isHit) {
      const arrowGeo = new THREE.ConeGeometry(0.1, 0.22, 3);
      const arrowMat = new THREE.MeshLambertMaterial({ color });
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.rotation.z = -Math.PI / 2;
      arrow.position.set(mesh.position.x + w / 2 + 0.14, y, 0.15);
      g.add(arrow);
    }
  });

  const titleGeo = new THREE.BoxGeometry(baseW + 6 * step + 0.3, 0.22, 0.04);
  const titleMat = new THREE.LineBasicMaterial({
    color: hex(tok.espresso900),
    opacity: 0.3,
    transparent: true,
  });
  const titleLine = new THREE.LineSegments(new THREE.EdgesGeometry(titleGeo), titleMat);
  titleLine.position.set(-0.5 + (baseW + 6 * step) / 2 - baseW / 2, totalH / 2 + 0.28, 0);
  titleGeo.dispose();
  g.add(titleLine);

  return g;
}

function buildTourRoom(tok: TokMap): THREE.Group {
  const g = new THREE.Group();
  const wallColor = hex(tok.espresso900);
  const edgeMat = () =>
    new THREE.LineBasicMaterial({ color: wallColor, opacity: 0.7, transparent: true });
  const pathColor = hex(tok.bronze500);

  const rW = 3.6;
  const rH = 2.4;
  const rD = 2.4;
  const roomGeo = new THREE.BoxGeometry(rW, rH, rD);
  const roomEdges = new THREE.EdgesGeometry(roomGeo);
  roomGeo.dispose();
  g.add(new THREE.LineSegments(roomEdges, edgeMat()));

  const floorGeo = new THREE.PlaneGeometry(rW - 0.05, rD - 0.05);
  const floor = new THREE.Mesh(
    floorGeo,
    new THREE.MeshBasicMaterial({
      color: hex(tok.sand100),
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -rH / 2 + 0.002;
  g.add(floor);

  const winGeo = new THREE.PlaneGeometry(0.8, 0.55);
  const win = new THREE.Mesh(
    winGeo,
    new THREE.MeshBasicMaterial({
      color: 0xb8d8f0,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    }),
  );
  win.position.set(0, 0.3, -rD / 2 + 0.01);
  g.add(win);

  const winEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.82, 0.57, 0.01));
  const winEdge = new THREE.LineSegments(
    winEdgeGeo,
    new THREE.LineBasicMaterial({ color: wallColor, opacity: 0.5, transparent: true }),
  );
  winEdge.position.copy(win.position);
  g.add(winEdge);

  const sofaGeo = new THREE.BoxGeometry(1.2, 0.35, 0.5);
  const sofaEdges = new THREE.EdgesGeometry(sofaGeo);
  sofaGeo.dispose();
  const sofa = new THREE.LineSegments(
    sofaEdges,
    new THREE.LineBasicMaterial({ color: hex(tok.tan400), opacity: 0.6, transparent: true }),
  );
  sofa.position.set(0, -rH / 2 + 0.18, -rD / 2 + 0.4);
  g.add(sofa);

  const tableGeo = new THREE.BoxGeometry(0.7, 0.12, 0.5);
  const tableEdges = new THREE.EdgesGeometry(tableGeo);
  tableGeo.dispose();
  const table = new THREE.LineSegments(
    tableEdges,
    new THREE.LineBasicMaterial({ color: hex(tok.tan400), opacity: 0.5, transparent: true }),
  );
  table.position.set(0, -rH / 2 + 0.38, 0.2);
  g.add(table);

  const pathPoints = [
    new THREE.Vector3(-1.1, -rH / 2 + 0.05, 0.6),
    new THREE.Vector3(-0.6, -rH / 2 + 0.05, -0.5),
    new THREE.Vector3(0.4, -rH / 2 + 0.05, -0.7),
    new THREE.Vector3(1.0, -rH / 2 + 0.05, 0.0),
    new THREE.Vector3(0.3, -rH / 2 + 0.05, 0.8),
    new THREE.Vector3(-1.1, -rH / 2 + 0.05, 0.6),
  ];
  const curve = new THREE.CatmullRomCurve3(pathPoints, true);
  const pathGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(80));
  const pathLine = new THREE.Line(
    pathGeo,
    new THREE.LineDashedMaterial({
      color: pathColor,
      dashSize: 0.14,
      gapSize: 0.09,
      opacity: 0.7,
      transparent: true,
    }),
  );
  pathLine.computeLineDistances();
  g.add(pathLine);

  const camMarker = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.13),
    new THREE.MeshLambertMaterial({ color: pathColor }),
  );
  camMarker.position.copy(pathPoints[0]!);
  g.add(camMarker);

  g.userData.cameraMarker = camMarker;
  g.userData.curve = curve;

  return g;
}

export function buildVisualGroup(visual: ServiceVisual, tok: TokMap): THREE.Group {
  switch (visual) {
    case "epc-ladder":
      return buildEpcLadder(tok);
    case "tour-room":
      return buildTourRoom(tok);
    case "floor-plan":
      return buildFloorPlanForServices(tok);
  }
}

export function createOrthographicCamera(aspect: number): THREE.OrthographicCamera {
  const frustumW = FRUSTUM_HEIGHT * aspect;
  const camera = new THREE.OrthographicCamera(
    -frustumW / 2,
    frustumW / 2,
    FRUSTUM_HEIGHT / 2,
    -FRUSTUM_HEIGHT / 2,
    0.1,
    100,
  );
  camera.position.set(3.5, 4.5, 6);
  camera.lookAt(0, 0, 0);
  return camera;
}

function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (
      obj instanceof THREE.Mesh ||
      obj instanceof THREE.LineSegments ||
      obj instanceof THREE.Line
    ) {
      obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((mat) => mat.dispose());
    }
  });
}

export function createVisualScene(
  visual: ServiceVisual,
  width: number,
  height: number,
): VisualSceneBundle {
  const tok = readBrandTokens();
  const aspect = width / Math.max(height, 1);
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = createOrthographicCamera(aspect);

  const hemi = new THREE.HemisphereLight(hex(tok.paper), hex(tok.tan300), 0.9);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xfff8f0, 1.3);
  dir.position.set(6, 10, 5);
  scene.add(dir);

  const group = buildVisualGroup(visual, tok);
  const pivot = new THREE.Group();
  pivot.add(group);
  scene.add(pivot);

  const loop = serviceVisualLoopConfig[visual];

  return {
    visual,
    scene,
    camera,
    pivot,
    group,
    animate(time: number, reduced: boolean) {
      if (!reduced) {
        pivot.rotation.y = time * loop.rotationSpeed;
      }

      if (visual === "tour-room") {
        const cam = group.userData.cameraMarker as THREE.Mesh | undefined;
        const curve = group.userData.curve as THREE.CatmullRomCurve3 | undefined;
        if (cam && curve && !reduced) {
          curve.getPoint((time * loop.pathSpeed) % 1, cam.position);
        }
      }

      if (visual === "epc-ladder" && !reduced) {
        const child = group.children[2];
        if (child) {
          child.position.z = 0.15 + Math.sin(time * loop.liftSpeed) * 0.04;
        }
      }
    },
    resize(nextWidth: number, nextHeight: number) {
      const nextAspect = nextWidth / Math.max(nextHeight, 1);
      const frustumW = FRUSTUM_HEIGHT * nextAspect;
      camera.left = -frustumW / 2;
      camera.right = frustumW / 2;
      camera.top = FRUSTUM_HEIGHT / 2;
      camera.bottom = -FRUSTUM_HEIGHT / 2;
      camera.updateProjectionMatrix();
    },
    dispose() {
      disposeObject3D(scene);
    },
  };
}

export type SceneGroups = Record<ServiceVisual, THREE.Group>;

export function buildAllVisualGroups(tok: TokMap): SceneGroups {
  return {
    "epc-ladder": buildVisualGroup("epc-ladder", tok),
    "tour-room": buildVisualGroup("tour-room", tok),
    "floor-plan": buildVisualGroup("floor-plan", tok),
  };
}
