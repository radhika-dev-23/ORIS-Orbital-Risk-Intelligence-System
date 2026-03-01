// ─── Left Panel ───────────────────────────────────────────────────────────────

import { COLORS } from '../utils/constants.js';
import RiskBar   from './ui/RiskBar.jsx';
import MiniGraph from './ui/MiniGraph.jsx';
import AlertFeed from './ui/AlertFeed.jsx';

const panelBox = {
  background: COLORS.panel,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: '12px 16px',
  marginBottom: 10,
};

const sectionLabel = {
  fontSize: 10, color: COLORS.accent,
  letterSpacing: '0.2em', marginBottom: 10,
};

function StatRow({ label, value, unit = '', color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <span style={{ color: COLORS.textDim, fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{
        color: color || COLORS.text,
        fontSize: 15,
        fontFamily: "'Share Tech Mono', monospace",
        fontWeight: 'bold',
      }}>
        {value}{unit}
      </span>
    </div>
  );
}

const riskColor = (v) => {
  const n = parseFloat(v);
  if (n > 70) return COLORS.red;
  if (n > 40) return COLORS.yellow;
  return COLORS.green;
};

const btnStyle = (variant = 'default', active = false) => ({
  background: active
    ? (variant === 'danger' ? 'rgba(255,51,85,0.3)' : COLORS.accent)
    : variant === 'danger' ? 'rgba(255,51,85,0.1)' : 'rgba(0,180,255,0.08)',
  border: `1px solid ${variant === 'danger' ? COLORS.red : COLORS.accent}`,
  color: active && variant !== 'danger' ? '#000' : variant === 'danger' ? COLORS.red : COLORS.accent,
  padding: '7px 12px', borderRadius: 4, cursor: 'pointer',
  fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
  fontFamily: "'Share Tech Mono', monospace",
  transition: 'all 0.2s', flex: 1,
});

export default function LeftPanel({
  stats, riskHistory, alerts, running,
  simSpeed, debrisSlider, zoom, kesslerActive,
  onToggleRun, onSpeedChange, onDebrisChange, onZoomChange,
  onToggleKessler, onReset,
}) {
  return (
    <aside style={{
      width: 260, minWidth: 260,
      background: 'rgba(0,6,18,0.97)',
      borderRight: `1px solid ${COLORS.border}`,
      padding: 12,
      overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Fleet Status */}
      <div style={panelBox}>
        <div style={sectionLabel}>◈ FLEET STATUS</div>
        <StatRow label="Total Objects"    value={stats.totalObjects} color={COLORS.text} />
        <StatRow label="Active Satellites" value={stats.satellites}  color={COLORS.accent} />
        <StatRow label="Debris Pieces"    value={stats.debris}       color={COLORS.textDim} />
      </div>

      {/* Risk Indices */}
      <div style={panelBox}>
        <div style={sectionLabel}>◈ RISK INDICES</div>
        <StatRow label="Collision Risk" value={stats.riskIndex} unit="/100" color={riskColor(stats.riskIndex)} />
        <RiskBar value={stats.riskIndex} />
        <StatRow label="Cluster Count"  value={stats.clusterCount}  color={COLORS.yellow} />
        <StatRow label="24h Forecast"   value={stats.projected24h}  unit="%" color={riskColor(stats.projected24h)} />
        <StatRow label="Kessler Risk"   value={stats.kesslerRisk}   unit="%" color={riskColor(stats.kesslerRisk)} />
        <RiskBar value={stats.kesslerRisk} />
      </div>

      {/* Risk trend graph */}
      <div style={panelBox}>
        <div style={sectionLabel}>◈ RISK TREND</div>
        <MiniGraph data={riskHistory} />
        <div style={{ fontSize: 9, color: COLORS.textDim, marginTop: 4, textAlign: 'right' }}>← 60 frames</div>
      </div>

      {/* Simulation Controls */}
      <div style={panelBox}>
        <div style={sectionLabel}>◈ SIMULATION CONTROLS</div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 4 }}>
            SPEED: {simSpeed.toFixed(1)}x
          </div>
          <input type="range" min="0.1" max="5" step="0.1" value={simSpeed}
            onChange={e => onSpeedChange(parseFloat(e.target.value))}
            style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 4 }}>
            DEBRIS DENSITY: {debrisSlider}
          </div>
          <input type="range" min="20" max="500" step="10" value={debrisSlider}
            onChange={e => onDebrisChange(parseInt(e.target.value))}
            style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 4 }}>
            ZOOM: {zoom.toFixed(1)}x
          </div>
          <input type="range" min="0.4" max="2.5" step="0.1" value={zoom}
            onChange={e => onZoomChange(parseFloat(e.target.value))}
            style={{ width: '100%' }} />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button style={btnStyle('default', running)} onClick={onToggleRun}>
            {running ? '⏸ Pause' : '▶ Resume'}
          </button>
          <button style={btnStyle()} onClick={onReset}>↺ Reset</button>
          <button style={btnStyle('danger', kesslerActive)} onClick={onToggleKessler}>
            {kesslerActive ? '⚠ KESSLER ON' : '💥 Kessler'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      <AlertFeed alerts={alerts} />
    </aside>
  );
}
