"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { sp } from "@/lib/scroll-store";

const NAMES = ["StarAnise", "Cinnamon", "Cardamom", "BayLeaf", "Chilli", "Garlic", "Peppercorn"];

// deterministic pseudo-random so layout is stable between renders
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

// Whole spices drifting upward through the "craft" section, nearer ones faster.
export function Spices() {
  const { scene } = useGLTF("/models/spices.glb", "/draco/");
  const { viewport } = useThree();
  const group = useRef<THREE.Group>(null);

  const items = useMemo(() => {
    const r = rng(7);
    return NAMES.flatMap((name, n) => {
      const src = scene.getObjectByName(name);
      if (!src) return [];
      const count = name === "Peppercorn" ? 14 : 3;
      return Array.from({ length: count }, (_, c) => {
        const o = src.clone(true);
        o.position.set(0, 0, 0);
        const depth = r(); // 0 far .. 1 near
        return {
          o,
          x: (r() * 2 - 1) * 0.56,
          y: ((n * 3 + c * 7 + r() * 3) % 21) / 21 * 2 - 1,
          z: lerp(-6, 2.5, depth),
          depth,
          scale: (name === "Peppercorn" ? 1.6 : 1.9) * lerp(0.8, 1.3, r()),
          spin: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.5),
          rot: new THREE.Euler(r() * 6, r() * 6, r() * 6),
        };
      });
    });
  }, [scene]);

  useFrame((state) => {
    const cp = sp("craft");
    const g = group.current!;
    g.visible = cp > 0.001 && cp < 0.999;
    if (!g.visible) return;
    const t = state.clock.elapsedTime;
    const { width: vw, height: vh } = viewport;
    for (const it of items) {
      const travel = (cp - 0.5) * vh * lerp(2.2, 5.5, it.depth);
      it.o.position.set(it.x * vw * lerp(1.5, 0.9, it.depth), it.y * vh * 1.7 + travel, it.z);
      it.o.rotation.set(it.rot.x + t * it.spin.x, it.rot.y + t * it.spin.y, it.rot.z + t * it.spin.z);
      it.o.scale.setScalar(it.scale);
    }
  });

  return (
    <group ref={group} visible={false}>
      {items.map((it, i) => (
        <primitive key={i} object={it.o} />
      ))}
    </group>
  );
}

const lerp = THREE.MathUtils.lerp;
