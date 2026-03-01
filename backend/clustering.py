# ─── ORIS Debris Clustering & Risk Zoning ────────────────────────────────────

import numpy as np
from typing import List

SECTOR_BANDS = [
    {'name': 'LEO Sector A', 'r_min': 130, 'r_max': 180},
    {'name': 'LEO Sector B', 'r_min': 180, 'r_max': 240},
    {'name': 'MEO Zone',     'r_min': 240, 'r_max': 290},
    {'name': 'GEO Belt',     'r_min': 290, 'r_max': 330},
    {'name': 'SSO Band',     'r_min': 330, 'r_max': 380},
]


def analyze_sectors(objects) -> List[dict]:
    """
    Bin objects into orbital bands and compute density / risk per sector.
    """
    results = []
    for band in SECTOR_BANDS:
        in_band = [
            o for o in objects
            if band['r_min'] <= o.r < band['r_max']
        ]
        count    = len(in_band)
        avg_risk = float(np.mean([o.risk for o in in_band])) if in_band else 0.0
        density  = count / max(1, (band['r_max'] - band['r_min']))

        # Risk level label
        if avg_risk > 0.7 or density > 3:
            level = 'critical'
        elif avg_risk > 0.4 or density > 1.5:
            level = 'moderate'
        else:
            level = 'safe'

        results.append({
            'name':     band['name'],
            'count':    count,
            'density':  round(density, 3),
            'avg_risk': round(avg_risk * 100, 1),
            'level':    level,
        })
    return results


def find_clusters(objects, cluster_radius: float = 30.0) -> List[dict]:
    """
    Simple grid-based clustering — find high-density regions.
    Returns list of cluster centroids with object counts.
    """
    if not objects:
        return []

    pos      = np.array([[o.x, o.y, o.z] for o in objects])
    assigned = [False] * len(objects)
    clusters = []

    for i in range(len(objects)):
        if assigned[i]:
            continue
        # Find all objects within cluster_radius of object i
        diffs = pos - pos[i]
        dists = np.sqrt((diffs ** 2).sum(axis=1))
        mask  = dists < cluster_radius
        members = np.where(mask)[0].tolist()

        if len(members) >= 4:  # minimum cluster size
            for m in members:
                assigned[m] = True
            centroid = pos[members].mean(axis=0)
            clusters.append({
                'cx':    round(float(centroid[0]), 1),
                'cy':    round(float(centroid[1]), 1),
                'cz':    round(float(centroid[2]), 1),
                'count': len(members),
                'risk':  round(float(np.mean([objects[m].risk for m in members])) * 100, 1),
            })

    return clusters[:8]  # top 8 clusters
