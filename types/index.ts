export type Severity = 'info' | 'warning' | 'critical' | 'success';
export type Tone = 'cyan' | 'amber' | 'red' | 'gold';
export type SequenceKey = 'baseline' | 'windShift' | 'bridgeCollapse';
export type DecisionStatus =
  | 'HUMAN_REVIEW'
  | 'AUTO_ARMED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTED';

export interface BlackboardEvent {
  id: string;
  agent: string;
  phase: string;
  message: string;
  severity: Severity;
  timestamp: string;
}

export interface DebateMessage {
  id: string;
  agent: string;
  role: string;
  content: string;
  tone: Tone;
}

export interface ScenarioBranch {
  id: string;
  label: string;
  probability: number;
  resourceCost: string;
  casualtyEstimate: string;
  status: 'candidate' | 'rejected' | 'selected';
}

export interface BlackboardWrite {
  id: string;
  actor: string;
  target: string;
  payload: string;
}

export interface DecisionState {
  action: string;
  confidence: number;
  reasoning: string;
  status: DecisionStatus;
}

export interface CrisisSnapshot {
  systemName: string;
  city: string;
  sector: string;
  activeMutation: string;
  threatIndex: number;
  consensus: number;
  reviewWindowSec: number;
  forecastWindowMin: number;
  agentCount: number;
  triggerState: string;
  hotspotLevel: number;
  eventStream: BlackboardEvent[];
  debate: DebateMessage[];
  branches: ScenarioBranch[];
  writes: BlackboardWrite[];
  decision: DecisionState;
}

export interface SequenceFrame {
  sector?: string;
  activeMutation?: string;
  threatIndex?: number;
  consensus?: number;
  reviewWindowSec?: number;
  forecastWindowMin?: number;
  agentCount?: number;
  triggerState?: string;
  hotspotLevel?: number;
  branches?: ScenarioBranch[];
  decision?: Partial<DecisionState>;
  appendEvents?: Array<Omit<BlackboardEvent, 'id' | 'timestamp'>>;
  appendDebate?: Array<Omit<DebateMessage, 'id'>>;
  appendWrites?: Array<Omit<BlackboardWrite, 'id'>>;
}
