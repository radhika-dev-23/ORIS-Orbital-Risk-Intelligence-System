// ─── ORIS App Root ────────────────────────────────────────────────────────────

import { useState } from 'react';
import Header      from './Header.jsx';
import LeftPanel   from './LeftPanel.jsx';
import Globe       from './Globe.jsx';
import RightPanel  from './RightPanel.jsx';
import { useSimulation } from '../hooks/useSimulation.js';

export default function App() {
  // ── Simulation controls
  const [scenario,      setScenario]      = useState('normal');
  const [simSpeed,      setSimSpeed]      = useState(1);
  const [debrisSlider,  setDebrisSlider]  = useState(80);
  const [running,       setRunning]       = useState(true);
  const [zoom,          setZoom]          = useState(1);
  const [kesslerActive, setKesslerActive] = useState(false);
  const [maneuverApplied, setManeuverApplied] = useState(false);

  // ── Simulation engine
  const sim = useSimulation(scenario, simSpeed, kesslerActive);

  const handleScenarioChange = (sc) => {
    setScenario(sc);
    setKesslerActive(sc === 'kessler');
    setManeuverApplied(false);
  };

  const handleManeuver = () => {
    sim.applyManeuver();
    setManeuverApplied(true);
  };

  const handleReset = () => {
    sim.reset();
    setManeuverApplied(false);
    setKesslerActive(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        scenario={scenario}
        onScenarioChange={handleScenarioChange}
        running={running}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftPanel
          stats={sim.stats}
          riskHistory={sim.riskHistory}
          alerts={sim.alerts}
          running={running}
          simSpeed={simSpeed}
          debrisSlider={debrisSlider}
          zoom={zoom}
          kesslerActive={kesslerActive}
          onToggleRun={() => setRunning(r => !r)}
          onSpeedChange={setSimSpeed}
          onDebrisChange={setDebrisSlider}
          onZoomChange={setZoom}
          onToggleKessler={() => setKesslerActive(k => !k)}
          onReset={handleReset}
        />

        <Globe
          objectsRef={sim.objectsRef}
          frameRef={sim.frameRef}
          running={running}
          simSpeed={simSpeed}
          zoom={zoom}
          kesslerActive={kesslerActive}
          onZoomChange={setZoom}
          simTick={sim.tick}
        />

        <RightPanel
          stats={sim.stats}
          maneuverApplied={maneuverApplied}
          scenario={scenario}
          onManeuver={handleManeuver}
        />
      </div>
    </div>
  );
}
