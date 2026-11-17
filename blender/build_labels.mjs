// Builds label / box artwork: SVG (text as vector paths) -> PNG.  Run: node blender/build_labels.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'public', 'textures');
const svgDir = path.join(here, 'labels');
fs.mkdirSync(out, { recursive: true });

const load = (f) => { const b = fs.readFileSync(path.join(here, 'fonts', f)); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const serif = load('CormorantGaramond.ttf');
const sans = load('Montserrat.ttf');

// Must match jar.py: label band height and radius (1 unit = 10 cm).
const LABEL_H = 0.70, LABEL_R = 0.3115;
const PH = 1024, PW = PH * (2 * Math.PI * LABEL_R) / LABEL_H;  // physical px (square pixels on the jar)
const SX = 2048 / PW;                                           // horizontal pre-squash into the 2:1 image
const CX = PW / 2;

// Text -> path data. anchor: 's' start | 'm' middle | 'e' end. tracking in em. fit: scale to this width.
function text(font, wght, str, size, x, y, { tracking = 0, anchor = 's', fit = 0 } = {}) {
  font.variation.set({ wght });
  const adv = [...str].map((c) => font.getAdvanceWidth(c, size) + tracking * size);
  const w = adv.reduce((a, b) => a + b, 0) - tracking * size;
  if (fit) return text(font, wght, str, size * fit / w, x, y, { tracking, anchor });
  let cx = anchor === 'm' ? x - w / 2 : anchor === 'e' ? x - w : x;
  const boxes = []; let d = '';
  [...str].forEach((c, i) => {
    const p = font.getPath(c, cx, y, size);
    boxes.push(p.getBoundingBox()); d += pd(p); cx += adv[i];
  });
  return { d, w, boxes, size };
}
// own serialiser: opentype.js 2.0 toPathData() emits NaN for some coordinates
const pd = (p) => p.commands.map((c) => c.type + [c.x1, c.y1, c.x2, c.y2, c.x, c.y].filter((v) => v !== undefined).map((v) => v.toFixed(2)).join(' ')).join('');
const leaf = (cx, cy, len, wid, rot, extra) => {
  const h = len / 2, w = wid / 2;
  return `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${rot.toFixed(1)})"><path d="M0 ${h} C ${w} ${h * 0.35}, ${w} ${-h * 0.45}, 0 ${-h} C ${-w} ${-h * 0.45}, ${-w} ${h * 0.35}, 0 ${h} Z"/>${extra || ''}</g>`;
};
// Wordmark with the leaf sitting in the counter of the O.
function wordmark(cx, baseline, width, FOIL, PAPER) {
  const t = text(serif, 600, 'OZAVIA', 100, cx, baseline, { tracking: 0.07, anchor: 'm', fit: width });
  const o = t.boxes[0], ox = (o.x1 + o.x2) / 2, oy = (o.y1 + o.y2) / 2, oh = o.y2 - o.y1;
  const L = oh * 0.4, sw = (oh * 0.024).toFixed(2);
  return `<path d="${t.d}" fill="${FOIL}"/><g fill="${FOIL}">` +
    leaf(ox, oy, L, L * 0.46, 32,
      `<path d="M0 ${L * 0.4} L0 ${-L * 0.28}" stroke="${PAPER}" stroke-width="${sw}" stroke-linecap="round"/>` +
      `<path d="M0 ${L * 0.45} L0 ${L / 2 + oh * 0.04}" stroke="${FOIL}" stroke-width="${sw}" stroke-linecap="round"/>`) + `</g>`;
}
const art = (id) => fs.readFileSync(path.join(svgDir, 'art', id + '.svg'), 'utf8').split('<!--art-->')[1].split('<!--/art-->')[0];
const grad = (w, h) => `<defs><linearGradient id="foil" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${w}" y2="${h}">` +
  [0, 0.25, 0.5, 0.75, 1].map((o, i) => `<stop offset="${o}" stop-color="${i % 2 ? '#c9a45c' : '#e2c88f'}"/>`).join('') + `</linearGradient></defs>`;

const LABELS = {
  garam: { paper: '#8e2a22', name: [['GARAM', 64], ['MASALA', 64]] },
  biryani: { paper: '#4d5a2c', name: [['BIRYANI', 60], ['MASALA', 60]] },
  elite: { paper: '#1f3358', name: [['ELITE', 84], ['ALL PURPOSE', 31], ['MASALA', 31]] },
  pili: { paper: '#c8601c', name: [['PILI', 64], ['MIRCH', 64]] },
};

function labelSvg(id, mask) {
  const L = LABELS[id], PAPER = mask ? '#000' : L.paper, FOIL = mask ? '#fff' : 'url(#foil)';
  const left = CX - 300;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2048" height="1024" viewBox="0 0 2048 1024">`;
  s += mask ? '' : grad(PW, PH);
  s += `<rect width="2048" height="1024" fill="${PAPER}"/><g transform="scale(${SX.toFixed(5)} 1)">`;
  s += wordmark(CX, 262, 560, FOIL, PAPER);
  s += `<path d="${text(sans, 500, 'PREMIUM SPICES', 27, CX + 6, 322, { tracking: 0.5, anchor: 'm' }).d}" fill="${FOIL}"/>`;
  s += `<path d="M${CX - 62} 372 H${CX + 62}" stroke="${FOIL}" stroke-width="2.5"/>`;
  let y = 400;
  for (const [str, size] of L.name) {
    y += size * 0.73 + (size > 40 ? 26 : 20);
    s += `<path d="${text(sans, 500, str, size, left, y, { tracking: size > 40 ? 0.16 : 0.24 }).d}" fill="${FOIL}"/>`;
  }
  s += `<path d="M${left} ${y + 34} h44" stroke="${FOIL}" stroke-width="2.5"/>`;
  s += `<path d="${text(sans, 500, '100% NATURAL', 21, left, y + 78, { tracking: 0.3 }).d}" fill="${FOIL}"/>`;
  s += `<style>.p{fill:${PAPER}}</style><g transform="translate(${(CX - 6).toFixed(1)} 606)" fill="none" stroke="${FOIL}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${art(id)}</g>`;
  return s + `</g></svg>`;
}

// Leafy branch: stem + alternating outlined leaves with midribs.
function branch(x0, y0, len, FOIL) {
  let s = `<g fill="none" stroke="${FOIL}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">`;
  const P = (t) => [x0 + 70 * Math.sin(t * 2.2) * t, y0 - len * t];
  let d = '';
  for (let i = 0; i <= 40; i++) { const [x, y] = P(i / 40); d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
  s += `<path d="${d}"/>`;
  const n = 11;
  for (let i = 0; i < n; i++) {
    const t = 0.14 + 0.86 * i / (n - 1), [x, y] = P(t), [x2, y2] = P(t + 0.01);
    const tang = Math.atan2(x2 - x, -(y2 - y)) * 180 / Math.PI;
    const last = i === n - 1, side = i % 2 ? 1 : -1, a = tang + (last ? 0 : side * 52);
    const L = last ? 150 : 190 - 80 * t, r = a * Math.PI / 180;
    s += leaf(x + Math.sin(r) * L / 2, y - Math.cos(r) * L / 2, L, L * 0.36, a, `<path d="M0 ${L / 2} L0 ${-L * 0.3}"/>`);
  }
  return s + '</g>';
}

function lidSvg(mode) { // 'color' | 'orm' (glTF occlusion/roughness/metal: G = roughness, B = metalness)
  const W = 2048, H = 1024, orm = mode === 'orm';
  const PAPER = orm ? '#ffea00' : '#3d432c', FOIL = orm ? '#ff59ff' : 'url(#foil)';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${orm ? '' : grad(W, H)}<rect width="${W}" height="${H}" fill="${PAPER}"/>`;
  s += wordmark(520, 520, 560, FOIL, PAPER);
  s += `<path d="${text(sans, 500, 'PREMIUM SPICES', 30, 526, 590, { tracking: 0.5, anchor: 'm' }).d}" fill="${FOIL}"/>`;
  s += `<path d="M930 330 V694" stroke="${FOIL}" stroke-width="3"/>`;
  s += `<path d="${text(serif, 500, 'Pure Taste.', 92, 1030, 492).d}" fill="${FOIL}"/>`;
  s += `<path d="${text(serif, 500, 'Naturally Yours.', 92, 1030, 600).d}" fill="${FOIL}"/>`;
  s += branch(1780, 860, 640, FOIL);
  return s + '</svg>';
}
function emblemSvg(mode) {
  const orm = mode === 'orm', PAPER = orm ? '#ffea00' : '#3a3f2a', FOIL = orm ? '#ff59ff' : '#d6b676';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="${PAPER}"/>` +
    `<circle cx="128" cy="128" r="92" fill="none" stroke="${FOIL}" stroke-width="7"/><g fill="${FOIL}">` +
    leaf(128, 124, 110, 54, 32,
      `<path d="M0 44 L0 -30" stroke="${PAPER}" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M0 50 L0 72" stroke="${FOIL}" stroke-width="6" stroke-linecap="round"/>`) + `</g></svg>`;
}

const jobs = [];
const emit = (name, svg) => {
  fs.writeFileSync(path.join(svgDir, name + '.svg'), svg);
  jobs.push(sharp(Buffer.from(svg)).flatten().removeAlpha().png({ compressionLevel: 9 }).toFile(path.join(out, name + '.png')));
};
for (const id of Object.keys(LABELS)) { emit(`label-${id}`, labelSvg(id, false)); emit(`label-${id}-foil`, labelSvg(id, true)); }
emit('box-lid', lidSvg('color')); emit('box-lid-orm', lidSvg('orm'));
emit('box-emblem', emblemSvg('color')); emit('box-emblem-orm', emblemSvg('orm'));
await Promise.all(jobs);
for (const f of fs.readdirSync(out).filter((f) => /^(label|box)-/.test(f))) {
  const m = await sharp(path.join(out, f)).metadata();
  console.log(f, m.width + 'x' + m.height, fs.statSync(path.join(out, f)).size);
}
