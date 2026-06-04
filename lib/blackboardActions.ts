import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb, getBlackboardPath } from '@/lib/firebaseAdmin';
import { applyGeminiPayload, generateGeminiReasoning } from '@/lib/geminiReasoning';
import type { BlackboardEvent, BlackboardWrite, CrisisSnapshot, DebateMessage, ScenarioBranch } from '@/types';

type TriggerKey = 'baseline' | 'wind-shift' | 'bridge-collapse';

function stampTime(): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function event(agent: string, phase: string, severity: BlackboardEvent['severity'], message: string): BlackboardEvent {
  return {
    id: makeId('evt'),
    agent,
    phase,
    severity,
    message,
    timestamp: stampTime()
  };
}

function debate(agent: string, role: string, tone: DebateMessage['tone'], content: string): DebateMessage {
  return {
    id: makeId('deb'),
    agent,
    role,
    tone,
    content
  };
}

function write(actor: string, target: string, payload: string): BlackboardWrite {
  return {
    id: makeId('wr'),
    actor,
    target,
    payload
  };
}

const common = {
  systemName: 'THRESHOLD',
  city: 'Metropolitan South Grid',
  agentCount: 8
};

const baselineBranches: ScenarioBranch[] = [
  { id: 'branch-alpha', label: 'Barrier + Pump Priority', probability: 39, resourceCost: '36 units', casualtyEstimate: '< 160', status: 'candidate' },
  { id: 'branch-beta', label: 'Evacuate Ward A First', probability: 72, resourceCost: '49 units', casualtyEstimate: '< 58', status: 'selected' },
  { id: 'branch-gamma', label: 'Protect Transit Spine', probability: 21, resourceCost: '24 units', casualtyEstimate: '< 230', status: 'rejected' }
];

const windBranches: ScenarioBranch[] = [
  { id: 'branch-delta', label: 'Reroute to Ward C Shelters', probability: 76, resourceCost: '58 units', casualtyEstimate: '< 74', status: 'selected' },
  { id: 'branch-epsilon', label: 'Hold Ward A / Seal East', probability: 31, resourceCost: '41 units', casualtyEstimate: '< 190', status: 'rejected' },
  { id: 'branch-zeta', label: 'Two-Front Split', probability: 44, resourceCost: '71 units', casualtyEstimate: '< 112', status: 'candidate' }
];

const bridgeBranches: ScenarioBranch[] = [
  { id: 'branch-rail', label: 'Rail Spine Surge', probability: 79, resourceCost: '54 units', casualtyEstimate: '< 88', status: 'selected' },
  { id: 'branch-road', label: 'Road Convoy Rebuild', probability: 18, resourceCost: '83 units', casualtyEstimate: '< 240', status: 'rejected' },
  { id: 'branch-hybrid', label: 'Hybrid Rail + Local Shuttle', probability: 61, resourceCost: '66 units', casualtyEstimate: '< 104', status: 'candidate' }
];

function baselineSnapshot(): CrisisSnapshot {
  return {
    ...common,
    sector: 'Sector 4',
    activeMutation: 'Baseline Flood Escalation',
    threatIndex: 9.1,
    consensus: 92,
    reviewWindowSec: 88,
    forecastWindowMin: 41,
    triggerState: 'HUMAN REVIEW',
    hotspotLevel: 0.74,
    decision: {
      action: 'Evacuate Ward A First',
      confidence: 92,
      reasoning: 'Optimized for life-safety over asset-protection. Beta now dominates across all three lenses.',
      status: 'AUTO_ARMED'
    },
    eventStream: [
      event('SENTINEL', 'observe', 'warning', 'Flood detected in Sector 4. Waterline rising 6.2cm per minute.'),
      event('SIMULACRA', 'simulate', 'critical', 'No-action branch shows 20% of Sector 4 submerged in under 2 hours.'),
      event('COUNCIL', 'debate', 'warning', 'Debate started: Barrier retention versus staged evacuation.'),
      event('JUDGE', 'decide', 'success', 'Strategy Beta selected. Evacuate Ward A first.')
    ],
    debate: [
      debate('PRAGMATIST', 'Life Safety', 'cyan', 'Save the most people. Beta moves civilians before the drainage grid fails.'),
      debate('ACCOUNTANT', 'Resource Discipline', 'amber', 'Beta is expensive, but Gamma burns less budget while producing higher casualty risk.'),
      debate('ETHICIST', 'Equity Check', 'red', 'Beta protects the low-elevation ward first. Alpha leaves vulnerable housing exposed.'),
      debate('JUDGE', 'Synthesis', 'gold', 'Consensus achieved. Beta preserves life, limits delay, and protects the most vulnerable zone first.')
    ],
    branches: baselineBranches,
    writes: [
      write('SENTINEL', 'current_crisis_state/active.observation', 'Flood detected in Sector 4.'),
      write('JUDGE', 'current_crisis_state/active.decision', 'Strategy Beta: Evacuate Ward A first.')
    ]
  };
}

function windShiftSnapshot(): CrisisSnapshot {
  return {
    ...common,
    sector: 'Ward C',
    activeMutation: 'Wind Shift // Contamination Drift',
    threatIndex: 9.5,
    consensus: 93,
    reviewWindowSec: 46,
    forecastWindowMin: 25,
    triggerState: 'RE-DEBATE LOCKING',
    hotspotLevel: 0.88,
    decision: {
      action: 'Reroute Evacuation to Ward C',
      confidence: 94,
      reasoning: 'Wind drift invalidated the old path. Delta now dominates once mobility inequity is included.',
      status: 'AUTO_ARMED'
    },
    eventStream: [
      event('SENTINEL', 'observe', 'critical', 'Wind vector shifted 18 degrees east. Contamination plume now drifting toward Ward C.'),
      event('COUNCIL', 'debate', 'warning', 'Previous route invalidated. Reopening debate on shelter and transit priorities.'),
      event('JUDGE', 'decide', 'success', 'New dominant strategy: reroute to Ward C shelters and front-load public transit alerts.')
    ],
    debate: [
      debate('PRAGMATIST', 'Life Safety', 'cyan', 'Move evacuation corridor east immediately. Delay now creates double exposure.'),
      debate('ACCOUNTANT', 'Resource Discipline', 'amber', 'Reroute costs more fuel and staging time, but the old path is already compromised.'),
      debate('ETHICIST', 'Equity Check', 'red', 'Ward C has lower private vehicle ownership. Messaging has to go first, not last.'),
      debate('JUDGE', 'Synthesis', 'gold', 'Delta accepted. Old evacuation path is no longer ethically or operationally defensible.')
    ],
    branches: windBranches,
    writes: [
      write('SENTINEL', 'current_crisis_state/active.environment_shift', 'Wind shift detected. Downstream risk surface redrawn.'),
      write('JUDGE', 'current_crisis_state/active.decision', 'Strategy Delta: Reroute to Ward C shelters.')
    ]
  };
}

function bridgeCollapseSnapshot(): CrisisSnapshot {
  return {
    ...common,
    sector: 'C-9 Spine',
    activeMutation: 'Bridge Collapse // Route Failure',
    threatIndex: 9.7,
    consensus: 95,
    reviewWindowSec: 34,
    forecastWindowMin: 22,
    triggerState: 'ACTION REVISION',
    hotspotLevel: 0.9,
    decision: {
      action: 'Activate Rail Spine Surge',
      confidence: 95,
      reasoning: 'Rail surge wins once the bridge failure removes the convoy path. Hybrid remains reserve.',
      status: 'AUTO_ARMED'
    },
    eventStream: [
      event('SENTINEL', 'observe', 'critical', 'Bridge collapse detected on arterial route C-9. Primary convoy path lost.'),
      event('EXECUTOR', 'deploy', 'warning', 'All outbound movement paused pending route recomputation.'),
      event('JUDGE', 'decide', 'success', 'Rail Spine Surge selected. Local shuttle reserve staged for mobility-impaired zones.')
    ],
    debate: [
      debate('PRAGMATIST', 'Life Safety', 'cyan', 'Use rail spine immediately. Road convoy delay is now fatal at the edge sectors.'),
      debate('ACCOUNTANT', 'Resource Discipline', 'amber', 'Rail surge is cheaper than rebuilding the route, but capacity will spike hard.'),
      debate('ETHICIST', 'Equity Check', 'red', 'Do not abandon mobility-impaired blocks near the bridge perimeter during the reroute.'),
      debate('JUDGE', 'Synthesis', 'gold', 'Rail dominates on speed while the reserve shuttle plan preserves access for cut-off communities.')
    ],
    branches: bridgeBranches,
    writes: [
      write('SENTINEL', 'current_crisis_state/active.route_failure', 'C-9 bridge collapse confirmed by image and telemetry fusion.'),
      write('JUDGE', 'current_crisis_state/active.decision', 'Strategy Rail Spine Surge approved for execution queue.')
    ]
  };
}

function snapshotForTrigger(trigger: TriggerKey): CrisisSnapshot {
  if (trigger === 'wind-shift') return windShiftSnapshot();
  if (trigger === 'bridge-collapse') return bridgeCollapseSnapshot();
  return baselineSnapshot();
}

async function activeDocumentRef() {
  const db = getAdminDb();
  const path = getBlackboardPath();
  return db.collection(path.collection).doc(path.document);
}

export async function writeTriggerScenario(trigger: TriggerKey) {
  const ref = await activeDocumentRef();
  let snapshot = snapshotForTrigger(trigger);

  try {
    const geminiPayload = await generateGeminiReasoning(trigger, snapshot);
    if (geminiPayload) {
      snapshot = applyGeminiPayload(snapshot, geminiPayload);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown Gemini error';
    console.error('Gemini reasoning failed. Falling back to scripted scenario.', error);
    snapshot = {
      ...snapshot,
      eventStream: [
        ...snapshot.eventStream,
        event('GEMINI', 'reason', 'warning', `Gemini fallback used: ${reason.slice(0, 120)}`)
      ].slice(-18),
      writes: [
        ...snapshot.writes,
        write('GEMINI', 'current_crisis_state/active.reasoning_error', 'Gemini generation failed; scripted branch used.')
      ].slice(-8)
    };
  }

  await ref.set(
    {
      ...snapshot,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return snapshot;
}

export async function patchDecision(status: 'APPROVED' | 'REJECTED') {
  const ref = await activeDocumentRef();
  const currentSnap = await ref.get();
  const current = currentSnap.exists ? (currentSnap.data() as Partial<CrisisSnapshot>) : baselineSnapshot();
  const currentEvents = Array.isArray(current.eventStream) ? current.eventStream : [];
  const currentWrites = Array.isArray(current.writes) ? current.writes : [];

  const isRejected = status === 'REJECTED';
  const message = isRejected
    ? 'Human override issued. Returning decision to council.'
    : `Approval received. ${current.decision?.action || 'Selected response'} entering execution queue.`;

  const patch = {
    triggerState: isRejected ? 'REVIEW OVERRIDE' : 'EXECUTING',
    decision: {
      ...(current.decision || {}),
      status
    },
    eventStream: [
      ...currentEvents,
      event(isRejected ? 'OPERATOR' : 'EXECUTOR', 'control', isRejected ? 'warning' : 'success', message)
    ].slice(-18),
    writes: [
      ...currentWrites,
      write(isRejected ? 'OPERATOR' : 'EXECUTOR', 'current_crisis_state/active.operator_command', message)
    ].slice(-8),
    updatedAt: FieldValue.serverTimestamp()
  };

  await ref.set(patch, { merge: true });
  return patch;
}
