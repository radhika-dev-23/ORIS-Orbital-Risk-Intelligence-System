# ─── ORIS Collision Detection Engine ─────────────────────────────────────────

import numpy as np
from typing import List

SCENARIO_CONFIGS = {
    'normal':       {'sat_count': 20,  'debris_count': 80,  'speed': 1.0},
    'highdebris':   {'sat_count': 20,  'debris_count': 300, 'speed': 1.5},
    'constellation':{'sat_count': 120, 'debris_count': 100, 'speed': 1.0},
    'kessler':      {'sat_count': 20,  'debris_count': 500, 'speed': 2.0},
}

COLLISION_THRESHOLD_KM = 25   # sim units


def detect_collisions(objects, threshold: float = COLLISION_THRESHOLD_KM) -> dict:
    """
    Pairwise collision detection.
    Returns:
        risk_index    : float 0–100
        high_risk     : list of close-approach pairs
        total_risk    : float (sum of individual risks)
    """
    if not objects:
        return {'risk_index': 0, 'high_risk': [], 'total_risk': 0}

    # Build position matrix
    sample  = min(len(objects), 120)
    objs    = objects[:sample]
    pos     = np.array([[o.x, o.y, o.z] for o in objs])  # (N, 3)

    # Reset risks
    for o in objs:
        o.risk = 0.0

    high_risk   = []
    total_risk  = 0.0

    for i in range(sample):
        for j in range(i + 1, min(i + 20, sample)):
            diff = pos[i] - pos[j]
            d    = float(np.linalg.norm(diff))
            if d < threshold:
                risk = max(0.0, 1.0 - d / threshold)
                objs[i].risk = max(objs[i].risk, risk)
                objs[j].risk = max(objs[j].risk, risk)
                total_risk  += risk

                if risk > 0.6:
                    high_risk.append({
                        'a':     objs[i].id,
                        'b':     objs[j].id,
                        'prob':  round(risk * 100, 1),
                        'dist':  round(d, 1),
                        'typeA': objs[i].type,
                        'typeB': objs[j].type,
                    })

    risk_index = min(100.0, (total_risk / sample) * 100 * 3)
    return {
        'risk_index': round(risk_index, 1),
        'high_risk':  high_risk[:10],
        'total_risk': round(total_risk, 3),
    }


def compute_relative_velocity(obj_a, obj_b) -> float:
    """Compute relative velocity between two objects (sim units/frame)."""
    dvx = obj_a.vx - obj_b.vx
    dvy = obj_a.vy - obj_b.vy
    return float(np.sqrt(dvx**2 + dvy**2))
