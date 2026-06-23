import type * as THREE from "three";
import type { ServiceVisual } from "@/lib/site-config";

export type VisualSceneBundle = {
  visual: ServiceVisual;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  pivot: THREE.Group;
  group: THREE.Group;
  animate: (time: number, reduced: boolean) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};
