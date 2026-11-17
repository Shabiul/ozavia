"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Spice cloud that is a pure function of uB (0..1), so scroll can scrub it both ways.
const vert = /* glsl */ `
  attribute vec4 aSeed;
  uniform float uB, uTime, uSize;
  varying float vAlpha, vShade;
  void main() {
    float d = aSeed.x * 0.45;
    float t = clamp((uB - d) / (1.0 - d), 0.0, 1.0);
    float e = 1.0 - pow(1.0 - t, 3.0);
    float ang = aSeed.y * 6.2832 + e * (2.5 + aSeed.z * 3.5) + uTime * 0.12 * (0.5 + aSeed.w);
    float rad = 0.06 + e * (0.22 + aSeed.w * 1.25);
    float h = e * (0.45 + aSeed.z * 2.3) - t * t * 0.55 * aSeed.w + sin(uTime * 0.6 + aSeed.y * 40.0) * 0.03;
    vec3 p = vec3(cos(ang) * rad, h, sin(ang) * rad);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.35 + aSeed.x * aSeed.x * 1.6) / -mv.z;
    vAlpha = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.7, 1.0, t));
    vShade = 0.55 + aSeed.z * 0.75;
  }
`;
const frag = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha, vShade;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.18, length(c)) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor * vShade, a);
  }
`;

export function makeBurst(color: string, count = 1400) {
  const geo = new THREE.BufferGeometry();
  const seed = new Float32Array(count * 4).map(() => Math.random());
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    uniforms: { uB: { value: 0 }, uTime: { value: 0 }, uSize: { value: 60 }, uColor: { value: new THREE.Color(color) } },
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return points;
}

export function useBursts(colors: string[]) {
  return useMemo(() => colors.map((c) => makeBurst(c)), [colors]);
}
