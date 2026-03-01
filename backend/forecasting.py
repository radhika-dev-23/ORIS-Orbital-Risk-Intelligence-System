# ─── ORIS Future Risk Forecasting ────────────────────────────────────────────
# Monte Carlo probabilistic collision modeling

import numpy as np


def monte_carlo_forecast(current_risk: float, debris_count: int, sim_speed: float,
                          iterations: int = 500) -> dict:
    """
    Monte Carlo simulation of future risk evolution.
    Returns probability distributions for 24h and 48h risk windows.
    """
    rng = np.random.default_rng(seed=42)

    # Growth parameters based on environment
    base_growth = 1.0 + (debris_count / 1000) * 0.5
    volatility  = 0.12 * sim_speed

    h24_samples = []
    h48_samples = []

    for _ in range(iterations):
        # Random walk with upward bias when debris is dense
        noise_24 = rng.normal(0, volatility)
        noise_48 = rng.normal(0, volatility * 1.4)

        r24 = min(100, max(0, current_risk * base_growth + noise_24 * 10))
        r48 = min(100, max(0, r24 * base_growth + noise_48 * 10))
        h24_samples.append(r24)
        h48_samples.append(r48)

    h24_arr = np.array(h24_samples)
    h48_arr = np.array(h48_samples)

    # Kessler probability: chance risk exceeds 80% in 48h
    kessler_prob = float(np.mean(h48_arr > 80) * 100)

    return {
        'h24': {
            'mean':   round(float(h24_arr.mean()), 1),
            'p10':    round(float(np.percentile(h24_arr, 10)), 1),
            'p50':    round(float(np.percentile(h24_arr, 50)), 1),
            'p90':    round(float(np.percentile(h24_arr, 90)), 1),
        },
        'h48': {
            'mean':   round(float(h48_arr.mean()), 1),
            'p10':    round(float(np.percentile(h48_arr, 10)), 1),
            'p50':    round(float(np.percentile(h48_arr, 50)), 1),
            'p90':    round(float(np.percentile(h48_arr, 90)), 1),
        },
        'kessler_probability': round(kessler_prob, 1),
        'iterations': iterations,
        'growth_rate': round(base_growth, 3),
    }


def estimate_fuel_cost(maneuver_km: float, mass_kg: float, isp: float = 300) -> dict:
    """
    Estimate fuel cost for an orbital maneuver (Tsiolkovsky rocket equation).
    maneuver_km : altitude change in km
    mass_kg     : satellite dry mass
    isp         : specific impulse (seconds), ~300 for bipropellant
    """
    g0       = 9.807   # m/s²
    delta_v  = maneuver_km * 7.9   # rough estimate: ~7.9 m/s per km altitude change (LEO)
    mass_ratio = np.exp(delta_v / (isp * g0))
    fuel_kg  = mass_kg * (mass_ratio - 1)
    return {
        'delta_v_ms':  round(delta_v, 1),
        'fuel_kg':     round(fuel_kg, 2),
        'mass_ratio':  round(float(mass_ratio), 4),
        'cost_usd':    round(fuel_kg * 3000, 0),   # ~$3k/kg to orbit
    }
