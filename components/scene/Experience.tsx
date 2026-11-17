"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Text, useGLTF, useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { masalas } from "@/content/masalas";
import { scroll, sp } from "@/lib/scroll-store";
import { makeBurst } from "./SpiceBurst";
import { Spices } from "./Spices";

const ss = THREE.MathUtils.smoothstep; // (x, min, max)
const lerp = THREE.MathUtils.lerp;
const DRACO = "/draco/";

// Finale section is 320svh with a 100svh sticky child: it is pinned for progress 0.24..0.76.
const PIN_END = 0.76;

function setMat(o: THREE.Object3D | undefined, mat: THREE.Material) {
  o?.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = mat;
  });
}
function prepTex(t: THREE.Texture, srgb: boolean, repeat = false) {
  t.flipY = false; // glTF UV convention
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.needsUpdate = true;
  return t;
}

function Backdrop() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        depthTest: false,
        uniforms: { uTint: { value: new THREE.Color("#f3eee3") }, uAspect: { value: 1 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 1.0, 1.0); }`,
        fragmentShader: `
          uniform vec3 uTint; uniform float uAspect; varying vec2 vUv;
          void main(){
            vec2 p = (vUv - vec2(0.5, 0.56)) * vec2(uAspect, 1.0);
            float g = smoothstep(0.95, 0.0, length(p));
            vec3 paper = vec3(0.896, 0.855, 0.768); // #f3eee3, matches the CSS page colour
            gl_FragColor = vec4(mix(paper, mix(paper * 1.04, uTint, 0.16), g), 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  );
  const target = useMemo(() => new THREE.Color(), []);
  useFrame((s, dt) => {
    target.set(scroll.tint);
    mat.uniforms.uTint.value.lerp(target, 1 - Math.exp(-dt * 3));
    mat.uniforms.uAspect.value = s.size.width / s.size.height;
  });
  return (
    <mesh renderOrder={-10} frustumCulled={false} material={mat}>
      <planeGeometry />
    </mesh>
  );
}

function World() {
  const jarGltf = useGLTF("/models/jar.glb", DRACO);
  const boxGltf = useGLTF("/models/box.glb", DRACO);
  const labels = useTexture(masalas.map((m) => `/textures/label-${m.id}.png`));
  const foils = useTexture(masalas.map((m) => `/textures/label-${m.id}-foil.png`));
  const [spiceMap, spiceNormal] = useTexture(["/textures/spice-albedo.png", "/textures/spice-normal.png"]);
  const { viewport } = useThree();
  const title = useRef<THREE.Mesh>(null);
  const boxRef = useRef<THREE.Group>(null);
  const first = useRef(true);

  const jars = useMemo(() => {
    const glass = new THREE.MeshPhysicalMaterial({
      transmission: 1, thickness: 0.1, ior: 1.5, roughness: 0.02, metalness: 0,
      attenuationColor: "#dfe8d6", attenuationDistance: 4, envMapIntensity: 1.3, specularIntensity: 1,
    });
    prepTex(spiceMap, true, true);
    prepTex(spiceNormal, false, true);
    return masalas.map((m, i) => {
      const root = new THREE.Group();
      const inner = jarGltf.scene.clone(true);
      root.add(inner);
      setMat(inner.getObjectByName("Glass"), glass);
      setMat(
        inner.getObjectByName("Label"),
        new THREE.MeshStandardMaterial({
          map: prepTex(labels[i], true), metalnessMap: prepTex(foils[i], false), metalness: 1, roughness: 0.42, envMapIntensity: 1.4,
        }),
      );
      setMat(
        inner.getObjectByName("Spice"),
        new THREE.MeshStandardMaterial({ color: m.spiceColor, map: spiceMap, normalMap: spiceNormal, roughness: 1 }),
      );
      const lid = inner.getObjectByName("Lid")!;
      const burst = makeBurst(m.powder);
      burst.position.y = lid.position.y;
      root.add(burst);
      return { root, lid, lidY: lid.position.y, burst };
    });
  }, [jarGltf, labels, foils, spiceMap, spiceNormal]);

  // Box: slots where the jars lie on their backs, lids toward the hinge.
  const box = useMemo(() => {
    const scene = boxGltf.scene;
    const lid = scene.getObjectByName("BoxLid")!;
    const bb = new THREE.Box3().setFromObject(scene.getObjectByName("BoxBase")!);
    const c = bb.getCenter(new THREE.Vector3());
    const slots = masalas.map((_, i) => {
      const s = new THREE.Object3D();
      s.position.set(c.x + (i - 1.5) * ((bb.max.x - bb.min.x - 0.2) / 4), bb.min.y + 0.4, c.z + 0.6);
      s.rotation.x = -Math.PI / 2;
      scene.add(s);
      return s;
    });
    return { scene, lid, lidOpen: lid.rotation.x, slots, width: bb.max.x - bb.min.x };
  }, [boxGltf]);

  const tmp = useMemo(
    () => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(), e: new THREE.Euler(), s: new THREE.Vector3() }),
    [],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const vw = viewport.width, vh = viewport.height;
    const narrow = vw < vh * 0.8;
    const u = Math.min(1, vw / 4.8);
    const k = first.current ? 1 : 1 - Math.exp(-dt * 7);
    first.current = false;
    const hero = Math.max(0.5, sp("hero"));
    const heroOut = ss(hero, 0.55, 0.9);
    const fp = sp("finale");
    const { x: px, y: py } = scroll.pointer;

    // in-scene wordmark scrolls away with the hero
    if (title.current) {
      title.current.position.y = vh * 0.19 + (hero - 0.5) * 2 * vh * 1.15;
      title.current.visible = hero < 0.99;
    }

    // gift box
    const g = boxRef.current!;
    const bs = Math.min(1.05, (vw * 0.82) / box.width);
    const rise = ss(fp, 0.16, 0.34);
    const leave = Math.max(0, (fp - PIN_END) / (1 - PIN_END)) * vh;
    g.visible = fp > 0.1 && fp < 0.999;
    g.scale.setScalar(bs);
    g.position.set(0, lerp(-vh, -1.05, rise) + leave, 0);
    g.rotation.set(lerp(0.25, 0.8, rise) + py * 0.04, -0.28 + fp * 0.5 + px * 0.08, 0);
    box.lid.rotation.x = box.lidOpen + (1 - ss(fp, 0.3, 0.44)) * LID_CLOSE;
    g.updateMatrixWorld(true);

    jars.forEach((j, i) => {
      const cp = sp(`ch${i}`);
      const enter = ss(cp, 0.03, 0.17);
      const exit = ss(cp, 0.84, 0.97);
      const drop = ss(fp, 0.4 + i * 0.045, 0.56 + i * 0.045);
      const side = narrow ? 0 : i % 2 ? -1 : 1;

      // hero line-up
      const hs = 1.42 * u;
      const hx = (i - 1.5) * 1.12 * u;
      const hy = -vh * 0.5 + 0.95 + Math.sin(t * 0.7 + i * 1.3) * 0.035;
      // chapter focus
      const fs = narrow ? 1.35 * Math.min(1, vw / 2.4) : 1.95;
      const fx = side * vw * 0.24;
      const fy = (narrow ? -vh * 0.5 + 0.35 : -1.2) + Math.sin(t * 0.6) * 0.03; // narrow: lower third, under the headline

      const { a, b, q, q2, e, s } = tmp;
      a.set(hx, hy, 0);
      if (i > 0) a.lerp(b.set(hx, -vh * 0.5 - 2.2, 0), heroOut); // wait below the fold
      a.lerp(b.set(fx, fy, 0), enter);
      a.lerp(b.set(fx * 1.25, vh * 0.75 + 0.6, -2.5), exit); // leave upward, clear of the frustum at z -2.5
      let scale = lerp(lerp(hs, fs, enter), fs * 0.8, exit);

      const ry = lerp((1.5 - i) * 0.12 + px * 0.25, -(1 - enter) * 4.2 + Math.sin(cp * 7.5) * 0.38 + px * 0.3, enter) + exit * 3;
      e.set(py * 0.08 * (1 - drop), ry, -side * 0.07 * enter * (1 - exit));
      q.setFromEuler(e);

      if (drop > 0) {
        const slot = box.slots[i];
        slot.getWorldPosition(b);
        slot.getWorldQuaternion(q2);
        // hover above the slot, then settle
        b.y += (1 - drop) * 2.4;
        a.lerp(b, ss(drop, 0, 0.6));
        q.slerp(q2, ss(drop, 0.1, 0.9));
        scale = lerp(scale, bs, drop);
      }

      j.root.position.lerp(a, k);
      j.root.quaternion.slerp(q, k);
      j.root.scale.lerp(s.setScalar(scale), k);

      // lid unscrews and the spice lifts out
      const lift = ss(cp, 0.28, 0.42) - ss(cp, 0.74, 0.86);
      const ls = side || 1;
      j.lid.position.y = j.lidY + lift * 0.42;
      j.lid.position.x = lift * lift * 0.62 * ls;
      j.lid.rotation.set(0, lift * 5, -lift * 0.55 * ls);
      const b01 = THREE.MathUtils.clamp((cp - 0.33) / 0.47, 0, 1);
      const bm = j.burst.material as THREE.ShaderMaterial;
      j.burst.visible = b01 > 0 && b01 < 1;
      bm.uniforms.uB.value = b01;
      bm.uniforms.uTime.value = t;
      bm.uniforms.uSize.value = state.size.height * 0.055 * scale * state.viewport.dpr;
    });
  });

  const fontSize = viewport.width * 0.2;
  return (
    <>
      <Text
        ref={title}
        font="/fonts/CormorantGaramond.ttf"
        fontSize={fontSize}
        letterSpacing={0.04}
        position={[0, viewport.height * 0.19, -1.4]}
        anchorX="center"
        anchorY="middle"
      >
        OZAVIA
        <meshStandardMaterial color="#b48a44" metalness={1} roughness={0.36} envMapIntensity={1.2} />
      </Text>
      {jars.map((j, i) => (
        <primitive key={i} object={j.root} />
      ))}
      <group ref={boxRef} visible={false}>
        <primitive object={box.scene} />
      </group>
    </>
  );
}

// Angle (radians about X) that takes the exported open lid to closed. Tuned against box.glb.
const LID_CLOSE = 1.75;

export default function Experience() {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ fov: 30, position: [0, 0, 10], near: 0.1, far: 60 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <Backdrop />
      <Suspense fallback={null}>
        <World />
        <Spices />
      </Suspense>
      <directionalLight position={[-4, 6, 5]} intensity={2.4} color="#fff0dc" />
      <directionalLight position={[5, 2, -4]} intensity={1.2} color="#fff4e4" />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#9d978a"]} />
        {/* daylight studio: soft key upper left, strip rims for glass edges, warm bounce from the paper below */}
        <Lightformer form="rect" intensity={7} color="#ffdcae" position={[-5, 5, 4]} scale={[5, 5, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={9} color="#fff1dc" position={[6, 1, -3]} scale={[1.2, 9, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={5} color="#ffe8c4" position={[-6, 0, -2]} scale={[0.8, 9, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.2} color="#f3eee3" position={[0, -5, 2]} scale={[10, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={3} color="#ffffff" position={[0, 3, 7]} scale={2.5} target={[0, 0, 0]} />
      </Environment>
    </Canvas>
  );
}
