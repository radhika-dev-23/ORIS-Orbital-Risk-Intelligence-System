# ─── ORIS AI — Report Generator ──────────────────────────────────────────────

import os
from datetime import datetime
import anthropic

client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))


def generate_report(stats: dict, maneuver_applied: bool = False) -> str:
    """
    Generate a full mission report as formatted text.
    """
    prompt = f"""Generate a formal orbital risk management report for the ORIS platform.

Mission Parameters:
- Report Date:          {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
- Classification:       UNCLASSIFIED // FOR OFFICIAL USE ONLY
- Objects Tracked:      {stats.get('totalObjects', 'N/A')}
- Active Satellites:    {stats.get('satellites', 'N/A')}
- Debris Fragments:     {stats.get('debris', 'N/A')}
- Current Risk Index:   {stats.get('riskIndex', 'N/A')}/100
- Kessler Cascade Prob: {stats.get('kesslerRisk', 'N/A')}%
- 24h Forecast Risk:    {stats.get('projected24h', 'N/A')}%
- Scenario:             {stats.get('scenarioLabel', 'Normal Orbit')}
- Maneuvers Applied:    {'YES' if maneuver_applied else 'NO'}
- High-Risk Pairs:      {len(stats.get('highRiskPairs', []))}

Write a 350-word professional report with these exact sections:

EXECUTIVE SUMMARY
TECHNICAL ANALYSIS
RISK QUANTIFICATION
RECOMMENDED ACTIONS
ECONOMIC IMPACT ASSESSMENT
CONCLUSION

Use formal aerospace/space operations language. Include realistic-sounding quantitative metrics.
Reference ITU Space Debris Mitigation Guidelines where appropriate."""

    message = client.messages.create(
        model      = 'claude-opus-4-6',
        max_tokens = 1200,
        messages   = [{'role': 'user', 'content': prompt}],
    )
    return message.content[0].text
