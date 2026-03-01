# ─── ORIS AI — Risk Analyzer ─────────────────────────────────────────────────

import os
import anthropic

client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))


def analyze_risk(stats: dict) -> str:
    """
    Call Claude to generate a technical orbital risk analysis.
    stats: dict with riskIndex, satellites, debris, highRiskPairs, etc.
    """
    prompt = f"""You are ORIS (Orbital Risk Intelligence System), an advanced space traffic management AI.

Current simulation telemetry:
- Total orbital objects tracked: {stats.get('totalObjects', 'N/A')}
- Active satellites: {stats.get('satellites', 'N/A')}
- Debris fragments: {stats.get('debris', 'N/A')}
- Collision Risk Index: {stats.get('riskIndex', 'N/A')}/100
- High-risk approach pairs: {len(stats.get('highRiskPairs', []))}
- Cluster count: {stats.get('clusterCount', 'N/A')}
- Kessler Cascade Risk: {stats.get('kesslerRisk', 'N/A')}%
- 24h Projected Risk: {stats.get('projected24h', 'N/A')}%
- Simulation scenario: {stats.get('scenarioLabel', 'Normal Orbit')}

Provide a concise, technical orbital risk analysis in exactly 4 sections:

**THREAT ASSESSMENT**
Current risk level and primary threat vectors.

**COLLISION VECTORS**
Key high-risk scenarios and approach geometries.

**RECOMMENDED MANEUVERS**
Specific orbital adjustments. Include exact altitude changes in km and expected risk reduction percentages.

**48H FORECAST**
Probabilistic outlook with cascade risk assessment.

Format as a space operations briefing. Use technical language. Be specific with numbers. 250 words max."""

    message = client.messages.create(
        model      = 'claude-opus-4-6',
        max_tokens = 800,
        messages   = [{'role': 'user', 'content': prompt}],
    )
    return message.content[0].text
