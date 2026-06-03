import { BlackboardWrite, CrisisSnapshot, SequenceKey } from '@/types';

interface TacticalMapProps {
  snapshot: CrisisSnapshot;
  onMutation: (key: SequenceKey) => void;
  onReset: () => void;
  controlsDisabled: boolean;
}

const controlOptions: Array<{ key: SequenceKey; label: string; description: string }> = [
  { key: 'baseline', label: 'Baseline', description: 'Flood escalation' },
  { key: 'windShift', label: 'Wind Shift', description: 'Contamination drift' },
  { key: 'bridgeCollapse', label: 'Bridge Collapse', description: 'Route failure' }
];

const activeLabels: Record<SequenceKey, string> = {
  baseline: 'Baseline Flood Escalation',
  windShift: 'Wind Shift // Contamination Drift',
  bridgeCollapse: 'Bridge Collapse // Route Failure'
};

function pathForMutation(key: string) {
  switch (key) {
    case 'Wind Shift // Contamination Drift':
      return 'M170 460C260 420 330 356 470 342S690 260 822 186';
    case 'Bridge Collapse // Route Failure':
      return 'M120 360C260 300 360 240 470 240S692 322 850 430';
    default:
      return 'M148 508C278 406 368 352 468 316S680 234 828 242';
  }
}

function latestWrites(writes: BlackboardWrite[]) {
  return [...writes].slice(-4).reverse();
}

export function TacticalMap({
  snapshot,
  onMutation,
  onReset,
  controlsDisabled
}: TacticalMapProps) {
  const hotspotRadius = 110 + snapshot.hotspotLevel * 96;
  const ringRadius = 44 + snapshot.hotspotLevel * 40;
  const actionPath = pathForMutation(snapshot.activeMutation);

  return (
    <section className="panel map-panel motion-panel-center motion-reveal">
      <div className="map-ambient map-ambient-cyan" />
      <div className="map-ambient map-ambient-red" />

      <div className="map-overlay top-left">
        <span className="micro-label">System</span>
        <strong>{snapshot.systemName}</strong>
        <small>{snapshot.city}</small>
      </div>
      <div className="map-overlay top-right">
        <span className="micro-label">Trigger State</span>
        <strong>{snapshot.triggerState}</strong>
        <small>{snapshot.activeMutation}</small>
      </div>
      <div className="map-overlay bottom-left">
        <span className="micro-label">Sector</span>
        <strong>{snapshot.sector}</strong>
        <small>{snapshot.agentCount} active agents</small>
      </div>

      <div className="mutation-bar">
        {controlOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`mutation-chip ${snapshot.activeMutation === activeLabels[option.key] ? 'active' : ''}`}
            onClick={() => onMutation(option.key)}
            disabled={controlsDisabled}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
        <button type="button" className="mutation-chip reset-chip" onClick={onReset} disabled={controlsDisabled}>
          Reset
        </button>
      </div>

      <div className="map-stage">
        <svg className="tactical-map" viewBox="0 0 960 620" role="img" aria-label="Tactical city map with live crisis overlays">
          <defs>
            <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,97,97,0.88)" />
              <stop offset="35%" stopColor="rgba(255,97,97,0.42)" />
              <stop offset="100%" stopColor="rgba(255,97,97,0)" />
            </radialGradient>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#67f2ff" stopOpacity="0.12" />
              <stop offset="58%" stopColor="#67f2ff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffbf4d" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="scanBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(103,242,255,0)" />
              <stop offset="50%" stopColor="rgba(103,242,255,0.2)" />
              <stop offset="100%" stopColor="rgba(103,242,255,0)" />
            </linearGradient>
            <filter id="mapGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g className="map-grid-lines">
            {Array.from({ length: 12 }).map((_, index) => (
              <line key={`h-${index}`} x1="0" y1={50 + index * 48} x2="960" y2={50 + index * 48} />
            ))}
            {Array.from({ length: 16 }).map((_, index) => (
              <line key={`v-${index}`} x1={44 + index * 56} y1="0" x2={44 + index * 56} y2="620" />
            ))}
          </g>

          <g className="sector-diagonals">
            <path d="M48 70L300 320L418 210L584 400L896 114" />
            <path d="M130 566L334 360L510 488L734 294L914 474" />
          </g>

          <g className="city-blocks">
            <rect x="74" y="64" width="128" height="88" />
            <rect x="230" y="86" width="184" height="110" />
            <rect x="458" y="72" width="104" height="88" />
            <rect x="592" y="104" width="168" height="102" />
            <rect x="790" y="74" width="94" height="124" />
            <rect x="98" y="234" width="112" height="138" />
            <rect x="248" y="252" width="150" height="120" />
            <rect x="434" y="236" width="116" height="94" />
            <rect x="580" y="250" width="174" height="126" />
            <rect x="772" y="236" width="116" height="150" />
            <rect x="82" y="426" width="154" height="106" />
            <rect x="278" y="410" width="128" height="104" />
            <rect x="434" y="388" width="138" height="94" />
            <rect x="610" y="408" width="150" height="118" />
            <rect x="792" y="412" width="94" height="86" />
          </g>

          <g className="road-network">
            <path d="M32 182H924" />
            <path d="M32 372H924" />
            <path d="M104 24V594" />
            <path d="M420 24V594" />
            <path d="M694 24V594" />
            <path d="M156 78L334 214L498 176L662 294L832 256" />
            <path d="M148 526L296 392L520 454L708 344L886 386" />
          </g>

          <g className="data-streams" filter="url(#mapGlow)">
            <path d="M110 152C232 184 278 170 370 234S590 334 744 278 840 214 906 238" />
            <path d="M96 488C198 418 278 382 358 408S534 470 658 420 792 350 890 322" />
          </g>

          <g className="hotspot-group">
            <circle cx="594" cy="300" r={hotspotRadius} fill="url(#heatGradient)" className="heat-zone" />
            <circle cx="594" cy="300" r={ringRadius} className="ring ring-a" />
            <circle cx="594" cy="300" r={ringRadius + 34} className="ring ring-b" />
            <circle cx="594" cy="300" r={ringRadius + 78} className="ring ring-c" />
            <path className="orbit orbit-a" d="M472 258C520 210 650 200 720 268" />
            <path className="orbit orbit-b" d="M476 366C556 432 666 428 754 354" />
            <path className="scan-sweep" d="M594 300L784 230A208 208 0 0 1 760 430Z" />
            <circle cx="594" cy="300" r="8" className="core-dot" />
            <circle cx="524" cy="258" r="5" className="action-route-node" />
            <circle cx="686" cy="352" r="5" className="action-route-node" />
            <circle cx="638" cy="408" r="4" className="action-route-node" />
            <line x1="552" y1="300" x2="636" y2="300" className="crosshair" />
            <line x1="594" y1="258" x2="594" y2="342" className="crosshair" />
          </g>

          <path className="action-path" d={actionPath} />

          <g className="coord-text">
            <text x="88" y="50">A1</text>
            <text x="408" y="50">C1</text>
            <text x="688" y="50">E1</text>
            <text x="88" y="210">A2</text>
            <text x="408" y="210">C2</text>
            <text x="688" y="210">E2</text>
            <text x="88" y="392">A3</text>
            <text x="408" y="392">C3</text>
            <text x="688" y="392">E3</text>
            <text x="636" y="286" className="alert-label">
              {snapshot.sector.toUpperCase()} // ACTIVE ZONE
            </text>
            <text x="648" y="430" className="alert-subcopy">
              FORECAST PATH // AUTONOMOUS LOCK
            </text>
          </g>
        </svg>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-swatch legend-threat" />
          <div>
            <strong>Threat corridor</strong>
            <small>Heat radius expands with live risk state</small>
          </div>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-route" />
          <div>
            <strong>Response path</strong>
            <small>Selected branch rendered across the metro grid</small>
          </div>
        </div>
      </div>

      <div className="blackboard-stack">
        {latestWrites(snapshot.writes).map((write) => (
          <article key={write.id} className="write-card">
            <span className="micro-label">{write.actor}</span>
            <strong>{write.target}</strong>
            <p>{write.payload}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
