// ─── RiskBar UI Component ─────────────────────────────────────────────────────

import { COLORS } from '../../utils/constants.js';

const riskColor = (v) => {
  const n = parseFloat(v);
  if (n > 70) return COLORS.red;
  if (n > 40) return COLORS.yellow;
  return COLORS.green;
};

export default function RiskBar({ value, max = 100 }) {
  const pct = Math.min(100, (parseFloat(value) / max) * 100);
  const c   = riskColor(pct);
  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)',
      borderRadius: 4, height: 6,
      overflow: 'hidden',
      margin: '3px 0 8px',
    }}>
      <div style={{
        width: `${pct}%`, height: '100%', borderRadius: 4,
        background: `linear-gradient(90deg, ${c}88, ${c})`,
        boxShadow: `0 0 8px ${c}`,
        transition: 'width 0.5s ease',
      }} />
    </div>
  );
}
