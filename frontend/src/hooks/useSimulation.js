// ─── useSimulation Hook ───────────────────────────────────────────────────────
// Manages all simulation state: objects, physics tick, stats

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  generateObject, updatePosition, detectCollisions,
  computeRiskIndex, kesslerSpawn, forecastRisk,
} from '../utils/physics.js';
import { SCENARIO_CONFIGS } from '../utils/constants.js';

export function useSimulation(scenario, simSpeed, kesslerActive) {
  const objectsRef  = useRef([]);
  const frameRef    = useRef(0);
  const [stats, setStats]             = useState({
    totalObjects: 0, debris: 0, satellites: 0,
    riskIndex: 0, clusterCount: 0,
    projected24h: 0, projected48h: 0,
    highRiskPairs: [], kesslerRisk: 0,
  });
  const [riskHistory, setRiskHistory] = useState(Array(60).fill(0));
  const [alerts, setAlerts]           = useState([]);

  // ── Init
  const initObjects = useCallback((sc) => {
    const cfg = SCENARIO_CONFIGS[sc];
    let id = 0;
    const objs = [];
    for (let i = 0; i < cfg.satCount;    i++) objs.push(generateObject('satellite', id++));
    for (let i = 0; i < cfg.debrisCount; i++) objs.push(generateObject('debris',    id++));
    objs.forEach(o => updatePosition(o, 0));
    objectsRef.current = objs;
  }, []);

  useEffect(() => { initObjects(scenario); }, [scenario, initObjects]);

  // ── Physics tick (called from render loop)
  const tick = useCallback((running) => {
    if (!running) return;

    const cfg = SCENARIO_CONFIGS[scenario];
    const dt  = simSpeed * cfg.speed;
    const objs = objectsRef.current;

    objs.forEach(obj => {
      if (obj.exploding) {
        obj.explodeTimer++;
        if (obj.explodeTimer > 20) { obj.exploding = false; obj.explodeTimer = 0; }
        return;
      }
      obj.trail.push({ x: obj.x, y: obj.y, z: obj.z });
      if (obj.trail.length > 20) obj.trail.shift();
      updatePosition(obj, dt);
    });

    // Collision detection
    const highRiskPairs = detectCollisions(objs);
    const riskIndex     = computeRiskIndex(objs);

    // Kessler cascade
    if (kesslerActive) {
      let nextId = objs.length + Date.now();
      highRiskPairs.forEach(pair => {
        if (parseFloat(pair.prob) > 90 && Math.random() < 0.002) {
          const src = objs.find(o => o.id === pair.a);
          if (src) {
            src.exploding = true;
            const newDebris = kesslerSpawn(src, nextId, 5);
            nextId += 5;
            objs.push(...newDebris);
          }
        }
      });
    }

    frameRef.current++;

    // Update stats every 30 frames
    if (frameRef.current % 30 === 0) {
      const debris    = objs.filter(o => o.type === 'debris').length;
      const sats      = objs.filter(o => o.type === 'satellite').length;
      const forecast  = forecastRisk(riskIndex, debris, simSpeed);

      setStats({
        totalObjects:   objs.length,
        debris,
        satellites:     sats,
        riskIndex:      riskIndex.toFixed(1),
        clusterCount:   Math.floor(highRiskPairs.length / 2),
        projected24h:   forecast.h24,
        projected48h:   forecast.h48,
        highRiskPairs:  highRiskPairs.slice(0, 8),
        kesslerRisk:    kesslerActive
          ? Math.min(100, riskIndex * 2).toFixed(1)
          : forecast.kesslerProb,
        scenarioLabel:  cfg.label,
      });

      setRiskHistory(h => [...h.slice(1), parseFloat(riskIndex.toFixed(1))]);

      // Alerts
      if (riskIndex > 60 && frameRef.current % 90 === 0) {
        setAlerts(a => [{
          time:  new Date().toLocaleTimeString(),
          msg:   `Risk index at ${riskIndex.toFixed(0)}% — ${highRiskPairs.length} close approaches`,
          level: riskIndex > 80 ? 'critical' : 'warning',
        }, ...a.slice(0, 4)]);
      }
    }
  }, [scenario, simSpeed, kesslerActive]);

  const applyManeuver = useCallback(() => {
    objectsRef.current.forEach(obj => {
      if (obj.risk > 0.3) {
        obj.r     += 8 + Math.random() * 12;
        obj.omega *= 0.85 + Math.random() * 0.25;
        obj.risk   = 0;
        obj.trail  = [];
      }
    });
    setAlerts(a => [{
      time:  new Date().toLocaleTimeString(),
      msg:   'Orbital maneuvers applied — risk reduction initiated',
      level: 'success',
    }, ...a.slice(0, 4)]);
  }, []);

  const reset = useCallback(() => initObjects(scenario), [scenario, initObjects]);

  return { objectsRef, frameRef, stats, riskHistory, alerts, tick, applyManeuver, reset };
}
