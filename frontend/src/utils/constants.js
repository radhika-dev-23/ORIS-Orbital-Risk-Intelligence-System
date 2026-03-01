// ─── ORIS Constants ───────────────────────────────────────────────────────────

export const EARTH_RADIUS = 120;

export const COLORS = {
  bg: '#020408',
  panel: 'rgba(4,12,24,0.95)',
  border: 'rgba(0,180,255,0.15)',
  accent: '#00b4ff',
  accentGlow: 'rgba(0,180,255,0.4)',
  green: '#00ff88',
  yellow: '#ffcc00',
  red: '#ff3355',
  orange: '#ff7700',
  dim: '#1a3a5c',
  text: '#c8e8ff',
  textDim: '#4a7a9b',
};

export const SCENARIO_CONFIGS = {
  normal: {
    debrisCount: 80,
    satCount: 20,
    label: 'Normal Orbit',
    speed: 1,
    description: 'Standard orbital environment',
  },
  highdebris: {
    debrisCount: 300,
    satCount: 20,
    label: 'High Debris',
    speed: 1.5,
    description: 'Elevated debris environment',
  },
  constellation: {
    debrisCount: 100,
    satCount: 120,
    label: 'Mega-Constellation',
    speed: 1,
    description: 'Starlink-style dense satellite grid',
  },
  kessler: {
    debrisCount: 500,
    satCount: 20,
    label: 'Kessler Cascade',
    speed: 2,
    description: 'Runaway collision chain reaction',
  },
};

export const ORBIT_BANDS = [
  { name: 'LEO Sector A', minR: 130, maxR: 180, label: 'Low Earth Orbit A' },
  { name: 'LEO Sector B', minR: 180, maxR: 240, label: 'Low Earth Orbit B' },
  { name: 'MEO Zone',     minR: 240, maxR: 290, label: 'Medium Earth Orbit' },
  { name: 'GEO Belt',     minR: 290, maxR: 330, label: 'Geostationary Orbit' },
  { name: 'SSO Band',     minR: 330, maxR: 370, label: 'Sun-Synchronous Orbit' },
];

export const RISK_THRESHOLDS = {
  low:      { max: 30,  color: '#00ff88', label: 'LOW' },
  moderate: { max: 60,  color: '#ffcc00', label: 'MODERATE' },
  high:     { max: 80,  color: '#ff7700', label: 'HIGH' },
  critical: { max: 100, color: '#ff3355', label: 'CRITICAL' },
};

export const API_BASE = '/api';
