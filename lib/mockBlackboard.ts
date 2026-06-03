import { CrisisSnapshot, ScenarioBranch, SequenceKey, SequenceFrame } from '@/types';

const initialBranches: ScenarioBranch[] = [
  {
    id: 'branch-alpha',
    label: 'Barrier + Pump Priority',
    probability: 42,
    resourceCost: '32 units',
    casualtyEstimate: '< 180',
    status: 'candidate'
  },
  {
    id: 'branch-beta',
    label: 'Evacuate Ward A First',
    probability: 67,
    resourceCost: '45 units',
    casualtyEstimate: '< 62',
    status: 'selected'
  },
  {
    id: 'branch-gamma',
    label: 'Protect Transit Spine',
    probability: 28,
    resourceCost: '21 units',
    casualtyEstimate: '< 210',
    status: 'rejected'
  }
];

export const initialSnapshot: CrisisSnapshot = {
  systemName: 'THRESHOLD',
  city: 'Metropolitan South Grid',
  sector: 'Sector 4',
  activeMutation: 'Baseline Event',
  threatIndex: 7.8,
  consensus: 82,
  reviewWindowSec: 180,
  forecastWindowMin: 120,
  agentCount: 4,
  triggerState: 'OBSERVING',
  hotspotLevel: 0.42,
  eventStream: [],
  debate: [],
  branches: initialBranches,
  writes: [],
  decision: {
    action: 'Monitor Sector 4',
    confidence: 78,
    reasoning: 'Observation phase only. Simulation branches are still diverging.',
    status: 'HUMAN_REVIEW'
  }
};

export const sequenceLabels: Record<SequenceKey, string> = {
  baseline: 'Baseline Flood Escalation',
  windShift: 'Wind Shift // Contamination Drift',
  bridgeCollapse: 'Bridge Collapse // Route Failure'
};

export const sequences: Record<SequenceKey, SequenceFrame[]> = {
  baseline: [
    {
      activeMutation: sequenceLabels.baseline,
      triggerState: 'OBSERVING',
      hotspotLevel: 0.46,
      appendEvents: [
        {
          agent: 'SENTINEL',
          phase: 'observe',
          severity: 'warning',
          message: 'Flood detected in Sector 4. Waterline rising 6.2cm per minute.'
        },
        {
          agent: 'SIMULACRA',
          phase: 'simulate',
          severity: 'info',
          message: 'Launching 3 branching futures against rainfall, transit, and drainage inputs.'
        }
      ],
      appendWrites: [
        {
          actor: 'SENTINEL',
          target: 'current_crisis_state/active.observation',
          payload: 'Flood detected in Sector 4.'
        },
        {
          actor: 'SIMULACRA',
          target: 'current_crisis_state/active.simulation',
          payload: 'Future branches requested. Forecast horizon 120 minutes.'
        }
      ]
    },
    {
      activeMutation: sequenceLabels.baseline,
      threatIndex: 8.4,
      consensus: 88,
      reviewWindowSec: 144,
      forecastWindowMin: 76,
      agentCount: 6,
      triggerState: 'SIMULATING',
      hotspotLevel: 0.58,
      branches: [
        {
          id: 'branch-alpha',
          label: 'Barrier + Pump Priority',
          probability: 39,
          resourceCost: '36 units',
          casualtyEstimate: '< 160',
          status: 'candidate'
        },
        {
          id: 'branch-beta',
          label: 'Evacuate Ward A First',
          probability: 72,
          resourceCost: '49 units',
          casualtyEstimate: '< 58',
          status: 'selected'
        },
        {
          id: 'branch-gamma',
          label: 'Protect Transit Spine',
          probability: 21,
          resourceCost: '24 units',
          casualtyEstimate: '< 230',
          status: 'rejected'
        }
      ],
      decision: {
        action: 'Prepare Evacuation Assets',
        confidence: 86,
        reasoning: 'Branch Beta now dominates on life-safety with acceptable infrastructure loss.'
      },
      appendEvents: [
        {
          agent: 'SIMULACRA',
          phase: 'simulate',
          severity: 'critical',
          message: 'No-action branch shows 20% of Sector 4 submerged in under 2 hours.'
        },
        {
          agent: 'COUNCIL',
          phase: 'debate',
          severity: 'warning',
          message: 'Debate started: Barrier retention versus staged evacuation.'
        }
      ],
      appendDebate: [
        {
          agent: 'PRAGMATIST',
          role: 'Life Safety',
          tone: 'cyan',
          content: 'Save the most people. Beta moves civilians before the drainage grid fails.'
        },
        {
          agent: 'ACCOUNTANT',
          role: 'Resource Discipline',
          tone: 'amber',
          content: 'Beta is expensive, but Gamma burns less budget while producing higher casualty risk.'
        },
        {
          agent: 'ETHICIST',
          role: 'Equity Check',
          tone: 'red',
          content: 'Beta protects the low-elevation ward first. Alpha leaves vulnerable housing exposed.'
        }
      ],
      appendWrites: [
        {
          actor: 'SIMULACRA',
          target: 'current_crisis_state/active.simulation',
          payload: 'Branch Beta highest survival score. Alpha degraded by drainage failure.'
        },
        {
          actor: 'COUNCIL',
          target: 'current_crisis_state/active.debate',
          payload: 'Council of Three in conflict. Awaiting judge synthesis.'
        }
      ]
    },
    {
      activeMutation: sequenceLabels.baseline,
      threatIndex: 9.1,
      consensus: 92,
      reviewWindowSec: 88,
      forecastWindowMin: 41,
      agentCount: 8,
      triggerState: 'HUMAN REVIEW',
      hotspotLevel: 0.74,
      decision: {
        action: 'Evacuate Ward A First',
        confidence: 92,
        reasoning: 'Optimized for life-safety over asset-protection. Beta now dominates across all three lenses.',
        status: 'AUTO_ARMED'
      },
      appendEvents: [
        {
          agent: 'JUDGE',
          phase: 'decide',
          severity: 'success',
          message: 'Strategy Beta selected. Evacuate Ward A first. Transit reroute appended.'
        },
        {
          agent: 'EXECUTOR',
          phase: 'deploy',
          severity: 'warning',
          message: 'Notification stack armed. Waiting on human approval or timeout threshold.'
        }
      ],
      appendDebate: [
        {
          agent: 'JUDGE',
          role: 'Synthesis',
          tone: 'gold',
          content: 'Consensus achieved. Beta preserves life, limits delay, and protects the most vulnerable zone first.'
        }
      ],
      appendWrites: [
        {
          actor: 'JUDGE',
          target: 'current_crisis_state/active.decision',
          payload: 'Strategy Beta: Evacuate Ward A first.'
        },
        {
          actor: 'EXECUTOR',
          target: 'current_crisis_state/active.pending_action',
          payload: 'SMS template loaded for 500 residents.'
        }
      ]
    }
  ],
  windShift: [
    {
      activeMutation: sequenceLabels.windShift,
      threatIndex: 9.2,
      consensus: 86,
      reviewWindowSec: 72,
      forecastWindowMin: 33,
      triggerState: 'VARIABLE SHIFT',
      hotspotLevel: 0.81,
      appendEvents: [
        {
          agent: 'SENTINEL',
          phase: 'observe',
          severity: 'critical',
          message: 'Wind vector shifted 18 degrees east. Contamination plume now drifting toward Ward C.'
        },
        {
          agent: 'COUNCIL',
          phase: 'debate',
          severity: 'warning',
          message: 'Previous route invalidated. Reopening debate on shelter and transit priorities.'
        }
      ],
      appendDebate: [
        {
          agent: 'PRAGMATIST',
          role: 'Life Safety',
          tone: 'cyan',
          content: 'Move evacuation corridor east immediately. Delay now creates double exposure.'
        },
        {
          agent: 'ACCOUNTANT',
          role: 'Resource Discipline',
          tone: 'amber',
          content: 'Reroute costs more fuel and staging time, but the old path is already compromised.'
        },
        {
          agent: 'ETHICIST',
          role: 'Equity Check',
          tone: 'red',
          content: 'Ward C has lower private vehicle ownership. Messaging has to go first, not last.'
        }
      ],
      appendWrites: [
        {
          actor: 'SENTINEL',
          target: 'current_crisis_state/active.environment_shift',
          payload: 'Wind shift detected. Downstream risk surface redrawn.'
        }
      ]
    },
    {
      activeMutation: sequenceLabels.windShift,
      threatIndex: 9.5,
      consensus: 93,
      reviewWindowSec: 46,
      forecastWindowMin: 25,
      triggerState: 'RE-DEBATE LOCKING',
      hotspotLevel: 0.88,
      branches: [
        {
          id: 'branch-delta',
          label: 'Reroute to Ward C Shelters',
          probability: 76,
          resourceCost: '58 units',
          casualtyEstimate: '< 74',
          status: 'selected'
        },
        {
          id: 'branch-epsilon',
          label: 'Hold Ward A / Seal East',
          probability: 31,
          resourceCost: '41 units',
          casualtyEstimate: '< 190',
          status: 'rejected'
        },
        {
          id: 'branch-zeta',
          label: 'Two-Front Split',
          probability: 44,
          resourceCost: '71 units',
          casualtyEstimate: '< 112',
          status: 'candidate'
        }
      ],
      decision: {
        action: 'Reroute Evacuation to Ward C',
        confidence: 94,
        reasoning: 'Wind drift invalidated the old path. Delta now dominates once mobility inequity is included.',
        status: 'AUTO_ARMED'
      },
      appendEvents: [
        {
          agent: 'JUDGE',
          phase: 'decide',
          severity: 'success',
          message: 'New dominant strategy: reroute to Ward C shelters and front-load public transit alerts.'
        }
      ],
      appendDebate: [
        {
          agent: 'JUDGE',
          role: 'Synthesis',
          tone: 'gold',
          content: 'Delta accepted. Old evacuation path is no longer ethically or operationally defensible.'
        }
      ],
      appendWrites: [
        {
          actor: 'JUDGE',
          target: 'current_crisis_state/active.decision',
          payload: 'Strategy Delta: Reroute to Ward C shelters.'
        }
      ]
    }
  ],
  bridgeCollapse: [
    {
      activeMutation: sequenceLabels.bridgeCollapse,
      threatIndex: 9.4,
      consensus: 84,
      reviewWindowSec: 58,
      forecastWindowMin: 29,
      triggerState: 'ROUTE FAILURE',
      hotspotLevel: 0.79,
      appendEvents: [
        {
          agent: 'SENTINEL',
          phase: 'observe',
          severity: 'critical',
          message: 'Bridge collapse detected on arterial route C-9. Primary convoy path lost.'
        },
        {
          agent: 'EXECUTOR',
          phase: 'deploy',
          severity: 'warning',
          message: 'All outbound movement paused pending route recomputation.'
        }
      ],
      appendDebate: [
        {
          agent: 'PRAGMATIST',
          role: 'Life Safety',
          tone: 'cyan',
          content: 'Use rail spine immediately. Road convoy delay is now fatal at the edge sectors.'
        },
        {
          agent: 'ACCOUNTANT',
          role: 'Resource Discipline',
          tone: 'amber',
          content: 'Rail surge is cheaper than rebuilding the route, but capacity will spike hard.'
        },
        {
          agent: 'ETHICIST',
          role: 'Equity Check',
          tone: 'red',
          content: 'Do not abandon mobility-impaired blocks near the bridge perimeter during the reroute.'
        }
      ],
      appendWrites: [
        {
          actor: 'SENTINEL',
          target: 'current_crisis_state/active.route_failure',
          payload: 'C-9 bridge collapse confirmed by image and telemetry fusion.'
        }
      ]
    },
    {
      activeMutation: sequenceLabels.bridgeCollapse,
      threatIndex: 9.7,
      consensus: 95,
      reviewWindowSec: 34,
      forecastWindowMin: 22,
      triggerState: 'ACTION REVISION',
      hotspotLevel: 0.9,
      branches: [
        {
          id: 'branch-rail',
          label: 'Rail Spine Surge',
          probability: 79,
          resourceCost: '54 units',
          casualtyEstimate: '< 88',
          status: 'selected'
        },
        {
          id: 'branch-road',
          label: 'Road Convoy Rebuild',
          probability: 18,
          resourceCost: '83 units',
          casualtyEstimate: '< 240',
          status: 'rejected'
        },
        {
          id: 'branch-hybrid',
          label: 'Hybrid Rail + Local Shuttle',
          probability: 61,
          resourceCost: '66 units',
          casualtyEstimate: '< 104',
          status: 'candidate'
        }
      ],
      decision: {
        action: 'Activate Rail Spine Surge',
        confidence: 95,
        reasoning: 'Rail surge wins once the bridge failure removes the convoy path. Hybrid remains reserve.',
        status: 'AUTO_ARMED'
      },
      appendEvents: [
        {
          agent: 'JUDGE',
          phase: 'decide',
          severity: 'success',
          message: 'Rail Spine Surge selected. Local shuttle reserve staged for mobility-impaired zones.'
        }
      ],
      appendDebate: [
        {
          agent: 'JUDGE',
          role: 'Synthesis',
          tone: 'gold',
          content: 'Rail dominates on speed while the reserve shuttle plan preserves access for cut-off communities.'
        }
      ],
      appendWrites: [
        {
          actor: 'JUDGE',
          target: 'current_crisis_state/active.decision',
          payload: 'Strategy Rail Spine Surge approved for execution queue.'
        }
      ]
    }
  ]
};
