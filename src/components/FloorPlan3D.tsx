"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  TOKENS,
  readToken,
  roomEpcData,
  EPC_COLORS,
  rooms,
} from "@/lib/floor-plan-data";
import {
  buildFloorPlanScene,
  hex,
  type TokMap,
} from "@/lib/floor-plan-scene";
import { EpcPanel } from "@/components/EpcPanel";

const PANEL_W = 200;
const PANEL_H = 90;
const PAD = 14;

interface HoverState {
  roomId: string;
  dotX: number;
  dotY: number;
  panelX: number;
  panelY: number;
  accentColor: string;
}

const MOBILE_MQ = "(max-width: 767px)";
/** >1 zooms the orthographic camera out, making the model appear smaller. */
const MOBILE_FRUSTUM_SCALE = 1.22;

function mobileFrustumScale(): number {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches
    ? MOBILE_FRUSTUM_SCALE
    : 1;
}

type FloorPlan3DProps = {
  /** When true, the camera angle is fixed and only auto-rotation runs. */
  staticCamera?: boolean;
};

export default function FloorPlan3D({ staticCamera = false }: FloorPlan3DProps) {
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [hoverState, setHoverState] = useState<HoverState | null>(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const syncMenuOpen = () => {
      setMobileMenuOpen(document.body.classList.contains("mobile-menu-open"));
    };

    syncMenuOpen();
    const observer = new MutationObserver(syncMenuOpen);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const buildScene = useCallback((container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W < 2 || H < 2) return undefined;

    const isMobileViewport = window.matchMedia(MOBILE_MQ).matches;

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

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;

    const planW = 9.0;
    const planD = 8.0 + 1.6;
    const aspect = W / H;
    const frustumH = planD * 1.5 * mobileFrustumScale();
    const frustumW = frustumH * aspect;
    const camera = new THREE.OrthographicCamera(
      -frustumW / 2, frustumW / 2,
       frustumH / 2, -frustumH / 2,
      0.1, 100,
    );

    const cx = planW / 2;
    const cz = planD / 2 - 1.6;
    const camDist = 18;
    const tiltRad = THREE.MathUtils.degToRad(58);
    const hAngle = Math.PI * 0.18;
    camera.position.set(
      cx + Math.sin(hAngle) * Math.cos(tiltRad) * camDist,
      Math.sin(tiltRad) * camDist,
      cz + Math.cos(hAngle) * Math.cos(tiltRad) * camDist,
    );
    camera.lookAt(cx, 0, cz);

    const wallH = 2.7;
    const bldgCorners = [
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(planW, 0, 0),
      new THREE.Vector3(planW, 0, planD), new THREE.Vector3(0, 0, planD),
      new THREE.Vector3(0, wallH, 0), new THREE.Vector3(planW, wallH, 0),
      new THREE.Vector3(planW, wallH, planD), new THREE.Vector3(0, wallH, planD),
    ];

    function modelScreenBbox(cw: number, ch: number) {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const c of bldgCorners) {
        const p = c.clone().project(camera);
        const sx = ((p.x + 1) / 2) * cw;
        const sy = ((-p.y + 1) / 2) * ch;
        if (sx < x0) x0 = sx;
        if (sx > x1) x1 = sx;
        if (sy < y0) y0 = sy;
        if (sy > y1) y1 = sy;
      }
      return { x0, x1, y0, y1 };
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = !staticCamera;
    controls.minZoom = 0.6;
    controls.maxZoom = 2.5;
    controls.maxPolarAngle = THREE.MathUtils.degToRad(75);
    controls.minPolarAngle = THREE.MathUtils.degToRad(10);
    controls.target.set(cx, 0, cz);
    controls.update();

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

    const catcherGeo = new THREE.PlaneGeometry(planW + 4, planD + 4);
    const catcherMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const catcher = new THREE.Mesh(catcherGeo, catcherMat);
    catcher.rotation.x = -Math.PI / 2;
    catcher.position.set(cx, -0.001, cz);
    catcher.receiveShadow = true;
    scene.add(catcher);

    const { group: planGroup, floorMeshes } = buildFloorPlanScene(tok);
    scene.add(planGroup);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoverId: string | null = null;
    const originalColors = new Map<THREE.Mesh, number>();

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

      const GAP = 52;
      const bb = modelScreenBbox(cw, ch);
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

    const initialDelay = setTimeout(() => {
      showAutoLabel(autoRoomIds[0]);
    }, 600);

    const cycleInterval = setInterval(() => {
      if (isManualHover) return;
      autoIndex = (autoIndex + 1) % autoRoomIds.length;
      showAutoLabel(autoRoomIds[autoIndex]);
    }, 2500);

    const positionInterval = isMobileViewport
      ? undefined
      : setInterval(() => {
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

    controls.autoRotate = true;
    controls.autoRotateSpeed = -0.6;

    let rafId = 0;
    let isVisible = true;

    function loop() {
      rafId = requestAnimationFrame(loop);
      if (!isVisible) return;
      controls.update();
      renderer.render(scene, camera);
    }
    loop();

    let lastCw = W;
    let lastCh = H;
    let resizeRaf = 0;

    function applySize(cw: number, ch: number) {
      const asp = cw / ch;
      const fh = planD * 1.5 * mobileFrustumScale();
      const fw = fh * asp;
      (camera as THREE.OrthographicCamera).left = -fw / 2;
      (camera as THREE.OrthographicCamera).right = fw / 2;
      (camera as THREE.OrthographicCamera).top = fh / 2;
      (camera as THREE.OrthographicCamera).bottom = -fh / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
      lastCw = cw;
      lastCh = ch;
    }

    function onResize() {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        if (cw < 2 || ch < 2) return;

        const mobile = window.matchMedia(MOBILE_MQ).matches;
        if (
          mobile &&
          Math.abs(cw - lastCw) < 2 &&
          Math.abs(ch - lastCh) < 56
        ) {
          return;
        }

        applySize(cw, ch);
      });
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 },
    );
    io.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(resizeRaf);
      clearTimeout(initialDelay);
      clearInterval(cycleInterval);
      if (positionInterval) clearInterval(positionInterval);
      ro.disconnect();
      io.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);

      controls.dispose();
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
  }, [staticCamera, isMobile]);

  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return;

    let cleanup: (() => void) | undefined;
    let disposed = false;

    const mount = () => {
      if (disposed || cleanup) return;
      const next = buildScene(container);
      if (next) cleanup = next;
    };

    mount();
    const ro = new ResizeObserver(mount);
    ro.observe(container);

    return () => {
      disposed = true;
      ro.disconnect();
      cleanup?.();
    };
  }, [buildScene]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative min-h-0 flex-1" ref={canvasWrapRef}>
        {hoverState && !isMobile && (
          <svg
            className="pointer-events-none absolute inset-0 z-[15] h-full w-full"
            aria-hidden="true"
          >
            {!isMobile && (() => {
              const { dotX, dotY, panelX, panelY, accentColor } = hoverState;
              const lineX = panelX > dotX ? panelX : panelX + PANEL_W;
              const lineY = panelY + PANEL_H / 2;
              return (
                <line
                  x1={dotX}
                  y1={dotY}
                  x2={lineX}
                  y2={lineY}
                  stroke={accentColor}
                  strokeWidth="1"
                  strokeDasharray="5 4"
                  opacity="0.6"
                />
              );
            })()}
            <circle
              cx={hoverState.dotX}
              cy={hoverState.dotY}
              r="3.5"
              fill={hoverState.accentColor}
              opacity="0.9"
            />
          </svg>
        )}

        {!isMobile && hoverState && (
          <div
            className="pointer-events-none absolute z-20"
            style={{
              left: hoverState.panelX,
              top: hoverState.panelY,
              width: PANEL_W,
            }}
          >
            <EpcPanel roomId={hoverState.roomId} />
          </div>
        )}

        {isMobile && hoverState && !mobileMenuOpen && (
          <div className="hero-epc-panel pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-3">
            <EpcPanel roomId={hoverState.roomId} />
          </div>
        )}
      </div>
    </div>
  );
}
