// ─── Header ───────────────────────────────────────────────────────────────────

import { COLORS, SCENARIO_CONFIGS } from '../utils/constants.js';

const btnStyle = (active) => ({
  background: active ? COLORS.accent : 'transparent',
  border: `1px solid ${COLORS.accent}`,
  color: active ? '#000' : COLORS.accent,
  padding: '6px 12px', borderRadius: 4, cursor: 'pointer',
  fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
  fontFamily: "'Share Tech Mono', monospace",
  transition: 'all 0.2s',
});

export default function Header({ scenario, onScenarioChange, running }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 20px',
      borderBottom: `1px solid ${COLORS.border}`,
      background: 'rgba(0,8,20,0.95)',
      backdropFilter: 'blur(10px)',
      position: 'relative', zIndex: 10,
      flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative', width: 36, height: 36 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: `2px solid ${COLORS.accent}`,
            background: 'rgba(0,60,120,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🛰</div>
          <div style={{
            position: 'absolute', top: -2, left: -2, width: 40, height: 40,
            borderRadius: '50%',
            border: `1px solid ${COLORS.accent}`,
            borderTopColor: 'transparent',
            animation: 'spin 4s linear infinite',
            opacity: 0.4,
          }} />
        </div>
        <div>
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 18, fontWeight: 900,
            letterSpacing: '0.15em', color: COLORS.accent,
          }}>ORIS</div>
          <div style={{ fontSize: 9, color: COLORS.textDim, letterSpacing: '0.2em' }}>
            ORBITAL RISK INTELLIGENCE SYSTEM
          </div>
        </div>
      </div>

      {/* Scenario buttons */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        {Object.entries(SCENARIO_CONFIGS).map(([k, v]) => (
          <button key={k} style={btnStyle(scenario === k)} onClick={() => onScenarioChange(k)}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{
          padding: '4px 12px', borderRadius: 4,
          background: running ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,85,0.1)',
          border: `1px solid ${running ? COLORS.green : COLORS.red}`,
          color: running ? COLORS.green : COLORS.red,
          fontSize: 11, letterSpacing: '0.1em',
        }}>
          ● {running ? 'LIVE' : 'PAUSED'}
        </div>
        <div style={{ fontSize: 10, color: COLORS.textDim }}>
          {new Date().toUTCString().slice(0, 25)} UTC
        </div>
      </div>
    </header>
  );
}
