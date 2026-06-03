import express from 'express';
import admin from 'firebase-admin';

const PORT = Number(process.env.PORT || 8080);
const BLACKBOARD_COLLECTION = process.env.BLACKBOARD_COLLECTION || 'current_crisis_state';
const BLACKBOARD_DOC = process.env.BLACKBOARD_DOC || 'active';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const app = express();
app.use(express.json({ limit: '1mb' }));

function setCors(req, res) {
  const origin = req.headers.origin;
  const allowAll = ALLOWED_ORIGINS.includes('*');
  if (allowAll) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-threshold-key');
}

app.use((req, res, next) => {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

function nowIst() {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());
}

function id(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function event(agent, phase, severity, message) {
  return { id: id('evt'), agent, phase, severity, message, timestamp: nowIst() };
}

function debate(agent, role, tone, content) {
  return { id: id('deb'), agent, role, tone, content };
}

function write(actor, target, payload) {
  return { id: id('wr'), actor, target, payload };
}

const common = {
  systemName: 'THRESHOLD',
  city: 'Metropolitan South Grid',
  agentCount: 8
};

function baselineSnapshot() {
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
      reasoning: 'Optimized for life-safety over asset-protection. Beta dominates across all three lenses.',
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
    branches: [
      { id: 'branch-alpha', label: 'Barrier + Pump Priority', probability: 39, resourceCost: '36 units', casualtyEstimate: '< 160', status: 'candidate' },
      { id: 'branch-beta', label: 'Evacuate Ward A First', probability: 72, resourceCost: '49 units', casualtyEstimate: '< 58', status: 'selected' },
      { id: 'branch-gamma', label: 'Protect Transit Spine', probability: 21, resourceCost: '24 units', casualtyEstimate: '< 230', status: 'rejected' }
    ],
    writes: [
      write('SENTINEL', 'current_crisis_state/active.observation', 'Flood detected in Sector 4.'),
      write('JUDGE', 'current_crisis_state/active.decision', 'Strategy Beta: Evacuate Ward A first.')
    ]
  };
}

function windShiftSnapshot() {
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
      reasoning: 'Wind drift invalidated the old path. Delta dominates once mobility inequity is included.',
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
    branches: [
      { id: 'branch-delta', label: 'Reroute to Ward C Shelters', probability: 76, resourceCost: '58 units', casualtyEstimate: '< 74', status: 'selected' },
      { id: 'branch-epsilon', label: 'Hold Ward A / Seal East', probability: 31, resourceCost: '41 units', casualtyEstimate: '< 190', status: 'rejected' },
      { id: 'branch-zeta', label: 'Two-Front Split', probability: 44, resourceCost: '71 units', casualtyEstimate: '< 112', status: 'candidate' }
    ],
    writes: [
      write('SENTINEL', 'current_crisis_state/active.environment_shift', 'Wind shift detected. Downstream risk surface redrawn.'),
      write('JUDGE', 'current_crisis_state/active.decision', 'Strategy Delta: Reroute to Ward C shelters.')
    ]
  };
}

function bridgeCollapseSnapshot() {
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
    branches: [
      { id: 'branch-rail', label: 'Rail Spine Surge', probability: 79, resourceCost: '54 units', casualtyEstimate: '< 88', status: 'selected' },
      { id: 'branch-road', label: 'Road Convoy Rebuild', probability: 18, resourceCost: '83 units', casualtyEstimate: '< 240', status: 'rejected' },
      { id: 'branch-hybrid', label: 'Hybrid Rail + Local Shuttle', probability: 61, resourceCost: '66 units', casualtyEstimate: '< 104', status: 'candidate' }
    ],
    writes: [
      write('SENTINEL', 'current_crisis_state/active.route_failure', 'C-9 bridge collapse confirmed by image and telemetry fusion.'),
      write('JUDGE', 'current_crisis_state/active.decision', 'Strategy Rail Spine Surge approved for execution queue.')
    ]
  };
}

function snapshotForTrigger(trigger) {
  if (trigger === 'wind-shift') return windShiftSnapshot();
  if (trigger === 'bridge-collapse') return bridgeCollapseSnapshot();
  return baselineSnapshot();
}

async function writeSnapshot(snapshot) {
  await db.collection(BLACKBOARD_COLLECTION).doc(BLACKBOARD_DOC).set(
    {
      ...snapshot,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
  return snapshot;
}

async function patchDecision(status, triggerState, agentMessage) {
  const ref = db.collection(BLACKBOARD_COLLECTION).doc(BLACKBOARD_DOC);
  const currentSnap = await ref.get();
  const current = currentSnap.exists ? currentSnap.data() : baselineSnapshot();
  const currentEvents = Array.isArray(current.eventStream) ? current.eventStream : [];
  const currentWrites = Array.isArray(current.writes) ? current.writes : [];

  const patch = {
    triggerState,
    decision: {
      ...(current.decision || {}),
      status
    },
    eventStream: [
      ...currentEvents,
      event(status === 'REJECTED' ? 'OPERATOR' : 'EXECUTOR', 'control', status === 'REJECTED' ? 'warning' : 'success', agentMessage)
    ].slice(-18),
    writes: [
      ...currentWrites,
      write(status === 'REJECTED' ? 'OPERATOR' : 'EXECUTOR', 'current_crisis_state/active.operator_command', agentMessage)
    ].slice(-8),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await ref.set(patch, { merge: true });
  return patch;
}

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'threshold-agent-backend', time: new Date().toISOString() });
});

app.post('/trigger/:scenario', async (req, res) => {
  try {
    const snapshot = snapshotForTrigger(req.params.scenario);
    await writeSnapshot(snapshot);
    res.json({ ok: true, scenario: req.params.scenario, snapshot });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Failed to write trigger scenario.' });
  }
});

app.post('/decision/approve', async (req, res) => {
  try {
    const patch = await patchDecision('APPROVED', 'EXECUTING', 'Approval received. Selected response entering execution queue.');
    res.json({ ok: true, patch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Failed to approve decision.' });
  }
});

app.post('/decision/reject', async (req, res) => {
  try {
    const patch = await patchDecision('REJECTED', 'REVIEW OVERRIDE', 'Human override issued. Returning decision to council.');
    res.json({ ok: true, patch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Failed to reject decision.' });
  }
});

app.listen(PORT, () => {
  console.log(`THRESHOLD agent backend listening on ${PORT}`);
});
