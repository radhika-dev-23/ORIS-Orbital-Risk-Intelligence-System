# ─── ORIS Flask Backend ───────────────────────────────────────────────────────

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from simulation  import SimulationEngine
from collision   import detect_collisions
from clustering  import analyze_sectors, find_clusters
from forecasting import monte_carlo_forecast

# AI
from ai.analyzer import analyze_risk
from ai.maneuver import suggest_maneuver
from ai.report   import generate_report

load_dotenv()

app    = Flask(__name__)
CORS(app, resources={r'/api/*': {'origins': '*'}})

sim = SimulationEngine()
sim.reset('normal')


def build_full_state():
    state      = sim.get_state()
    col        = detect_collisions(sim.objects)
    sectors    = analyze_sectors(sim.objects)
    clusters   = find_clusters(sim.objects)
    debris_cnt = sum(1 for o in sim.objects if o.type == 'debris')
    forecast   = monte_carlo_forecast(col['risk_index'], debris_cnt, sim.speed)

    return {
        **state,
        'risk_index':    col['risk_index'],
        'high_risk':     col['high_risk'],
        'sectors':       sectors,
        'clusters':      clusters,
        'forecast':      forecast,
        'cluster_count': len(clusters),
    }



@app.get('/api/health')
def health():
    return jsonify({'status': 'ok', 'frame': sim.frame})


@app.get('/api/simulate')
def get_simulate():
    """Step simulation and return full state."""
    sim.step()
    return jsonify(build_full_state())


@app.post('/api/reset')
def post_reset():
    """Reset simulation with given scenario."""
    data     = request.json or {}
    scenario = data.get('scenario', 'normal')
    sim.reset(scenario)
    return jsonify({'ok': True, 'scenario': scenario})


@app.post('/api/maneuver')
def post_maneuver():
    """Apply orbital maneuver to high-risk objects."""
    data     = request.json or {}
    strategy = data.get('strategy', 'altitude_raise')
    adjusted = sim.apply_maneuver(strategy)
    col      = detect_collisions(sim.objects)
    return jsonify({
        'ok':        True,
        'adjusted':  adjusted,
        'new_risk':  col['risk_index'],
    })


@app.post('/api/forecast')
def post_forecast():
    """Run Monte Carlo forecast."""
    data       = request.json or {}
    risk       = data.get('risk_index', 0)
    debris_cnt = data.get('debris', len([o for o in sim.objects if o.type == 'debris']))
    speed      = data.get('speed', sim.speed)
    result     = monte_carlo_forecast(risk, debris_cnt, speed)
    return jsonify(result)


@app.post('/api/analyze')
def post_analyze():
    """AI risk analysis via Claude."""
    stats  = request.json or {}
    result = analyze_risk(stats)
    return jsonify({'analysis': result})


@app.post('/api/suggest')
def post_suggest():
    """AI maneuver suggestion via Claude."""
    data   = request.json or {}
    result = suggest_maneuver(data)
    return jsonify({'suggestion': result})


@app.post('/api/report')
def post_report():
    """AI mission report via Claude."""
    data              = request.json or {}
    stats             = data.get('stats', {})
    maneuver_applied  = data.get('maneuverApplied', False)
    result            = generate_report(stats, maneuver_applied)
    return jsonify({'report': result})


if __name__ == '__main__':
    port  = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    print(f'🛰  ORIS Backend running on http://localhost:{port}')
    app.run(host='0.0.0.0', port=port, debug=debug)
