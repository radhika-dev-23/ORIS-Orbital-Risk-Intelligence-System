# ─── ORIS AI — Maneuver Optimizer ────────────────────────────────────────────

import os
import anthropic

client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))


def suggest_maneuver(data: dict) -> str:
    """
    Ask Claude for an optimal orbital maneuver strategy.
    """
    high_risk = data.get('highRiskPairs', [])
    risk_idx  = data.get('riskIndex', 0)
    scenario  = data.get('scenarioLabel', 'Normal Orbit')

    pairs_text = '\n'.join(
        f"  - Object {p['a']} ↔ Object {p['b']}: {p['prob']}% risk at {p['dist']} km separation"
        for p in high_risk[:5]
    ) or '  None'

    prompt = f"""You are an orbital mechanics expert at a space traffic management center.

Current orbital situation:
- Risk Index: {risk_idx}/100
- Scenario: {scenario}
- High-Risk Object Pairs:
{pairs_text}

Recommend an optimal maneuver strategy. For each recommendation include:
1. Which object(s) to maneuver
2. Maneuver type (altitude raise/lower, inclination change, phasing burn)
3. Delta-V required in m/s
4. Altitude change in km
5. Expected risk reduction %
6. Execution timeline

Keep response under 200 words. Be specific and actionable."""

    message = client.messages.create(
        model      = 'claude-opus-4-6',
        max_tokens = 600,
        messages   = [{'role': 'user', 'content': prompt}],
    )
    return message.content[0].text
