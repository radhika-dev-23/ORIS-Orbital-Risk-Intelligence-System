// ─── AlertFeed UI Component ───────────────────────────────────────────────────

import { COLORS } from '../../utils/constants.js';

const levelColors = {
  critical: COLORS.red,
  warning:  COLORS.yellow,
  success:  COLORS.green,
  info:     COLORS.accent,
};

export default function AlertFeed({ alerts }) {
  return (
    <div style={{
      background: COLORS.panel,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: '12px 16px',
    }}>
      <div style={{ fontSize: 10, color: COLORS.accent, letterSpacing: '0.2em', marginBottom: 8 }}>
        ◈ ALERTS
      </div>

      {alerts.length === 0 && (
        <div style={{ fontSize: 10, color: COLORS.textDim }}>No active alerts</div>
      )}

      {alerts.map((a, i) => {
        const c = levelColors[a.level] || COLORS.accent;
        return (
          <div key={i} style={{
            fontSize: 10, marginBottom: 6,
            padding: '6px 8px', borderRadius: 4,
            background: `${c}12`,
            border: `1px solid ${c}33`,
            color: c,
            animation: i === 0 ? 'slideIn 0.3s ease-out' : undefined,
          }}>
            <div style={{ color: COLORS.textDim, fontSize: 9, marginBottom: 2 }}>{a.time}</div>
            {a.msg}
          </div>
        );
      })}
    </div>
  );
}
