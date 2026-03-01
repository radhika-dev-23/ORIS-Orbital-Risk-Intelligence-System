// ─── ORIS Physics Engine ──────────────────────────────────────────────────────
// Pure orbital mechanics math — no React, no side effects

import { EARTH_RADIUS } from './constants.js';

// ── Random helpers ────────────────────────────────────────────────────────────
export const rng = (min, max) => Math.random() * (max - min) + min;
export const rngSign = () => (Math.random() > 0.5 ? 1 : -1);
export const rngInt = (min, max) => Math.floor(rng(min, max));

// ── 3D distance ───────────────────────────────────────────────────────────────
export function dist3d(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

// ── Generate a new orbital object ─────────────────────────────────────────────
export function generateObject(type, id, orbitRadius) {
  const r = orbitRadius || rng(EARTH_RADIUS + 30, EARTH_RADIUS + 220);
  return {
    id,
    type,                                   // 'satellite' | 'debris'
    r,                                      // orbital radius
    theta: rng(0, Math.PI * 2),            // angular position
    phi: rng(-0.4, 0.4),                   // elevation angle
    inclination: rng(-0.6, 0.6),           // orbital plane tilt
    omega: (rngSign() * rng(0.003, 0.012)) * (180 / r),  // angular velocity
    x: 0, y: 0, z: 0,                      // cartesian position (computed)
    vx: 0, vy: 0, vz: 0,                   // velocity vector
    mass: type === 'satellite' ? rng(500, 5000) : rng(0.1, 50),
    size: type === 'satellite' ? rng(3, 6) : rng(1, 3),
    risk: 0,                                // collision risk 0–1
    trail: [],                              // recent positions for trail rendering
    exploding: false,
    explodeTimer: 0,
  };
}

// ── Update object position for one timestep ───────────────────────────────────
export function updatePosition(obj, dt = 1) {
  obj.theta += obj.omega * dt;
  const cosPhi = Math.cos(obj.phi);
  const sinI   = Math.sin(obj.inclination);
  obj.x = obj.r * Math.cos(obj.theta) * cosPhi;
  obj.y = obj.r * Math.sin(obj.theta) * cosPhi;
  obj.z = obj.r * Math.sin(obj.phi) + obj.r * sinI * Math.sin(obj.theta) * 0.3;
  obj.vx = -obj.r * obj.omega * Math.sin(obj.theta);
  obj.vy =  obj.r * obj.omega * Math.cos(obj.theta);
  return obj;
}

// ── 3D → 2D projection (perspective) ─────────────────────────────────────────
export function project3D(x, y, z, width, height, zoom = 1) {
  const fov   = 600 * zoom;
  const scale = fov / (fov + z);
  return {
    px:    width  / 2 + x * scale,
    py:    height / 2 - y * scale,
    scale,
    depth: z,
  };
}

// ── Rotate point around X and Y axes ─────────────────────────────────────────
export function rotatePoint(x, y, z, rx, ry) {
  // Rotate around Y axis
  const x1 =  x * Math.cos(ry) + z * Math.sin(ry);
  const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
  // Rotate around X axis
  const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
  const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
  return { x: x1, y: y2, z: z2 };
}

// ── Collision detection for an array of objects ───────────────────────────────
// Returns updated objects + list of high-risk pairs
export function detectCollisions(objects, threshold = 25) {
  const highRiskPairs = [];
  const sample = Math.min(objects.length, 120);

  for (let i = 0; i < sample; i++) {
    objects[i].risk = 0;
  }

  for (let i = 0; i < sample; i++) {
    for (let j = i + 1; j < Math.min(i + 20, sample); j++) {
      const d    = dist3d(objects[i], objects[j]);
      const risk = Math.max(0, 1 - d / threshold);

      if (risk > 0) {
        objects[i].risk = Math.max(objects[i].risk, risk);
        objects[j].risk = Math.max(objects[j].risk, risk);

        if (risk > 0.6) {
          highRiskPairs.push({
            a:    objects[i].id,
            b:    objects[j].id,
            prob: (risk * 100).toFixed(1),
            dist: d.toFixed(1),
            typeA: objects[i].type,
            typeB: objects[j].type,
          });
        }
      }
    }
  }

  return highRiskPairs;
}

// ── Compute aggregate risk index 0–100 ───────────────────────────────────────
export function computeRiskIndex(objects) {
  const sample = Math.min(objects.length, 120);
  let total = 0;
  for (let i = 0; i < sample; i++) total += objects[i].risk;
  return Math.min(100, (total / sample) * 100 * 3);
}

// ── Spawn debris from a Kessler collision ────────────────────────────────────
export function kesslerSpawn(sourceObj, nextId, count = 5) {
  const newDebris = [];
  for (let k = 0; k < count; k++) {
    const d = generateObject('debris', nextId + k);
    d.r     = sourceObj.r + rng(-20, 20);
    d.theta = sourceObj.theta + rng(-0.5, 0.5);
    d.phi   = sourceObj.phi + rng(-0.3, 0.3);
    updatePosition(d, 0);
    newDebris.push(d);
  }
  return newDebris;
}

// ── Forecast: project risk 24–48h forward (simplified Monte Carlo) ───────────
export function forecastRisk(currentRisk, debrisCount, simSpeed) {
  const base      = currentRisk;
  const growthRate = debrisCount > 200 ? 1.4 : debrisCount > 100 ? 1.2 : 1.05;
  return {
    h24:         Math.min(100, base * growthRate).toFixed(1),
    h48:         Math.min(100, base * growthRate * growthRate).toFixed(1),
    kesslerProb: Math.min(100, base * (debrisCount / 100) * 0.8).toFixed(1),
  };
}
