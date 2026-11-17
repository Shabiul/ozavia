"use client";

import * as THREE from "three";

// Ground-spice plume from the jar mouth. Pure function of uB (0..1) so scroll scrubs it both ways.
// Two kinds of particle share one draw call: grains (small, opaque, ballistic with drag + gravity)
// and dust (large, faint, slow, spreading haze). Origin = burst position (lid seat); spice surface is ~6 mm below.
const vert = /* glsl */ `
  attribute vec4 aSeed;   // x: delay, y: angle, z: speed, w: misc
  attribute vec3 aColor;
  attribute float aDust;
  uniform float uB, uTime, uSize;
  varying vec3 vColor;
  varying float vAlpha, vDust;

  // displacement after tau seconds: launch v0 against linear drag k, settling under gravity g
  vec3 fly(vec3 v0, float k, vec3 g, float tau) {
    float e = (1.0 - exp(-k * tau)) / k;
    return v0 * e + g * (tau - e) / k;
  }

  void main() {
    float d = aSeed.x * mix(0.35, 0.5, aDust);
    float t = clamp((uB - d) / (1.0 - d), 0.0, 1.0);
    float tau = t * 1.8;
    float ang = aSeed.y * 6.2832;
    float r0 = sqrt(fract(aSeed.w * 7.13)) * 0.19;          // uniform over the mouth
    vec3 p0 = vec3(cos(ang) * r0, -0.06, sin(ang) * r0);
    vec3 dir = vec3(cos(ang), 0.0, sin(ang));
    vec3 p;
    if (aDust < 0.5) {
      // long-tailed speeds and per-grain drag: a uniform spread would leave a flat, hard top edge
      float k = 1.6 + 2.2 * fract(aSeed.w * 13.7);
      vec3 v0 = vec3(0.0, 0.7 + 3.0 * aSeed.z * aSeed.z, 0.0) + dir * (0.15 + 1.5 * aSeed.w * aSeed.w);
      p = p0 + fly(v0, k, vec3(0.0, -2.6, 0.0), tau);
    } else {
      vec3 v0 = vec3(0.0, 0.7 + aSeed.z * 1.0, 0.0) + dir * (0.1 + aSeed.w * 0.7);
      p = p0 + fly(v0, 3.0, vec3(0.0, -0.15, 0.0), tau);
      // lazy curl so the haze rolls instead of expanding as a ball
      p.x += sin(p.y * 3.1 + aSeed.w * 9.0 + uTime * 0.35) * 0.12 * tau;
      p.z += cos(p.y * 2.7 + aSeed.z * 7.0 + uTime * 0.3) * 0.12 * tau;
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float grain = 0.12 + aSeed.z * aSeed.z * 0.22;           // most grains tiny, a few coarse flecks
    float dust = (1.2 + aSeed.w * 1.6) * (0.4 + tau);         // haze grows as it spreads
    gl_PointSize = uSize * mix(grain, dust, aDust) / -mv.z;
    float life = smoothstep(0.0, 0.04, t) * (1.0 - smoothstep(mix(0.72, 0.45, aDust), 1.0, t));
    vAlpha = life * mix(1.0, 0.16, aDust);
    vColor = aColor;
    vDust = aDust;
  }
`;
const frag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha, vDust;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    float a;
    vec3 col = vColor;
    if (vDust < 0.5) {
      a = 1.0 - smoothstep(0.38, 0.5, r);
      // light from upper left so each grain reads as a solid speck, not a dot
      col *= 0.78 + 0.4 * clamp(0.55 - c.x * 0.9 + c.y * 0.9 - r * 0.6, 0.0, 1.0);
    } else {
      a = exp(-r * r * 14.0);
    }
    a *= vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

const WEIGHTS = [0.5, 0.2, 0.2, 0.1]; // palette is base-first

export function makeBurst(palette: string[], grains = 14000, dust = 900) {
  const n = grains + dust;
  const seed = new Float32Array(n * 4).map(() => Math.random());
  const color = new Float32Array(n * 3);
  const kind = new Float32Array(n);
  const pal = palette.map((h) => new THREE.Color(h));
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    let r = Math.random(), k = 0;
    while (k < pal.length - 1 && r > WEIGHTS[k]) r -= WEIGHTS[k++];
    const isDust = i >= grains;
    c.copy(isDust ? pal[0] : pal[k]).multiplyScalar(0.92 + Math.random() * 0.16);
    if (isDust) c.lerp(pal[pal.length - 1], 0.35); // haze reads lighter than the grains
    color.set([c.r, c.g, c.b], i * 3);
    kind[i] = isDust ? 1 : 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
  geo.setAttribute("aDust", new THREE.BufferAttribute(kind, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    uniforms: { uB: { value: 0 }, uTime: { value: 0 }, uSize: { value: 60 } },
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}
