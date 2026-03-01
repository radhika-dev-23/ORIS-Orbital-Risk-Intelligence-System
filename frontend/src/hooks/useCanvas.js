// ─── useCanvas Hook ───────────────────────────────────────────────────────────
// Owns the Canvas 2D render loop. Reads objectsRef directly (no re-render on tick).

import { useEffect, useRef, useCallback } from 'react';
import { project3D, rotatePoint } from '../utils/physics.js';
import { EARTH_RADIUS, COLORS } from '../utils/constants.js';

export function useCanvas(canvasRef, objectsRef, frameRef, running, zoom, rotX, rotY, kesslerActive, simTick) {
  const animRef = useRef(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // ── Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // ── Stars (deterministic)
    for (let i = 0; i < 220; i++) {
      const sx = (i * 137.508) % W;
      const sy = (i * 97.308 + 50) % H;
      const sr = i % 3 === 0 ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,230,255,${0.2 + (i % 5) * 0.08})`;
      ctx.fill();
    }

    // ── Earth
    const ep    = project3D(0, 0, 0, W, H, zoom);
    const earthR = EARTH_RADIUS * ep.scale * zoom;

    // Outer glow
    const grdOuter = ctx.createRadialGradient(ep.px, ep.py, earthR * 0.5, ep.px, ep.py, earthR * 2.8);
    grdOuter.addColorStop(0, 'rgba(0,60,140,0)');
    grdOuter.addColorStop(0.6, 'rgba(0,100,200,0.05)');
    grdOuter.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath(); ctx.arc(ep.px, ep.py, earthR * 2.8, 0, Math.PI * 2);
    ctx.fillStyle = grdOuter; ctx.fill();

    // Globe
    const grdEarth = ctx.createRadialGradient(
      ep.px - earthR * 0.3, ep.py - earthR * 0.3, earthR * 0.1,
      ep.px, ep.py, earthR
    );
    grdEarth.addColorStop(0, '#1a6fb5');
    grdEarth.addColorStop(0.4, '#0d4a8a');
    grdEarth.addColorStop(0.7, '#083060');
    grdEarth.addColorStop(1, '#040e1a');
    ctx.beginPath(); ctx.arc(ep.px, ep.py, earthR, 0, Math.PI * 2);
    ctx.fillStyle = grdEarth; ctx.fill();

    // Atmosphere rim
    ctx.beginPath(); ctx.arc(ep.px, ep.py, earthR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,150,255,0.35)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(ep.px, ep.py, earthR + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,100,200,0.1)'; ctx.lineWidth = 8; ctx.stroke();

    // ── Orbit bands (faint ellipses)
    [160, 200, 250, 310].forEach(or => {
      const orR = or * ep.scale * zoom;
      ctx.beginPath();
      ctx.ellipse(ep.px, ep.py, orR, orR * 0.28, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,100,180,0.07)'; ctx.lineWidth = 1; ctx.stroke();
    });

    // ── Collect + sort objects by depth
    const visible = objectsRef.current.map(obj => {
      const rp = rotatePoint(obj.x, obj.y, obj.z, rotX, rotY);
      const p  = project3D(rp.x, rp.y, rp.z, W, H, zoom);
      return { obj, p, rp };
    });
    visible.sort((a, b) => a.p.depth - b.p.depth);

    // ── Trails
    visible.forEach(({ obj }) => {
      if (obj.trail.length < 2) return;
      ctx.beginPath();
      obj.trail.forEach((t, i) => {
        const tr = rotatePoint(t.x, t.y, t.z, rotX, rotY);
        const pp = project3D(tr.x, tr.y, tr.z, W, H, zoom);
        i === 0 ? ctx.moveTo(pp.px, pp.py) : ctx.lineTo(pp.px, pp.py);
      });
      ctx.strokeStyle = obj.risk > 0.6
        ? 'rgba(255,51,85,0.35)'
        : obj.type === 'satellite' ? 'rgba(0,180,255,0.18)' : 'rgba(100,150,200,0.08)';
      ctx.lineWidth = obj.type === 'satellite' ? 1.5 : 0.5;
      ctx.stroke();
    });

    // ── Objects
    visible.forEach(({ obj, p }) => {
      const s = Math.max(1.5, obj.size * p.scale * zoom);

      // Explosion
      if (obj.exploding) {
        for (let e = 0; e < 8; e++) {
          const ea = e * Math.PI / 4 + obj.explodeTimer * 0.3;
          const er = obj.explodeTimer * 14;
          ctx.beginPath();
          ctx.arc(p.px + Math.cos(ea) * er, p.py + Math.sin(ea) * er, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,${80 + e * 22},0,${1 - obj.explodeTimer / 20})`;
          ctx.fill();
        }
        return;
      }

      const color = obj.risk > 0.7 ? COLORS.red
        : obj.risk > 0.4 ? COLORS.yellow
        : obj.type === 'satellite' ? COLORS.accent : COLORS.textDim;

      // Glow
      if (obj.type === 'satellite' || obj.risk > 0.4) {
        const glowR = s * (obj.risk > 0.5 ? 7 : 4.5);
        const gc    = obj.risk > 0.7 ? '255,51,85'
          : obj.risk > 0.4 ? '255,200,0' : '0,180,255';
        const gGrd  = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, glowR);
        gGrd.addColorStop(0, `rgba(${gc},0.5)`);
        gGrd.addColorStop(1, `rgba(${gc},0)`);
        ctx.beginPath(); ctx.arc(p.px, p.py, glowR, 0, Math.PI * 2);
        ctx.fillStyle = gGrd; ctx.fill();
      }

      // Core dot
      ctx.beginPath(); ctx.arc(p.px, p.py, s, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();

      // Satellite cross
      if (obj.type === 'satellite' && s > 2) {
        ctx.strokeStyle = color; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.px - s * 2, p.py); ctx.lineTo(p.px + s * 2, p.py);
        ctx.moveTo(p.px, p.py - s * 1.2); ctx.lineTo(p.px, p.py + s * 1.2);
        ctx.stroke();
      }
    });

    // ── Kessler overlay
    if (kesslerActive) {
      const kg = ctx.createRadialGradient(W / 2, H / 2, earthR, W / 2, H / 2, earthR * 2.6);
      kg.addColorStop(0,   'rgba(255,30,60,0)');
      kg.addColorStop(0.5, 'rgba(255,30,60,0.1)');
      kg.addColorStop(1,   'rgba(255,80,0,0.04)');
      ctx.fillStyle = kg;
      ctx.fillRect(0, 0, W, H);
    }
  }, [canvasRef, objectsRef, zoom, rotX, rotY, kesslerActive]);

  // ── Animation loop
  useEffect(() => {
    function loop() {
      simTick(running);
      render();
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, render, simTick]);
}
