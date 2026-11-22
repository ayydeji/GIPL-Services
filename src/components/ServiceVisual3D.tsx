"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import {
  buildVisualGroup,
  createOrthographicCamera,
  readBrandTokens,
} from "@/components/service-visual-gpu/buildVisualScene";
import { hex } from "@/lib/floor-plan-scene";
import type { ServiceVisual } from "@/lib/site-config";

interface Props {
  active: ServiceVisual;
  /** Fallback src when WebGL is unavailable */
  fallbackSrc: string;
  fallbackAlt: string;
  /** Build only the active visual — use when multiple canvases appear on one page. */
  singleScene?: boolean;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface SceneGroups {
  "epc-ladder": THREE.Group;
  "tour-room": THREE.Group;
  "floor-plan": THREE.Group;
}

export default function ServiceVisual3D({
  active,
  fallbackSrc,
  fallbackAlt,
  singleScene = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const activeRef = useRef<ServiceVisual>(active);
  const singleSceneRef = useRef(singleScene);
  const groupsRef = useRef<SceneGroups | null>(null);
  const morphRef = useRef<{
    from: ServiceVisual;
    to: ServiceVisual;
    t: number;
    running: boolean;
  } | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    singleSceneRef.current = singleScene;
  }, [singleScene]);

  const buildScene = useCallback((container: HTMLDivElement) => {
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W < 2 || H < 2) return null;

    const tok = readBrandTokens();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return null;
    }
    if (!renderer.getContext()) return null;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = createOrthographicCamera(W / H);

    const hemi = new THREE.HemisphereLight(hex(tok.paper), hex(tok.tan300), 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xfff8f0, 1.3);
    dir.position.set(6, 10, 5);
    scene.add(dir);

    const activeVisual = activeRef.current;
    const isSingle = singleSceneRef.current;
    const allVisuals: ServiceVisual[] = ["epc-ladder", "tour-room", "floor-plan"];

    const groups: SceneGroups = isSingle
      ? {
          "epc-ladder":
            activeVisual === "epc-ladder" ? buildVisualGroup("epc-ladder", tok) : new THREE.Group(),
          "tour-room":
            activeVisual === "tour-room" ? buildVisualGroup("tour-room", tok) : new THREE.Group(),
          "floor-plan":
            activeVisual === "floor-plan" ? buildVisualGroup("floor-plan", tok) : new THREE.Group(),
        }
      : {
          "epc-ladder": buildVisualGroup("epc-ladder", tok),
          "tour-room": buildVisualGroup("tour-room", tok),
          "floor-plan": buildVisualGroup("floor-plan", tok),
        };
    groupsRef.current = groups;

    const visuals = isSingle ? [activeVisual] : allVisuals;
    visuals.forEach((v) => {
      groups[v].visible = v === activeVisual;
      scene.add(groups[v]);
    });

    const pivot = new THREE.Group();
    scene.add(pivot);
    visuals.forEach((v) => {
      scene.remove(groups[v]);
      pivot.add(groups[v]);
    });

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

      if (!reduced) {
        pivot.rotation.y += 0.003;
      }

      if (!isSingle) {
        const wantedActive = activeRef.current;
        if (wantedActive !== currentActive) {
          if (!reduced) {
            morphRef.current = { from: currentActive, to: wantedActive, t: 0, running: true };
          }
          currentActive = wantedActive;
          if (reduced) {
            visuals.forEach((v) => {
              groups[v].visible = v === currentActive;
            });
          }
        }

        if (morphRef.current?.running && !reduced) {
          const m = morphRef.current;
          m.t = clamp(m.t + dt * 2.8, 0, 1);

          const fadeOut = 1 - m.t;
          const fadeIn = m.t;

          function setGroupOpacity(grp: THREE.Group, opacity: number) {
            grp.visible = opacity > 0.01;
            grp.traverse((obj) => {
              if (
                obj instanceof THREE.Mesh ||
                obj instanceof THREE.LineSegments ||
                obj instanceof THREE.Line
              ) {
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

          function cacheBaseOpacity(grp: THREE.Group) {
            grp.traverse((obj) => {
              if (
                obj instanceof THREE.Mesh ||
                obj instanceof THREE.LineSegments ||
                obj instanceof THREE.Line
              ) {
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach((mat) => {
                  if (mat.userData.baseOpacity === undefined && "opacity" in mat) {
                    mat.userData.baseOpacity = (mat as THREE.Material & { opacity: number }).opacity;
                  }
                });
              }
            });
          }
          cacheBaseOpacity(groups[m.from]);
          cacheBaseOpacity(groups[m.to]);

          setGroupOpacity(groups[m.from], fadeOut);
          setGroupOpacity(groups[m.to], fadeIn);

          if (m.t >= 1) {
            morphRef.current = null;
            visuals.forEach((v) => {
              if (v !== wantedActive) {
                groups[v].visible = false;
                groups[v].traverse((obj) => {
                  if (
                    obj instanceof THREE.Mesh ||
                    obj instanceof THREE.LineSegments ||
                    obj instanceof THREE.Line
                  ) {
                    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                    mats.forEach((mat) => {
                      if (mat.userData.baseOpacity !== undefined) {
                        (mat as THREE.Material & { opacity: number }).opacity =
                          mat.userData.baseOpacity;
                      }
                    });
                  }
                });
              }
            });
            groups[wantedActive].visible = true;
          }
        }
      }

      const tourGroup = groups["tour-room"];
      const cam = tourGroup.userData.cameraMarker as THREE.Mesh | undefined;
      const curve = tourGroup.userData.curve as THREE.CatmullRomCurve3 | undefined;
      if (cam && curve && tourGroup.visible && !reduced) {
        const t = (time * 0.08) % 1;
        curve.getPoint(t, cam.position);
      }

      if (groups["epc-ladder"].visible && !reduced) {
        const child = groups["epc-ladder"].children[2];
        if (child) {
          child.position.z = 0.15 + Math.sin(time * 1.2) * 0.04;
        }
      }

      renderer.render(scene, camera);
    }
    loop();

    const ro = new ResizeObserver(() => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const asp = cw / ch;
      const fh = 5.0;
      const fw = fh * asp;
      (camera as THREE.OrthographicCamera).left = -fw / 2;
      (camera as THREE.OrthographicCamera).right = fw / 2;
      (camera as THREE.OrthographicCamera).top = fh / 2;
      (camera as THREE.OrthographicCamera).bottom = -fh / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    });
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      scene.traverse((obj) => {
        if (
          obj instanceof THREE.Mesh ||
          obj instanceof THREE.LineSegments ||
          obj instanceof THREE.Line
        ) {
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

    let cleanup: (() => void) | undefined;

    const tryInit = () => {
      if (cleanup) return true;
      const result = buildScene(container);
      if (result === null && container.clientWidth >= 2 && container.clientHeight >= 2) {
        setWebglFailed(true);
        return true;
      }
      if (!result) return false;
      cleanup = result;
      return true;
    };

    if (tryInit()) {
      return () => cleanup?.();
    }

    const ro = new ResizeObserver(() => {
      if (tryInit()) ro.disconnect();
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      cleanup?.();
    };
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
