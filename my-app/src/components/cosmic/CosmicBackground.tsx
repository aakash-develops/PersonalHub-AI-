import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const BG = "#020108";

type RGB = [number, number, number];

// Star colors matching the backdrop palette
const STAR_COLS: RGB[] = [
  [255, 255, 255], // Pure white
  [163, 230, 255], // Icy cyan-blue
  [255, 180, 210], // Soft stellar pink
  [210, 180, 255], // Pale nebula violet
];

// Supernova explosion colors
const NOVA_COLS: RGB[] = [
  [255, 90, 95],   // Crimson flare
  [255, 190, 110], // Peach glow
  [0, 230, 240],   // Electric teal
  [230, 100, 255], // Violet pulse
];

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────
interface Star {
  x: number; y: number;
  z: number;
  sz: number; baseAlpha: number; alpha: number;
  phase: number; spd: number;
  sr: number; sg: number; sb: number;
  large: boolean;
  born: number;
}

interface Planet {
  x: number; y: number;
  rad: number;
  litR: number; litG: number; litB: number;
  atmoR: number; atmoG: number; atmoB: number;
  ringR: number; ringG: number; ringB: number;
  dx: number; dy: number;
}

interface EGalaxy {
  x: number; y: number; z: number;
  tilt: number;
  alpha: number; dx: number; dy: number;
  sprite: HTMLCanvasElement;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  pr: number; pg: number; pb: number; sz: number;
}

interface SRing {
  rad: number; maxRad: number;
  alpha: number; rr: number; gg: number; bb: number;
}

interface Nova {
  x: number; y: number;
  phase: number; t: number;
  particles: Particle[]; rings: SRing[];
  nr: number; ng: number; nb: number;
  shockRad: number;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const rnd = (lo = 0, hi = 1) => lo + Math.random() * (hi - lo);
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const clr = (r: number, g: number, b: number, a: number) =>
  `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a.toFixed(3)})`;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

// ─── BACKGROUND NEBULA GENERATOR ──────────────────────────────────────────────
function buildDust(w: number, h: number): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const ctx = cv.getContext("2d")!;

  // Left Side: Deep volcanic crimson-orange dust layers
  const leftNebs = [
    { x: w * 0.05, y: h * 0.2, rad: w * 0.55, r: 210, g: 60, b: 55, a: 0.24 },
    { x: w * 0.2,  y: h * 0.45, rad: w * 0.4, r: 160, g: 45, b: 60, a: 0.18 },
    { x: w * 0.0,  y: h * 0.75, rad: w * 0.5, r: 235, g: 95, b: 70, a: 0.16 },
  ];
  // Right Side: Shimmering cold electric teal / blue dust clouds
  const rightNebs = [
    { x: w * 0.95, y: h * 0.4, rad: w * 0.5, r: 0,   g: 140, b: 180, a: 0.2 },
    { x: w * 0.82, y: h * 0.75, rad: w * 0.45, r: 15,  g: 75,  b: 140, a: 0.18 },
    { x: w * 0.9,  y: h * 0.15, rad: w * 0.35, r: 40,  g: 170, b: 200, a: 0.14 },
  ];

  // Distant subtle grey/purple clouds scattered far away
  const distantNebs = [
    { x: w * 0.4,  y: h * 0.3, rad: w * 0.35, r: 100, g: 70,  b: 130, a: 0.08 },
    { x: w * 0.6,  y: h * 0.6, rad: w * 0.4,  r: 80,  g: 80,  b: 110, a: 0.06 },
  ];

  const allNebs = [...leftNebs, ...rightNebs, ...distantNebs];
  for (const n of allNebs) {
    const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rad);
    gr.addColorStop(0, clr(n.r, n.g, n.b, n.a));
    gr.addColorStop(0.5, clr(n.r, n.g, n.b, n.a * 0.45));
    gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(n.x, n.y, n.rad, 0, Math.PI * 2); ctx.fill();
  }

  return cv;
}

// ─── SPIRAL GALAXY GENERATOR ──────────────────────────────────────────────────
function buildSpiralGalaxy(coreCol: RGB, armCol: RGB, radius: number): HTMLCanvasElement {
  const pad = 40;
  const size = (radius + pad) * 2;
  const cv = document.createElement("canvas");
  cv.width = size; cv.height = size;
  const ctx = cv.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;

  const bgGr = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  bgGr.addColorStop(0, clr(armCol[0], armCol[1], armCol[2], 0.15));
  bgGr.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bgGr;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();

  const arms = 2;
  const particles = 250;
  for (let a = 0; a < arms; a++) {
    const baseAngle = (a * Math.PI * 2) / arms;
    for (let i = 0; i < particles; i++) {
      const t = i / particles;
      const r = t * radius;
      const angle = baseAngle + t * Math.PI * 4 + rnd(-0.2, 0.2);

      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      const pSize = rnd(0.5, 1.8) * (1 - t * 0.4);
      const alpha = (1 - t) * rnd(0.15, 0.7);

      const grad = ctx.createRadialGradient(px, py, 0, px, py, pSize * 2);
      grad.addColorStop(0, clr(armCol[0], armCol[1], armCol[2], alpha));
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(px, py, pSize * 2, 0, Math.PI * 2); ctx.fill();
    }
  }

  const bulge = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.15);
  bulge.addColorStop(0, "rgba(255,255,255,0.95)");
  bulge.addColorStop(0.3, clr(coreCol[0], coreCol[1], coreCol[2], 0.7));
  bulge.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = bulge;
  ctx.beginPath(); ctx.arc(cx, cy, radius * 0.15, 0, Math.PI * 2); ctx.fill();

  return cv;
}

// ─── EDGE-ON GALAXY GENERATOR ─────────────────────────────────────────────────
function buildEdgeGalaxy(coreCol: RGB, bandCol: RGB, halfLen: number): HTMLCanvasElement {
  const halfThick = Math.max(8, halfLen * 0.05);
  const pad = 50;
  const cw = (halfLen + pad) * 2;
  const ch = (halfThick * 8 + pad) * 2;
  const cv = document.createElement("canvas");
  cv.width = cw; cv.height = ch;
  const ctx = cv.getContext("2d")!;
  const [cx, cy] = [cw / 2, ch / 2];

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, halfThick / halfLen);
  const diskGr = ctx.createRadialGradient(0, 0, 0, 0, 0, halfLen * 0.9);
  diskGr.addColorStop(0, clr(coreCol[0], coreCol[1], coreCol[2], 0.75));
  diskGr.addColorStop(0.3, clr(bandCol[0], bandCol[1], bandCol[2], 0.4));
  diskGr.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = diskGr;
  ctx.beginPath(); ctx.arc(0, 0, halfLen * 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  return cv;
}

// ─── HIGH-QUALITY PLANET RENDERING ───────────────────────────────────────────
function drawPlanetAndRings(ctx: CanvasRenderingContext2D, p: Planet) {
  const { x, y, rad } = p;

  const backlightX = x + rad * 0.6;
  const backlightY = y - rad * 0.1;
  const coronaGr = ctx.createRadialGradient(backlightX, backlightY, rad * 0.2, x, y, rad * 2.1);
  coronaGr.addColorStop(0, clr(255, 195, 170, 0.8));
  coronaGr.addColorStop(0.2, clr(p.atmoR, p.atmoG, p.atmoB, 0.45));
  coronaGr.addColorStop(0.6, clr(p.atmoR, p.atmoG, p.atmoB, 0.12));
  coronaGr.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = coronaGr;
  ctx.beginPath(); ctx.arc(x, y, rad * 2.1, 0, Math.PI * 2); ctx.fill();

  const ringAngle = -Math.PI * 0.12;

  const drawRingSegment = (startAngle: number, endAngle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ringAngle);
    ctx.scale(1, 0.28);

    const rInner = rad * 1.5;
    const rOuter = rad * 3.4;
    const ringGr = ctx.createRadialGradient(0, 0, rInner, 0, 0, rOuter);
    ringGr.addColorStop(0, "rgba(0,0,0,0)");
    ringGr.addColorStop(0.12, clr(p.ringR, p.ringG, p.ringB, 0.55));
    ringGr.addColorStop(0.4, clr(p.ringR, p.ringG, p.ringB, 0.25));
    ringGr.addColorStop(0.75, clr(p.ringR, p.ringG, p.ringB, 0.45));
    ringGr.addColorStop(1, "rgba(0,0,0,0)");

    ctx.strokeStyle = ringGr;
    ctx.lineWidth = rOuter - rInner;
    ctx.beginPath();
    ctx.arc(0, 0, (rInner + rOuter) / 2, startAngle, endAngle);
    ctx.stroke();
    ctx.restore();
  };

  drawRingSegment(Math.PI, Math.PI * 2);

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.clip();

  const baseGr = ctx.createLinearGradient(x - rad, y + rad, x + rad, y - rad);
  baseGr.addColorStop(0, "#120d1a");
  baseGr.addColorStop(0.5, "#2a1e34");
  baseGr.addColorStop(1, "#442b4d");
  ctx.fillStyle = baseGr;
  ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);

  ctx.fillStyle = "rgba(18, 10, 24, 0.5)";
  ctx.beginPath();
  ctx.ellipse(x - rad * 0.2, y + rad * 0.3, rad * 0.5, rad * 0.25, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(x + rad * 0.1, y - rad * 0.4, rad * 0.4, rad * 0.15, 0.1, 0, Math.PI * 2);
  ctx.fill();

  const shadowGr = ctx.createRadialGradient(
    x - rad * 0.4, y + rad * 0.1, rad * 0.3,
    x - rad * 0.1, y + rad * 0.1, rad * 1.05
  );
  shadowGr.addColorStop(0, "rgba(5, 2, 8, 0.98)");
  shadowGr.addColorStop(0.65, "rgba(10, 4, 16, 0.85)");
  shadowGr.addColorStop(0.9, "rgba(255, 120, 140, 0.15)");
  shadowGr.addColorStop(1, "rgba(255, 195, 170, 0.75)");
  ctx.fillStyle = shadowGr;
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();

  ctx.restore();

  drawRingSegment(0, Math.PI);

  const rimGr = ctx.createRadialGradient(x, y, rad * 0.88, x, y, rad);
  rimGr.addColorStop(0, "rgba(0,0,0,0)");
  rimGr.addColorStop(1, clr(255, 180, 185, 0.45));
  ctx.fillStyle = rimGr;
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
}

// ─── SCENE BUILDER ────────────────────────────────────────────────────────────
function initScene(w: number, h: number) {
  const stars: Star[] = [];
  for (let i = 0; i < 1650; i++) {
    const z = Math.random() < 0.12 ? 1 : Math.random() < 0.35 ? 2 : Math.random() < 0.7 ? 3 : 4;
    const large = Math.random() < 0.05 && z <= 2;
    const [sr, sg, sb] = pick(STAR_COLS);
    const size = (large ? rnd(1.8, 3.2) : rnd(0.35, 1.35)) / z;
    const baseAlpha = (large ? rnd(0.6, 0.9) : rnd(0.18, 0.65)) / (z * 0.7);

    stars.push({
      x: rnd(0, w), y: rnd(0, h), z,
      sz: size, baseAlpha, alpha: baseAlpha,
      phase: rnd(0, Math.PI * 2), spd: rnd(0.003, 0.011),
      sr, sg, sb, large, born: 0,
    });
  }

  const galaxies: EGalaxy[] = [
    {
      x: w * 0.28, y: h * 0.45, z: 4,
      tilt: 0.22, alpha: 0.65,
      dx: -0.008, dy: 0.003,
      sprite: buildSpiralGalaxy([255, 180, 200], [210, 80, 255], rnd(130, 180)),
    },
    {
      x: w * 0.88, y: h * 0.22, z: 4,
      tilt: -0.35, alpha: 0.55,
      dx: 0.005, dy: -0.006,
      sprite: buildEdgeGalaxy([220, 240, 255], [0, 150, 210], rnd(140, 200)),
    }
  ];

  const mainPlanet: Planet = {
    x: w * 0.5, y: h * 0.48,
    rad: rnd(110, 125),
    litR: 255, litG: 160, litB: 150,
    atmoR: 255, atmoG: 100, atmoB: 120,
    ringR: 255, ringG: 120, ringB: 150,
    dx: -0.007, dy: 0.003,
  };

  const backPlanet1: Planet = {
    x: w * 0.79, y: h * 0.18,
    rad: rnd(15, 20),
    litR: 160, litG: 190, litB: 230,
    atmoR: 120, atmoG: 170, atmoB: 220,
    ringR: 0, ringG: 0, ringB: 0,
    dx: -0.003, dy: 0.002,
  };

  const backPlanet2: Planet = {
    x: w * 0.08, y: h * 0.82,
    rad: rnd(11, 15),
    litR: 180, litG: 140, litB: 220,
    atmoR: 140, atmoG: 100, atmoB: 180,
    ringR: 0, ringG: 0, ringB: 0,
    dx: -0.004, dy: 0.002,
  };

  return {
    w, h, stars, galaxies,
    planets: [mainPlanet, backPlanet1, backPlanet2],
    novas: [] as Nova[],
    nextNova: 3000 + rnd(0, 5000),
    dust: buildDust(w, h),
  };
}

// ─── REUSABLE CORE COSMO BACKGROUND COMPONENT ───────────────────────────────
interface CosmicBackgroundProps {
  theme?: string;
  children?: React.ReactNode;
}

export function CosmicBackground({ theme, children }: CosmicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene = initScene(window.innerWidth, window.innerHeight);
    let raf = 0;
    const PHASE_DT = [0.005, 0.022, 0.009, 0.004];

    function frame(ts: number) {
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      const { w, h, stars, galaxies, planets, novas, dust } = scene;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      // 1. Draw Nebula clusters
      ctx.drawImage(dust, 0, 0);

      // 2. Render drifting background galaxies
      for (const g of galaxies) {
        g.x += g.dx; g.y += g.dy;
        if (g.x < -300) g.x = w + 300; else if (g.x > w + 300) g.x = -300;
        if (g.y < -300) g.y = h + 300; else if (g.y > h + 300) g.y = -300;

        const hw = g.sprite.width / 2;
        const hh = g.sprite.height / 2;
        ctx.save();
        ctx.globalAlpha = g.alpha;
        ctx.translate(g.x, g.y);
        ctx.rotate(g.tilt);
        ctx.drawImage(g.sprite, -hw, -hh);
        ctx.restore();
      }

      // 3. Render Stars with Twinkle and Nova illumination boost
      for (const s of stars) {
        if (s.born > 0) {
          const age = ts - s.born;
          if (age >= 4500) {
            s.born = 0;
            s.alpha = s.baseAlpha;
          } else {
            s.alpha = s.baseAlpha * ease(age / 4500);
          }
        } else {
          s.phase += s.spd;
          s.alpha = Math.min(1, Math.max(0.05, s.baseAlpha + Math.sin(s.phase) * 0.16));
        }

        let boost = 1;
        for (const nova of novas) {
          if (nova.phase >= 1 && nova.shockRad > 0) {
            const dx = s.x - nova.x;
            const dy = s.y - nova.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const delta = Math.abs(dist - nova.shockRad);
            if (delta < 50) {
              boost = Math.max(boost, 1 + (1 - delta / 50) * 3.2);
            }
          }
        }

        const alpha = Math.min(1, s.alpha * boost);

        if (s.large) {
          const glowGr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.sz * 6);
          glowGr.addColorStop(0, clr(s.sr, s.sg, s.sb, alpha * 0.35));
          glowGr.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = glowGr;
          ctx.beginPath(); ctx.arc(s.x, s.y, s.sz * 6, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = clr(s.sr, s.sg, s.sb, alpha);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.sz, 0, Math.PI * 2); ctx.fill();
      }

      // 4. Render Planets with depth layered rings
      for (const p of planets) {
        p.x += p.dx; p.y += p.dy;
        if (p.x < -350) p.x = w + 350; else if (p.x > w + 350) p.x = -350;
        if (p.y < -350) p.y = h + 350; else if (p.y > h + 350) p.y = -350;

        drawPlanetAndRings(ctx, p);
      }

      // 5. Dynamic Nova Spawner
      if (ts > scene.nextNova) {
        const [nr, ng, nb] = pick(NOVA_COLS);
        novas.push({
          x: rnd(w * 0.12, w * 0.88), y: rnd(h * 0.12, h * 0.88),
          phase: 0, t: 0, particles: [], rings: [],
          nr, ng, nb, shockRad: 0,
        });
        scene.nextNova = ts + rnd(14000, 24000);
      }

      // 6. Supernova Explosions Mechanics
      scene.novas = novas.filter((nova) => {
        nova.t += PHASE_DT[Math.min(nova.phase, 3)];

        if (nova.t >= 1) {
          nova.t = 0;
          nova.phase++;

          if (nova.phase === 1) {
            for (let i = 0; i < 130; i++) {
              const ang = rnd(0, Math.PI * 2);
              const spd = rnd(0.4, 4.0);
              const life = Math.floor(rnd(110, 220));
              nova.particles.push({
                x: nova.x, y: nova.y,
                vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
                life, maxLife: life,
                pr: nova.nr, pg: nova.ng, pb: nova.nb,
                sz: rnd(0.5, 2.8),
              });
            }

            for (let i = 0; i < 35; i++) {
              const ang = rnd(0, Math.PI * 2);
              const spd = rnd(3.0, 8.5);
              const life = Math.floor(rnd(25, 75));
              nova.particles.push({
                x: nova.x, y: nova.y,
                vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
                life, maxLife: life,
                pr: 255, pg: 255, pb: 255,
                sz: rnd(0.3, 1.0),
              });
            }

            nova.rings = [
              { rad: 4, maxRad: rnd(200, 360), alpha: 0.85, rr: nova.nr, gg: nova.ng, bb: nova.nb },
              { rad: 4, maxRad: rnd(280, 500), alpha: 0.45, rr: 255, gg: 255, bb: 255 },
            ];
          }

          if (nova.phase > 3) return false;
        }

        if (nova.rings.length > 0) nova.shockRad = nova.rings[0].rad;

        const { x, y } = nova;
        let intensity = 0;
        if (nova.phase === 0) intensity = ease(nova.t);
        else if (nova.phase === 1) intensity = 1;
        else if (nova.phase === 2) intensity = 1 - nova.t * 0.6;
        else intensity = 0.4 * (1 - nova.t);

        if (intensity > 0.01) {
          const size = nova.phase === 1 ? 75 : 40 * intensity;

          const aura = ctx.createRadialGradient(x, y, 0, x, y, size * 5.5);
          aura.addColorStop(0, clr(nova.nr, nova.ng, nova.nb, intensity * 0.22));
          aura.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = aura;
          ctx.beginPath(); ctx.arc(x, y, size * 5.5, 0, Math.PI * 2); ctx.fill();

          const core = ctx.createRadialGradient(x, y, 0, x, y, size);
          core.addColorStop(0, clr(255, 255, 255, intensity));
          core.addColorStop(0.25, clr(nova.nr, nova.ng, nova.nb, intensity * 0.85));
          core.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = core;
          ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();

          if (nova.phase <= 1 && intensity > 0.15) {
            ctx.save();
            ctx.globalAlpha = intensity * 0.6;
            for (let k = 0; k < 6; k++) {
              const ang = (k * Math.PI) / 6;
              const len = size * (2.8 + Math.cos(k * 2.3) * 0.4) * intensity;
              const lineGr = ctx.createLinearGradient(
                x - Math.cos(ang) * len, y - Math.sin(ang) * len,
                x + Math.cos(ang) * len, y + Math.sin(ang) * len
              );
              lineGr.addColorStop(0, "rgba(0,0,0,0)");
              lineGr.addColorStop(0.5, "rgba(255,255,255,0.95)");
              lineGr.addColorStop(1, "rgba(0,0,0,0)");

              ctx.strokeStyle = lineGr;
              ctx.lineWidth = 1.0;
              ctx.beginPath();
              ctx.moveTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len);
              ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
              ctx.stroke();
            }
            ctx.restore();
          }
        }

        for (const ring of nova.rings) {
          ring.rad += 2.0;
          ring.alpha *= 0.985;
          if (ring.rad < ring.maxRad && ring.alpha > 0.005) {
            const ratio = ring.rad / ring.maxRad;
            ctx.save();
            ctx.globalAlpha = ring.alpha * (1 - ratio * 0.3);
            ctx.strokeStyle = `rgb(${ring.rr},${ring.gg},${ring.bb})`;
            ctx.lineWidth = Math.max(0.5, 2.5 * (1 - ratio));
            ctx.beginPath(); ctx.arc(x, y, ring.rad, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
          }
        }

        nova.particles = nova.particles.filter(p => {
          p.x += p.vx; p.y += p.vy;
          p.vx *= 0.983; p.vy *= 0.983;
          if (--p.life <= 0) return false;

          const ageRatio = p.life / p.maxLife;
          ctx.fillStyle = clr(p.pr, p.pg, p.pb, ageRatio * 0.85);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz * Math.sqrt(ageRatio), 0, Math.PI * 2);
          ctx.fill();
          return true;
        });

        return nova.phase <= 3;
      });

      const vignette = ctx.createRadialGradient(w/2, h/2, h * 0.12, w/2, h/2, Math.max(w, h) * 0.85);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(2,0,8,0.72)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(frame);
    }

    const handleResize = () => {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      cancelAnimationFrame(raf);
      scene = initScene(window.innerWidth, window.innerHeight);
      raf = requestAnimationFrame(frame);
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none overflow-hidden bg-[#020108]">
      {/* 🌌 THE UNTOUCHED LIVE ENGINE CANVAS LAYERING */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full transition-opacity duration-700 ease-in-out"
        style={{ opacity: theme === 'crystal' ? 0.08 : 1 }}
      />

      {/* 💎 THE RECONCILED PURE CRYSTAL MODE OVERLAY */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-in-out"
        style={{
          backgroundColor: '#ffffff',
          opacity: theme === 'crystal' ? 0.96 : 0
        }}
      />

      {children && (
        <div className="absolute inset-0 pointer-events-auto z-10">
          {children}
        </div>
      )}
    </div>
  );
}