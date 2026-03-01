// ─── Right Panel ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { COLORS, SCENARIO_CONFIGS } from '../utils/constants.js';
import RiskBar from './ui/RiskBar.jsx';
import { analyzeRiskWithClaude, generateReportWithClaude } from '../utils/api.js';

const panelBox = {
  background: COLORS.panel,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: '12px 16px',
  marginBottom: 10,
};

const riskColor = (v) => {
  const n = parseFloat(v);
  if (n > 70) return COLORS.red;
  if (n > 40) return COLORS.yellow;
  return COLORS.green;
};

const bigBtn = (variant = 'primary', active = false) => ({
  width: '100%', padding: '11px',
  fontFamily: "'Orbitron', monospace",
  fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
  borderRadius: 5, cursor: 'pointer', transition: 'all 0.2s',
  border: `1px solid ${variant === 'success' ? COLORS.green : COLORS.accent}`,
  color: variant === 'success' ? COLORS.green : active ? '#000' : COLORS.accent,
  background: variant === 'success' ? 'rgba(0,255,136,0.1)'
    : active ? COLORS.accent : 'rgba(0,180,255,0.06)',
});

export default function RightPanel({ stats, maneuverApplied, scenario, onManeuver }) {
  const [tab,           setTab]          = useState('dashboard');
  const [aiText,        setAiText]       = useState('');
  const [aiLoading,     setAiLoading]    = useState(false);
  const [reportText,    setReportText]   = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const handleAnalyze = async () => {
    setAiLoading(true);
    setTab('ai');
    const result = await analyzeRiskWithClaude({ ...stats, scenarioLabel: SCENARIO_CONFIGS[scenario].label });
    setAiText(result);
    setAiLoading(false);
  };

  const handleReport = async () => {
    setReportLoading(true);
    setTab('report');
    const result = await generateReportWithClaude(
      { ...stats, scenarioLabel: SCENARIO_CONFIGS[scenario].label },
      maneuverApplied
    );
    setReportText(result);
    setReportLoading(false);
  };

  const SECTOR_MULTIPLIERS = [0.75, 0.90, 1.05, 1.20, 1.35];

  return (
    <aside style={{
      width: 320, minWidth: 320,
      background: 'rgba(0,6,18,0.97)',
      borderLeft: `1px solid ${COLORS.border}`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        {[['dashboard','📊 Dashboard'], ['ai','🧠 AI Analysis'], ['report','📄 Report']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px 4px', background: 'none', border: 'none',
            borderBottom: tab === t ? `2px solid ${COLORS.accent}` : '2px solid transparent',
            color: tab === t ? COLORS.accent : COLORS.textDim,
            cursor: 'pointer', fontSize: 10, letterSpacing: '0.06em',
            fontFamily: "'Share Tech Mono', monospace",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <>
            <div style={panelBox}>
              <div style={{ fontSize: 10, color: COLORS.accent, letterSpacing: '0.2em', marginBottom: 10 }}>
                ◈ HIGH-RISK OBJECT PAIRS
              </div>
              {stats.highRiskPairs.length === 0
                ? <div style={{ fontSize: 11, color: COLORS.green }}>✓ No high-risk pairs detected</div>
                : stats.highRiskPairs.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 8px', marginBottom: 4, borderRadius: 4,
                    background: 'rgba(255,51,85,0.06)',
                    border: '1px solid rgba(255,51,85,0.2)', fontSize: 10,
                  }}>
                    <span style={{ color: COLORS.textDim }}>OBJ-{p.a} ↔ OBJ-{p.b}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: COLORS.red }}>{p.prob}% RISK</div>
                      <div style={{ color: COLORS.textDim, fontSize: 9 }}>{p.dist} km</div>
                    </div>
                  </div>
                ))
              }
            </div>

            <div style={panelBox}>
              <div style={{ fontSize: 10, color: COLORS.accent, letterSpacing: '0.2em', marginBottom: 10 }}>
                ◈ SECTOR RISK MAP
              </div>
              {['LEO Sector A', 'LEO Sector B', 'MEO Zone', 'GEO Belt', 'SSO Band'].map((s, i) => {
                const v = Math.min(99, Math.max(3, parseFloat(stats.riskIndex) * SECTOR_MULTIPLIERS[i]));
                return (
                  <div key={s} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                      <span style={{ color: COLORS.textDim }}>{s}</span>
                      <span style={{ color: riskColor(v) }}>{v.toFixed(0)}%</span>
                    </div>
                    <RiskBar value={v} />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <button style={bigBtn('primary')} onClick={handleAnalyze}>
                🧠 AI ANALYZE
              </button>
              <button
                style={bigBtn(maneuverApplied ? 'success' : 'secondary')}
                onClick={onManeuver}
              >
                {maneuverApplied ? '✓ MANEUVER APPLIED' : '🎯 OPTIMIZE ORBIT'}
              </button>
              <button style={bigBtn()} onClick={handleReport}>
                📄 GENERATE REPORT
              </button>
            </div>
          </>
        )}

        {/* ── AI TAB ── */}
        {tab === 'ai' && (
          <>
            <div style={{ ...panelBox, marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: COLORS.accent, letterSpacing: '0.2em', marginBottom: 4 }}>
                ◈ ANTIGRAVITY AI — INTELLIGENCE LAYER
              </div>
              <div style={{ fontSize: 10, color: COLORS.textDim }}>
                Real-time orbital risk analysis powered by Claude
              </div>
            </div>

            {aiLoading && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ color: COLORS.accent, fontSize: 11, letterSpacing: '0.15em', marginBottom: 14 }}>
                  ANALYZING ORBITAL DATA...
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: COLORS.accent, opacity: 0.3,
                      animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {!aiLoading && aiText && (
              <div style={{ ...panelBox, whiteSpace: 'pre-wrap', fontSize: 11, lineHeight: 1.75, color: COLORS.text }}>
                {aiText}
              </div>
            )}

            {!aiLoading && !aiText && (
              <div style={{ textAlign: 'center', padding: 40, color: COLORS.textDim, fontSize: 11 }}>
                Click "AI Analyze" to run Antigravity AI analysis
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <button style={bigBtn('primary')} onClick={handleAnalyze} disabled={aiLoading}>
                {aiLoading ? 'ANALYZING...' : '🧠 RUN ANALYSIS'}
              </button>
            </div>
          </>
        )}

        {/* ── REPORT TAB ── */}
        {tab === 'report' && (
          <>
            <div style={{ ...panelBox, marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: COLORS.accent, letterSpacing: '0.2em', marginBottom: 4 }}>
                ◈ ORBITAL RISK MANAGEMENT REPORT
              </div>
              <div style={{ fontSize: 9, color: COLORS.textDim }}>
                Generated: {new Date().toUTCString()}
              </div>
            </div>

            {reportLoading && (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ color: COLORS.accent, fontSize: 11, letterSpacing: '0.15em', marginBottom: 14 }}>
                  GENERATING REPORT...
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>
                  {[0,1,2,3,4].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: COLORS.accent, opacity: 0.3,
                      animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {!reportLoading && reportText && (
              <div style={{ ...panelBox, whiteSpace: 'pre-wrap', fontSize: 10, lineHeight: 1.8, color: COLORS.text }}>
                {reportText}
              </div>
            )}

            {!reportLoading && !reportText && (
              <div style={{ textAlign: 'center', padding: 40, color: COLORS.textDim, fontSize: 11 }}>
                Click "Generate Report" to create an AI-powered risk report
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <button style={bigBtn()} onClick={handleReport} disabled={reportLoading}>
                {reportLoading ? 'GENERATING...' : '📄 GENERATE REPORT'}
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
