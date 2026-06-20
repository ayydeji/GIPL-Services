"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { TOKENS, EPC_COLORS, readToken } from "@/lib/floor-plan-data";
import type { ServiceVisual } from "@/lib/site-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TokMap = Record<keyof typeof TOKENS, string>;

interface Props {
  active: ServiceVisual;
  /** Fallback src when WebGL is unavailable */
  fallbackSrc: string;
  fallbackAlt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hex(token: string): number {
  return parseInt(token.replace("#", ""), 16);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ---------------------------------------------------------------------------
// Scene builders
// ---------------------------------------------------------------------------

/**
 * EPC rating ladder — 7 bands (A–G) extruded as boxes with edge outlines.
 * The highlighted band (index 1 = "B") lifts forward and carries a label.
 */
function buildEpcLadder(tok: TokMap): THREE.Group {
  const g = new THREE.Group();
  const bands = ["A", "B", "C", "D", "E", "F", "G"] as const;
  const highlighted = 1; // "B" rating

  // Widths increase A→G (staircase shape, wider = worse)
  const baseW = 0.9;
  const step = 0.22;
  const bandH = 0.28;
  const depth = 0.18;
  const gap = 0.06;
  const totalH = bands.length * (bandH + gap);

  bands.forEach((band, i) => {
    const w = baseW + i * step;
    const y = (totalH / 2) - i * (bandH + gap);
    const isHit = i === highlighted;
    const color = hex(EPC_COLORS[band]);

    // Solid fill
    const geo = new THREE.BoxGeometry(w, bandH, depth);
    const mat = new THREE.MeshLambertMaterial({
      color,
      transparent: true,
      opacity: isHit ? 0.85 : 0.35,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(-0.5 + w / 2 - baseW / 2, y, isHit ? 0.15 : 0);
    mesh.castShadow = false;
    g.add(mesh);

    // Edge outline
    const edgesGeo = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: isHit ? 1.0 : 0.6,
    });
    const edges = new THREE.LineSegments(edgesGeo, edgeMat);
    edges.position.copy(mesh.position);
    g.add(edges);

    // Band label (sprite-like thin box at the right edge of highlighted band only)
    if (isHit) {
      // Arrowhead on the right
      const arrowGeo = new THREE.ConeGeometry(0.1, 0.22, 3);
      const arrowMat = new THREE.MeshLambertMaterial({ color });
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.rotation.z = -Math.PI / 2;
      arrow.position.set(mesh.position.x + w / 2 + 0.14, y, 0.15);
      g.add(arrow);
    }
  });

  // "ENERGY" label bar at top (thin flat box outline)
  const titleGeo = new THREE.BoxGeometry(baseW + 6 * step + 0.3, 0.22, 0.04);
  const titleEdges = new THREE.EdgesGeometry(titleGeo);
  titleEdges.dispose();
  const titleMat = new THREE.LineBasicMaterial({
    color: hex(tok.espresso900),
    opacity: 0.3,
    transparent: true,
  });
  const titleLine = new THREE.LineSegments(new THREE.EdgesGeometry(titleGeo), titleMat);
  titleLine.position.set(
    -0.5 + (baseW + 6 * step) / 2 - baseW / 2,
    totalH / 2 + 0.28,
    0,
  );
  titleGeo.dispose();
  g.add(titleLine);

  return g;
}

/**
 * Virtual-tour room — wireframe room box, furniture stubs, camera marker on a
 * CatmullRomCurve3 walk-path. The camera marker is stored at g.userData.cameraMarker.
 */
function buildTourRoom(tok: TokMap): THREE.Group {
  const g = new THREE.Group();
  const wallColor = hex(tok.espresso900);
  const edgeMat = () => new THREE.LineBasicMaterial({ color: wallColor, opacity: 0.7, transparent: true });
  const pathColor = hex(tok.bronze500);

  // Room shell (3.6 × 2.4 × 2.4)
  const rW = 3.6, rH = 2.4, rD = 2.4;
  const roomGeo = new THREE.BoxGeometry(rW, rH, rD);
  const roomEdges = new THREE.EdgesGeometry(roomGeo);
  roomGeo.dispose();
  const roomLines = new THREE.LineSegments(roomEdges, edgeMat());
  roomLines.position.set(0, 0, 0);
  g.add(roomLines);

  // Floor plane (translucent)
  const floorGeo = new THREE.PlaneGeometry(rW - 0.05, rD - 0.05);
  const floorMat = new THREE.MeshBasicMaterial({
    color: hex(tok.sand100),
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -rH / 2 + 0.002;
  g.add(floor);

  // Window pane
  const winGeo = new THREE.PlaneGeometry(0.8, 0.55);
  const winMat = new THREE.MeshBasicMaterial({
    color: 0xb8d8f0,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
  });
  const win = new THREE.Mesh(winGeo, winMat);
  win.position.set(0, 0.3, -rD / 2 + 0.01);
  g.add(win);
  const winEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.82, 0.57, 0.01));
  const winEdge = new THREE.LineSegments(winEdgeGeo, new THREE.LineBasicMaterial({ color: wallColor, opacity: 0.5, transparent: true }));
  winEdge.position.copy(win.position);
  g.add(winEdge);

  // Sofa stub
  const sofaGeo = new THREE.BoxGeometry(1.2, 0.35, 0.5);
  const sofaEdges = new THREE.EdgesGeometry(sofaGeo);
  sofaGeo.dispose();
  const sofa = new THREE.LineSegments(sofaEdges, new THREE.LineBasicMaterial({ color: hex(tok.tan400), opacity: 0.6, transparent: true }));
  sofa.position.set(0, -rH / 2 + 0.18, -rD / 2 + 0.4);
  g.add(sofa);

  // Table stub
  const tableGeo = new THREE.BoxGeometry(0.7, 0.12, 0.5);
  const tableEdges = new THREE.EdgesGeometry(tableGeo);
  tableGeo.dispose();
  const table = new THREE.LineSegments(tableEdges, new THREE.LineBasicMaterial({ color: hex(tok.tan400), opacity: 0.5, transparent: true }));
  table.position.set(0, -rH / 2 + 0.38, 0.2);
  g.add(table);

  // Walk-path (CatmullRomCurve3)
  const pathPoints = [
    new THREE.Vector3(-1.1, -rH / 2 + 0.05, 0.6),
    new THREE.Vector3(-0.6, -rH / 2 + 0.05, -0.5),
    new THREE.Vector3(0.4, -rH / 2 + 0.05, -0.7),
    new THREE.Vector3(1.0, -rH / 2 + 0.05, 0.0),
    new THREE.Vector3(0.3, -rH / 2 + 0.05, 0.8),
    new THREE.Vector3(-1.1, -rH / 2 + 0.05, 0.6),
  ];
  const curve = new THREE.CatmullRomCurve3(pathPoints, true);
  const pathPts = curve.getPoints(80);
  const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPts);
  // Dashed path via LineDashedMaterial
  const pathMat = new THREE.LineDashedMaterial({
    color: pathColor,
    dashSize: 0.14,
    gapSize: 0.09,
    opacity: 0.7,
    transparent: true,
  });
  const pathLine = new THREE.Line(pathGeo, pathMat);
  pathLine.computeLineDistances();
  g.add(pathLine);

  // Camera marker (small octahedron)
  const camGeo = new THREE.OctahedronGeometry(0.13);
  const camMat = new THREE.MeshLambertMaterial({ color: pathColor });
  const camMarker = new THREE.Mesh(camGeo, camMat);
  camMarker.position.copy(pathPoints[0]);
  g.add(camMarker);

  // Store the curve on userData so the render loop can animate along it
  g.userData.cameraMarker = camMarker;
  g.userData.curve = curve;

  return g;
}

/**
 * Photography — several thin-framed PlaneGeometry "photo" planes drifting at
 * varying depths. Front plane has bronze frame, higher opacity.
 */
function buildPhotoFrames(tok: TokMap): THREE.Group {
  const g = new THREE.Group();

  interface FrameDef {
    w: number;
    h: number;
    x: number;
    y: number;
    z: number;
    rotY: number;
    front: boolean;
  }

  const frames: FrameDef[] = [
    { w: 2.0, h: 1.4, x: 0,    y: 0,     z: 0,    rotY: 0,             front: true  },
    { w: 1.1, h: 0.85, x: -1.5, y: 0.3,  z: -1.2, rotY: 0.25,          front: false },
    { w: 0.9, h: 0.7,  x: 1.4,  y: -0.2, z: -1.5, rotY: -0.2,          front: false },
    { w: 0.75, h: 0.6, x: -0.4, y: 0.7,  z: -2.2, rotY: 0.1,           front: false },
  ];

  frames.forEach(({ w, h, x, y, z, rotY, front }) => {
    const frameColor = front ? hex(tok.bronze500) : hex(tok.tan400);
    const opacity = front ? 0.92 : clamp(0.18 + (z + 2.2) * 0.12, 0.12, 0.45);

    // Photo fill (translucent warm rect)
    const fillGeo = new THREE.PlaneGeometry(w, h);
    const fillMat = new THREE.MeshBasicMaterial({
      color: front ? hex(tok.sand100) : hex(tok.sand200),
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
    });
    const fill = new THREE.Mesh(fillGeo, fillMat);
    fill.position.set(x, y, z);
    fill.rotation.y = rotY;
    g.add(fill);

    // Frame border (EdgesGeometry of a thin box)
    const border = 0.06;
    const frameGeo = new THREE.BoxGeometry(w + border, h + border, 0.04);
    const frameEdges = new THREE.EdgesGeometry(frameGeo);
    frameGeo.dispose();
    const frameMat = new THREE.LineBasicMaterial({
      color: frameColor,
      transparent: true,
      opacity: front ? 1.0 : 0.55,
    });
    const frameLines = new THREE.LineSegments(frameEdges, frameMat);
    frameLines.position.set(x, y, z);
    frameLines.rotation.y = rotY;
    g.add(frameLines);

    // Hang wire (thin line from top-centre to slightly above)
    if (front) {
      const wireGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x - 0.3, y + h / 2, z),
        new THREE.Vector3(x,       y + h / 2 + 0.4, z),
        new THREE.Vector3(x + 0.3, y + h / 2, z),
      ]);
      const wireMat = new THREE.LineBasicMaterial({
        color: hex(tok.espresso700),
        transparent: true,
        opacity: 0.4,
      });
      const wire = new THREE.Line(wireGeo, wireMat);
      g.add(wire);
    }
  });

  return g;
}

// ---------------------------------------------------------------------------
// Morph state (stored on a mutable ref, no re-renders)
// ---------------------------------------------------------------------------

interface SceneGroups {
  "epc-ladder": THREE.Group;
  "tour-room": THREE.Group;
  "photo-frames": THREE.Group;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ServiceVisual3D({ active, fallbackSrc, fallbackAlt }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // Refs that persist across renders
  const activeRef = useRef<ServiceVisual>(active);
  const groupsRef = useRef<SceneGroups | null>(null);
  const morphRef = useRef<{
    from: ServiceVisual;
    to: ServiceVisual;
    t: number;
    running: boolean;
  } | null>(null);

  // Update activeRef on every render so the RAF loop can read it.
  activeRef.current = active;

  const buildScene = useCallback((container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = container.clientHeight;

    // ---- WebGL support check ----
    const testCanvas = document.createElement("canvas");
    const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
    if (!gl) return null;

    // ---- Brand tokens ----
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
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // ---- Scene ----
    const scene = new THREE.Scene();
    scene.background = null;

    // ---- Camera ----
    const aspect = W / H;
    const frustumH = 5.0;
    const frustumW = frustumH * aspect;
    const camera = new THREE.OrthographicCamera(
      -frustumW / 2, frustumW / 2,
       frustumH / 2, -frustumH / 2,
      0.1, 100,
    );
    camera.position.set(3.5, 4.5, 6);
    camera.lookAt(0, 0, 0);

    // ---- Lights ----
    const hemi = new THREE.HemisphereLight(hex(tok.paper), hex(tok.tan300), 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xfff8f0, 1.3);
    dir.position.set(6, 10, 5);
    scene.add(dir);

    // ---- Build all three scene groups ----
    const groups: SceneGroups = {
      "epc-ladder":   buildEpcLadder(tok),
      "tour-room":    buildTourRoom(tok),
      "photo-frames": buildPhotoFrames(tok),
    };
    groupsRef.current = groups;

    // Show only active, hide others
    const visuals: ServiceVisual[] = ["epc-ladder", "tour-room", "photo-frames"];
    visuals.forEach((v) => {
      groups[v].visible = v === activeRef.current;
      scene.add(groups[v]);
    });

    // ---- Slow rotation pivot ----
    const pivot = new THREE.Group();
    scene.add(pivot);
    visuals.forEach((v) => {
      scene.remove(groups[v]);
      pivot.add(groups[v]);
    });

    // ---- Render loop ----
    let rafId = 0;
    let isVisible = true;
    let time = 0;
    let currentActive = activeRef.current;

    function loop() {
      rafId = requestAnimationFrame(loop);
      if (!isVisible) return;

      const dt = 0.016;
      time += dt;
      const reduced = prefersReducedMotion();

      // Slow auto-rotate pivot
      if (!reduced) {
        pivot.rotation.y += 0.003;
      }

      // Morph logic — fade group opacity on active change
      const wantedActive = activeRef.current;
      if (wantedActive !== currentActive) {
        if (!reduced) {
          // Start morph
          morphRef.current = { from: currentActive, to: wantedActive, t: 0, running: true };
        }
        currentActive = wantedActive;
        if (reduced) {
          // Instant swap
          visuals.forEach((v) => { groups[v].visible = v === currentActive; });
        }
      }

      if (morphRef.current?.running && !reduced) {
        const m = morphRef.current;
        m.t = clamp(m.t + dt * 2.8, 0, 1); // ~0.36 s cross-fade

        const fadeOut = 1 - m.t;
        const fadeIn  = m.t;

        // Apply fade via material opacity on all child materials
        function setGroupOpacity(grp: THREE.Group, opacity: number) {
          grp.visible = opacity > 0.01;
          grp.traverse((obj) => {
            if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Line) {
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
              mats.forEach((mat) => {
                if ("opacity" in mat) {
                  (mat as THREE.Material & { opacity: number }).opacity =
                    (mat.userData.baseOpacity ?? 1) * opacity;
                  (mat as THREE.Material & { transparent: boolean }).transparent = true;
                }
              });
            }
          });
        }

        // Cache base opacities once
        const cacheBaseOpacity = (grp: THREE.Group) => {
          grp.traverse((obj) => {
            if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Line) {
              const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
              mats.forEach((mat) => {
                if (mat.userData.baseOpacity === undefined && "opacity" in mat) {
                  mat.userData.baseOpacity = (mat as THREE.Material & { opacity: number }).opacity;
                }
              });
            }
          });
        };
        cacheBaseOpacity(groups[m.from]);
        cacheBaseOpacity(groups[m.to]);

        setGroupOpacity(groups[m.from], fadeOut);
        setGroupOpacity(groups[m.to], fadeIn);

        if (m.t >= 1) {
          morphRef.current = null;
          // Restore full opacity on all groups except active
          visuals.forEach((v) => {
            if (v !== wantedActive) {
              groups[v].visible = false;
              // Reset opacities for next time
              groups[v].traverse((obj) => {
                if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Line) {
                  const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                  mats.forEach((mat) => {
                    if (mat.userData.baseOpacity !== undefined) {
                      (mat as THREE.Material & { opacity: number }).opacity = mat.userData.baseOpacity;
                    }
                  });
                }
              });
            }
          });
          groups[wantedActive].visible = true;
        }
      }

      // Animate camera marker along walk-path (tour-room)
      const tourGroup = groups["tour-room"];
      const cam = tourGroup.userData.cameraMarker as THREE.Mesh | undefined;
      const curve = tourGroup.userData.curve as THREE.CatmullRomCurve3 | undefined;
      if (cam && curve && tourGroup.visible && !reduced) {
        const t = (time * 0.08) % 1;
        curve.getPoint(t, cam.position);
      }

      // EPC ladder — gentle lift oscillation on highlighted band
      if (groups["epc-ladder"].visible && !reduced) {
        const child = groups["epc-ladder"].children[2]; // highlighted mesh
        if (child) {
          child.position.z = 0.15 + Math.sin(time * 1.2) * 0.04;
        }
      }

      renderer.render(scene, camera);
    }
    loop();

    // ---- Resize ----
    const ro = new ResizeObserver(() => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const asp = cw / ch;
      const fh = 5.0;
      const fw = fh * asp;
      (camera as THREE.OrthographicCamera).left   = -fw / 2;
      (camera as THREE.OrthographicCamera).right  =  fw / 2;
      (camera as THREE.OrthographicCamera).top    =  fh / 2;
      (camera as THREE.OrthographicCamera).bottom = -fh / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    });
    ro.observe(container);

    // ---- Visibility gating ----
    const io = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 },
    );
    io.observe(container);

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments || obj instanceof THREE.Line) {
          obj.geometry.dispose();
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      groupsRef.current = null;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cleanup = buildScene(container);
    if (!cleanup) {
      setWebglFailed(true);
      return;
    }
    return cleanup;
  }, [buildScene]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {webglFailed && (
        <Image
          src={fallbackSrc}
          alt={fallbackAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover rounded-xl"
        />
      )}
    </div>
  );
}
