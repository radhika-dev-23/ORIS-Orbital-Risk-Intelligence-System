// ─── Globe ────────────────────────────────────────────────────────────────────

import { useRef, useState } from 'react';
import { useCanvas } from '../hooks/useCanvas.js';
import { COLORS } from '../utils/constants.js';

export default function Globe({
  objectsRef, frameRef, running, simSpeed,
  zoom, kesslerActive, onZoomChange, simTick,
}) {
  const canvasRef = useRef(null);
  const dragging  = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const [rotX, setRotX] = useState(0.3);
  const [rotY, setRotY] = useState(0);

  useCanvas(canvasRef, objectsRef, frameRef, running, zoom, rotX, rotY, kesslerActive, simTick);

  const onMouseDown = (e) => {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    setRotY(r => r + dx * 0.005);
    setRotX(r => Math.max(-1.2, Math.min(1.2, r + dy * 0.005)));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { dragging.current = false; };
  const onWheel   = (e) => onZoomChange(z => Math.max(0.4, Math.min(2.5, z - e.deltaY * 0.001)));

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: COLORS.bg }}>
      <canvas
        ref={canvasRef}
        width={900} height={700}
        style={{ width: '100%', height: '100%', cursor: 'grab', display: 'block' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16,
        display: 'flex', gap: 16, fontSize: 10,
      }}>
        {[
          ['🛰', COLORS.accent,   'Satellite'],
          ['●', COLORS.textDim,   'Debris'],
          ['●', COLORS.yellow,    'Moderate Risk'],
          ['●', COLORS.red,       'High Risk'],
        ].map(([sym, c, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: c, fontSize: 13 }}>{sym}</span>
            <span style={{ color: COLORS.textDim }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Hint */}
      <div style={{ position: 'absolute', top: 14, left: 14, fontSize: 10, color: COLORS.textDim }}>
        Drag to rotate · Scroll to zoom
      </div>

      {/* Kessler warning */}
      {kesslerActive && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(255,30,60,0.2)',
          border: `1px solid ${COLORS.red}`,
          padding: '8px 16px', borderRadius: 6,
          color: COLORS.red,
          fontFamily: "'Orbitron', monospace",
          fontSize: 11, letterSpacing: '0.1em',
          animation: 'pulse 1s ease-in-out infinite',
        }}>
          ⚠ KESSLER CASCADE ACTIVE
        </div>
      )}
    </div>
  );
}
