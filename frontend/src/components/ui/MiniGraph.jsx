// ─── MiniGraph UI Component ───────────────────────────────────────────────────

import { COLORS } from '../../utils/constants.js';

export default function MiniGraph({ data, width = 200, height = 52 }) {
  const max = Math.max(...data, 1);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height * 0.9}`)
    .join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {/* Fill area */}
      <polyline
        points={`0,${height} ${pts} ${width},${height}`}
        fill={`${COLORS.accent}18`}
        stroke="none"
      />
      {/* Line */}
      <polyline
        points={pts}
        fill="none"
        stroke={COLORS.accent}
        strokeWidth="1.5"
        opacity="0.85"
      />
      {/* Current value dot */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1];
        const x    = width;
        const y    = height - (last / max) * height * 0.9;
        return (
          <circle cx={x} cy={y} r="3"
            fill={COLORS.accent}
            filter="url(#glow)" />
        );
      })()}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
    </svg>
  );
}
