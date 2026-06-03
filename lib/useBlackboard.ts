'use client';

import { useEffect, useMemo, useState } from 'react';

import { getClientFirebaseApp, hasFirebaseConfig } from '@/lib/firebase';
import { initialSnapshot, sequenceLabels, sequences } from '@/lib/mockBlackboard';
import {
  BlackboardEvent,
  BlackboardWrite,
  CrisisSnapshot,
  DebateMessage,
  DecisionStatus,
  SequenceFrame,
  SequenceKey
} from '@/types';

const BLACKBOARD_DOC = process.env.NEXT_PUBLIC_FIRESTORE_BLACKBOARD_DOC || 'active';
const DEFAULT_TO_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';

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
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function eventRecord(
  event: Omit<BlackboardEvent, 'id' | 'timestamp'>
): BlackboardEvent {
  return {
    ...event,
    id: makeId('evt'),
    timestamp: stampTime()
  };
}

function writeRecord(write: Omit<BlackboardWrite, 'id'>): BlackboardWrite {
  return {
    ...write,
    id: makeId('wr')
  };
}

function debateRecord(message: Omit<DebateMessage, 'id'>): DebateMessage {
  return {
    ...message,
    id: makeId('deb')
  };
}

function normalizeSnapshot(snapshot: Partial<CrisisSnapshot>): CrisisSnapshot {
  return {
    ...initialSnapshot,
    ...snapshot,
    branches: snapshot.branches ?? initialSnapshot.branches,
    writes: snapshot.writes ?? initialSnapshot.writes,
    eventStream: snapshot.eventStream ?? initialSnapshot.eventStream,
    debate: snapshot.debate ?? initialSnapshot.debate,
    decision: {
      ...initialSnapshot.decision,
      ...(snapshot.decision ?? {})
    }
  };
}

function applyFrame(
  base: CrisisSnapshot,
  frame: SequenceFrame,
  label: string
): CrisisSnapshot {
  return {
    ...base,
    activeMutation: frame.activeMutation ?? label,
    sector: frame.sector ?? base.sector,
    threatIndex: frame.threatIndex ?? base.threatIndex,
    consensus: frame.consensus ?? base.consensus,
    reviewWindowSec: frame.reviewWindowSec ?? base.reviewWindowSec,
    forecastWindowMin: frame.forecastWindowMin ?? base.forecastWindowMin,
    agentCount: frame.agentCount ?? base.agentCount,
    triggerState: frame.triggerState ?? base.triggerState,
    hotspotLevel: frame.hotspotLevel ?? base.hotspotLevel,
    branches: frame.branches ?? base.branches,
    eventStream: [
      ...base.eventStream,
      ...(frame.appendEvents ?? []).map((entry) => eventRecord(entry))
    ].slice(-18),
    debate: [
      ...base.debate,
      ...(frame.appendDebate ?? []).map((entry) => debateRecord(entry))
    ].slice(-8),
    writes: [
      ...base.writes,
      ...(frame.appendWrites ?? []).map((entry) => writeRecord(entry))
    ].slice(-8),
    decision: {
      ...base.decision,
      ...(frame.decision ?? {})
    }
  };
}

function controlEvent(
  agent: string,
  message: string,
  severity: BlackboardEvent['severity']
): BlackboardEvent {
  return eventRecord({
    agent,
    phase: 'control',
    message,
    severity
  });
}

function controlWrite(actor: string, payload: string): BlackboardWrite {
  return writeRecord({
    actor,
    target: 'current_crisis_state/active.operator_command',
    payload
  });
}

export function useBlackboard() {
  const [snapshot, setSnapshot] = useState<CrisisSnapshot>(initialSnapshot);
  const [modeLabel, setModeLabel] = useState('Demo Blackboard');
  const [sequenceKey, setSequenceKey] = useState<SequenceKey>('baseline');
  const [sequenceVersion, setSequenceVersion] = useState(0);
  const [firestoreEnabled, setFirestoreEnabled] = useState(false);
  const [demoActive, setDemoActive] = useState(DEFAULT_TO_DEMO || !hasFirebaseConfig());

  const canUseFirestore = useMemo(
    () => !DEFAULT_TO_DEMO && hasFirebaseConfig(),
    []
  );

  useEffect(() => {
    if (!canUseFirestore) {
      setFirestoreEnabled(false);
      setDemoActive(true);
      return;
    }

    let unsub: undefined | (() => void);
    let cancelled = false;

    setModeLabel('Firestore Blackboard');
    setDemoActive(false);

    (async () => {
      try {
        const { doc, getFirestore, onSnapshot } = await import('firebase/firestore');
        const app = getClientFirebaseApp();
        const db = getFirestore(app);

        if (cancelled) return;

        setFirestoreEnabled(true);
        unsub = onSnapshot(
          doc(db, 'current_crisis_state', BLACKBOARD_DOC),
          (docSnapshot) => {
            if (!docSnapshot.exists()) return;
            setSnapshot(normalizeSnapshot(docSnapshot.data() as Partial<CrisisSnapshot>));
          },
          () => {
            setModeLabel('Demo Blackboard (fallback)');
            setFirestoreEnabled(false);
            setDemoActive(true);
          }
        );
      } catch {
        setModeLabel('Demo Blackboard (fallback)');
        setFirestoreEnabled(false);
        setDemoActive(true);
      }
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [canUseFirestore]);

  useEffect(() => {
    if (firestoreEnabled || !demoActive) return;

    const frames = sequences[sequenceKey];
    const label = sequenceLabels[sequenceKey];
    let frameIndex = 0;

    setModeLabel('Demo Blackboard');
    setSnapshot(applyFrame(normalizeSnapshot({ ...initialSnapshot, activeMutation: label }), frames[0], label));

    const interval = window.setInterval(() => {
      frameIndex += 1;
      if (frameIndex >= frames.length) {
        window.clearInterval(interval);
        return;
      }

      setSnapshot((current) => applyFrame(current, frames[frameIndex], label));
    }, 2600);

    return () => window.clearInterval(interval);
  }, [demoActive, firestoreEnabled, sequenceKey, sequenceVersion]);

  const triggerMutation = (nextKey: SequenceKey) => {
    if (firestoreEnabled) return;
    setSequenceKey(nextKey);
    setSequenceVersion((current) => current + 1);
  };

  const approveDecision = () => {
    setSnapshot((current) => {
      const nextStatus: DecisionStatus = 'APPROVED';
      return {
        ...current,
        triggerState: 'EXECUTING',
        decision: {
          ...current.decision,
          status: nextStatus
        },
        eventStream: [
          ...current.eventStream,
          controlEvent(
            'EXECUTOR',
            `Approval received. ${current.decision.action} entering execution queue.`,
            'success'
          )
        ].slice(-18),
        writes: [
          ...current.writes,
          controlWrite('EXECUTOR', `Approved action: ${current.decision.action}`)
        ].slice(-8)
      };
    });

    window.setTimeout(() => {
      setSnapshot((current) => ({
        ...current,
        triggerState: 'EXECUTED',
        decision: {
          ...current.decision,
          status: 'EXECUTED'
        },
        eventStream: [
          ...current.eventStream,
          controlEvent('EXECUTOR', 'Outbound messages sent. Resource dispatch has begun.', 'success')
        ].slice(-18)
      }));
    }, 1500);
  };

  const rejectDecision = () => {
    setSnapshot((current) => ({
      ...current,
      triggerState: 'REVIEW OVERRIDE',
      decision: {
        ...current.decision,
        status: 'REJECTED'
      },
      eventStream: [
        ...current.eventStream,
        controlEvent('OPERATOR', 'Human override issued. Returning decision to council.', 'warning')
      ].slice(-18),
      writes: [
        ...current.writes,
        controlWrite('OPERATOR', 'Decision rejected. Reopen debate and resimulate.')
      ].slice(-8)
    }));
  };

  return {
    snapshot,
    modeLabel,
    isFirestoreLive: firestoreEnabled,
    triggerMutation,
    approveDecision,
    rejectDecision,
    resetDemo: () => {
      setSequenceKey('baseline');
      setSequenceVersion((current) => current + 1);
    }
  };
}
