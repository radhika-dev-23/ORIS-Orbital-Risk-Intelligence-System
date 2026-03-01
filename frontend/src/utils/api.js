// ─── ORIS API Layer ───────────────────────────────────────────────────────────
// All calls to the Flask backend + Anthropic AI

import { API_BASE } from './constants.js';

async function post(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function get(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Simulation endpoints ──────────────────────────────────────────────────────

/** Get current simulation state */
export const getSimulationState = () => get('/simulate');

/** Reset simulation with new scenario */
export const resetSimulation = (scenario) => post('/reset', { scenario });

/** Apply orbital maneuver to high-risk objects */
export const applyManeuver = (objects, strategy = 'altitude_raise') =>
  post('/maneuver', { objects, strategy });

/** Get 24/48h risk forecast */
export const getForecast = (currentState) => post('/forecast', currentState);

// ── AI endpoints ──────────────────────────────────────────────────────────────

/** Run AI risk analysis — returns text from Claude */
export const runAIAnalysis = (stats) => post('/analyze', stats);

/** Generate full mission report — returns text from Claude */
export const generateReport = (stats, maneuverApplied) =>
  post('/report', { stats, maneuverApplied });

// ── Direct Claude API call (used when backend is offline / demo mode) ─────────
export async function callClaudeDirect(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || '').join('') || 'Analysis unavailable.';
}

export async function analyzeRiskWithClaude(stats) {
  const prompt = `You are ORIS (Orbital Risk Intelligence System), an advanced space traffic AI.

Current simulation data:
- Total orbital objects: ${stats.totalObjects}
- Active satellites: ${stats.satellites}
- Debris pieces: ${stats.debris}
- Collision Risk Index: ${stats.riskIndex}/100
- High-risk object pairs: ${stats.highRiskPairs?.length || 0}
- Kessler Cascade Risk: ${stats.kesslerRisk}%
- Scenario: ${stats.scenarioLabel}
- 24h Projected Risk: ${stats.projected24h}%

Provide a concise, technical orbital risk analysis in 4 sections:
1. **THREAT ASSESSMENT** - Current risk level and primary concerns
2. **COLLISION VECTORS** - Key high-risk scenarios
3. **RECOMMENDED MANEUVERS** - Specific orbital adjustments with km values and % risk reduction
4. **FORECAST** - 24-48h outlook

Format as a space operations briefing. Be specific with numbers. Keep it under 250 words.`;

  return callClaudeDirect(prompt);
}

export async function generateReportWithClaude(stats, maneuverApplied) {
  const prompt = `Generate a formal orbital risk management report for ORIS platform.

Mission Parameters:
- Date: ${new Date().toUTCString()}
- Objects Tracked: ${stats.totalObjects}
- Satellites: ${stats.satellites} | Debris: ${stats.debris}
- Current Risk Index: ${stats.riskIndex}/100
- Kessler Cascade Probability: ${stats.kesslerRisk}%
- Scenario: ${stats.scenarioLabel}
- Maneuvers Applied: ${maneuverApplied ? 'Yes' : 'No'}

Write a 300-word professional report with these sections:
1. Executive Summary
2. Technical Analysis
3. Risk Quantification
4. Recommended Actions
5. Economic Impact Assessment
6. Conclusion

Use aerospace/space operations language. Include realistic-sounding metrics and recommendations.`;

  return callClaudeDirect(prompt);
}
